import PointsListView from '/src/view/points-list-view.js';
import LoadingView from '/src/view/loading-view.js';
import SortView from '/src/view/sort-view.js';
import PointPresenter from './point-presenter.js';
import NewPointPresenter from './new-point-presenter.js';
import { render, remove } from '../framework/render.js';

import { SortType, UpdateType, FilterType, UserAction } from '/src/const.js';
import { filterPoints } from '/src/utils/filter.js';
import NoPointView from '/src/view/no-point-view.js';
import { DataAdapter } from '/src/utils/data-adapter.js';

export default class Presenter {
  #pointsListComponent = new PointsListView();
  #sortComponent = null;
  #newEventButtonComponent = null;

  #pointPresenters = new Map();
  #pointsModel = null;
  #destinationsModel = null;
  #offersModel = null;
  #filterModel = null;

  #currentSortType = SortType.DAY;
  #renderedPoints = [];
  #noPointComponent = null;
  #newPointPresenter = null;
  #newEventButtonElement = null;

  #loadingComponent = null;

  constructor({
    pointsModel,
    destinationsModel,
    offersModel,
    filterModel
  }) {
    this.#pointsModel = pointsModel;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#filterModel = filterModel;

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  async init() {
    this.#initExistingNewEventButton();
    this.#showLoading();

    this.#initExistingNewEventButton();

    this.#sortComponent = new SortView({
      onSortTypeChange: this.#handleSortTypeChange
    });
    const eventsSection = document.querySelector('.trip-events');
    if (!eventsSection) {
      return;
    }

    try {
      this.#hideLoading();
      render(this.#sortComponent, eventsSection);
      render(this.#pointsListComponent, eventsSection);
      this.#renderAllPoints();

    } catch (error) {
      this.#hideLoading();
      this.#renderNoPoints();
    }
  }


  #showLoading() {
    if (this.#loadingComponent) {
      remove(this.#loadingComponent);
    }

    this.#loadingComponent = new LoadingView();
    const eventsSection = document.querySelector('.trip-events');
    render(this.#loadingComponent, eventsSection);
  }

  #hideLoading() {

    const loadingElement = document.querySelector('.trip-events__msg');
    if (loadingElement && loadingElement.textContent === 'Loading...') {
      loadingElement.remove();
    }

    if (this.#loadingComponent) {
      remove(this.#loadingComponent);
      this.#loadingComponent = null;
    }
  }

  #initExistingNewEventButton() {
    const newEventButton = document.querySelector('.trip-main__event-add-btn');

    if (!newEventButton) {
      return;
    }


    this.#newEventButtonElement = newEventButton;

    newEventButton.addEventListener('click', this.#handleNewEventButtonClick);
  }

  #handleNewEventButtonClick = () => {

    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);

    this.#currentSortType = SortType.DAY;
    if (this.#sortComponent) {
      this.#sortComponent.setSortType(SortType.DAY);
    }

    this.#handleModeChange();

    this.createPoint();
  };

  createPoint() {
    if (this.#newPointPresenter) {
      return;
    }


    this.#newPointPresenter = new NewPointPresenter({
      container: this.#pointsListComponent.element,
      destinationsModel: this.#destinationsModel,
      offersModel: this.#offersModel,
      pointsModel: this.#pointsModel,
      onDataChange: this.#handleViewAction,
      onDestroy: this.#handleNewPointDestroy
    });

    this.#newPointPresenter.init();

    this.#disableNewEventButton();
  }

  #handleNewPointDestroy = () => {
    this.#newPointPresenter = null;

    this.#enableNewEventButton();

    if (this.#newPointPresenter) {
      this.#newPointPresenter.destroy();
    }

  };

  #disableNewEventButton() {
    if (this.#newEventButtonElement) {
      this.#newEventButtonElement.disabled = true;
    }
  }

  #enableNewEventButton() {
    if (this.#newEventButtonElement) {
      this.#newEventButtonElement.disabled = false;
    }
  }

  #handleViewAction = async (actionType, payload) => {

    switch (actionType) {
      case UserAction.UPDATE_POINT:
        try {
          await this.#pointsModel.updatePoint(UpdateType.MINOR, payload);
        } catch (error) {
          this.#handleUpdateError(payload.id, error);
        }
        break;
      case UserAction.ADD_POINT:
        if (this.#newPointPresenter) {
          this.#newPointPresenter.setSaving();
        }

        this.#pointsModel.addPoint(UpdateType.MINOR, payload);
        break;
      case UserAction.DELETE_POINT:
        this.#pointsModel.deletePoint(UpdateType.MINOR, payload.id || payload);
        break;
      default:
        throw new Error(`Unknown action type: ${actionType}`);
    }
  };

  #handleUpdateError = (pointId) => {
    const pointPresenter = this.#pointPresenters.get(pointId);
    if (pointPresenter) {
      pointPresenter.setAborting();
    }
  };


  #handleModelEvent = (updateType, payload) => {

    switch (updateType) {
      case UpdateType.PATCH:
        this.#updatePoint(payload);
        break;

      case UpdateType.MINOR:
        this.#clearPoints();
        this.#renderAllPoints();
        break;

      case UpdateType.MAJOR:
        this.#currentSortType = SortType.DAY;
        if (this.#sortComponent) {
          this.#sortComponent.setSortType(SortType.DAY);
        }
        this.#clearPoints();
        this.#renderAllPoints();
        break;

      case UpdateType.INIT:

        this.#hideLoading();

        if (this.#pointsModel.getPoints().length === 0) {
          this.#renderNoPoints();
        } else {
          this.#renderAllPoints();
        }
        break;
    }
  };

  #getFilteredPoints() {
    const points = this.#pointsModel.getPoints();
    const filterType = this.#filterModel.filter;

    return filterPoints(points, filterType);
  }


  #getSortedPoints(sortType = this.#currentSortType) {
    const filteredPoints = this.#getFilteredPoints();

    if (filteredPoints.length === 0) {
      return [];
    }

    const normalizedPoints = filteredPoints.map((point) => DataAdapter.forSorting(point));

    switch (sortType) {
      case SortType.DAY:
        return normalizedPoints.sort((a, b) => {
          const dateA = new Date(a.dateFrom);
          const dateB = new Date(b.dateFrom);
          return dateA - dateB;
        });

      case SortType.TIME:
        return normalizedPoints.sort((a, b) => {
          const durationA = new Date(a.dateTo) - new Date(a.dateFrom);
          const durationB = new Date(b.dateTo) - new Date(b.dateFrom);
          return durationB - durationA;
        });

      case SortType.PRICE:
        return normalizedPoints.sort((a, b) => b.basePrice - a.basePrice);

      default:
        return normalizedPoints;
    }
  }


  #renderNoPoints(error = null) {
    const filterType = this.#filterModel.filter;

    let message = '';

    if (error) {
      message = 'Failed to load latest route information';
    } else {
      const messages = {
        [FilterType.EVERYTHING]: 'Click New Event to create your first point',
        [FilterType.FUTURE]: 'There are no future events now',
        [FilterType.PRESENT]: 'There are no present events now',
        [FilterType.PAST]: 'There are no past events now'
      };
      message = messages[filterType] || messages[FilterType.EVERYTHING];
    }

    this.#noPointComponent = new NoPointView({
      message
    });

    const eventsSection = document.querySelector('.trip-events');
    render(this.#noPointComponent, eventsSection);
  }

  #handlePointChange = (actionType, updatedPoint) => {
    this.#handleViewAction(actionType, updatedPoint);
  };

  #updatePoint = (updatedPoint) => {
    const pointPresenter = this.#pointPresenters.get(updatedPoint.id);

    if (pointPresenter) {
      pointPresenter.init(updatedPoint);
    }
  };

  #needToRerender(sortedPoints) {
    if (this.#renderedPoints.length !== sortedPoints.length) {
      return true;
    }

    for (let i = 0; i < sortedPoints.length; i++) {
      if (this.#renderedPoints[i]?.id !== sortedPoints[i]?.id) {
        return true;
      }
    }

    return false;
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    const sortedPoints = this.#getSortedPoints(sortType);

    if (this.#needToRerender(sortedPoints)) {
      this.#currentSortType = sortType;
      this.#clearPoints();
      this.#renderAllPoints();
    } else {
      this.#currentSortType = sortType;
    }
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #renderAllPoints() {

    const sortedPoints = this.#getSortedPoints();


    if (this.#noPointComponent) {
      remove(this.#noPointComponent);
      this.#noPointComponent = null;
    }


    if (sortedPoints.length === 0) {
      this.#renderNoPoints();
      return;
    }

    this.#renderedPoints = sortedPoints;

    sortedPoints.forEach((point) => {
      const pointPresenter = new PointPresenter({
        container: this.#pointsListComponent.element,
        destinationsModel: this.#destinationsModel,
        offersModel: this.#offersModel,
        handlePointChange: this.#handlePointChange,
        handleModeChange: this.#handleModeChange
      });

      pointPresenter.init(point);
      this.#pointPresenters.set(point.id, pointPresenter);
    });
  }

  #clearPoints() {
    if (this.#noPointComponent) {
      remove(this.#noPointComponent);
      this.#noPointComponent = null;
    }

    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }
}
