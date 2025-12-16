import { render, remove } from '../framework/render.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import { sortPointsByPrice, sortPointsByDay, sortPointsByTime } from '../utils/point-utils.js';
import { SortType, UpdateType, UserAction, FilterType, NoPointsFiltersText, NoPointsText, TimeLimit } from '../const.js';
import { filter } from '../utils/filter.js';
import BoardView from '../view/board-view.js';
import TripListView from '../view/trip-list-view.js';
import SortView from '../view/sort-view.js';
import NoPointView from '../view/no-point-view.js';
import PointPresenter from './point-presenter.js';
import NewPointPresenter from './new-point-presenter.js';

export default class BoardPresenter {
  #boardContainer = null;
  #pointsModel = null;
  #filterModel = null;
  #boardComponent = new BoardView();
  #tripListComponent = new TripListView();
  #noPointComponent = null;
  #sortComponent = null;
  #pointPresenters = new Map();
  #newPointPresenter = null;
  #newEventButtonComponent = null;

  #currentSortType = SortType.DAY;
  #filterType = FilterType.EVERYTHING;
  #isLoading = true;
  #uiBlocker = new UiBlocker({
    lowerLimit: TimeLimit.LOWER_LIMIT,
    upperLimit: TimeLimit.UPPER_LIMIT
  });

  constructor({boardContainer, pointsModel, filterModel}) {
    this.#boardContainer = boardContainer;
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    this.#filterType = this.#filterModel.filter;
    const points = this.#pointsModel.points;
    const filteredPoints = filter[this.#filterType](points);

    switch (this.#currentSortType) {
      case SortType.PRICE:
        return filteredPoints.sort(sortPointsByPrice);
      case SortType.TIME:
        return filteredPoints.sort(sortPointsByTime);
      case SortType.DAY:
        return filteredPoints.sort(sortPointsByDay);
    }
    return filteredPoints;
  }

  init() {
    this.#renderBoard();
  }

  createPoint({newEventButtonComponent}) {
    render(this.#tripListComponent, this.#boardComponent.element);
    this.#newEventButtonComponent = newEventButtonComponent;

    this.#currentSortType = SortType.DAY;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    this.#newPointPresenter = new NewPointPresenter({
      tripListContainer: this.#tripListComponent.element,
      destinations: this.#pointsModel.destinations,
      offers: this.#pointsModel.offers,
      onDataChange: this.#handleViewAction,
      handleDestroy: this.#handleNewPointFormClose,
    });

    if (this.#noPointComponent) {
      remove(this.#noPointComponent);
    }

    this.#newPointPresenter.init();
  }

  #renderBoard() {
    render(this.#boardComponent, this.#boardContainer);

    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }

    if (this.points.length === 0) {
      this.#renderNoPoints(NoPointsFiltersText[this.#filterType]);
      return;
    }

    this.#renderSort();

    render(this.#tripListComponent, this.#boardComponent.element);
    this.points.forEach((point) =>
      this.#renderPoint(point));
  }

  #clearBoard({resetSortType = false} = {}) {
    this.#newPointPresenter?.destroy();

    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
    remove(this.#sortComponent);

    if (this.#noPointComponent) {
      remove(this.#noPointComponent);
    }

    if (resetSortType) {
      this.#currentSortType = SortType.DAY;
    }
  }

  #renderSort() {

    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });

    render(this.#sortComponent, this.#boardComponent.element);
  }

  #renderNoPoints(noPointsText) {
    this.#noPointComponent = new NoPointView(
      noPointsText,
    );

    render(this.#noPointComponent, this.#boardComponent.element);
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      tripListContainer: this.#tripListComponent.element,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange,
      destinations: this.#pointsModel.destinations,
      offers: this.#pointsModel.offers,
    });

    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #handleNewPointFormClose = () => {
    this.#newEventButtonComponent.disabled = false;
    if (this.points.length === 0) {
      remove(this.#tripListComponent);
      this.#renderNoPoints(NoPointsFiltersText[this.#filterType]);
    }
  };

  #renderLoading() {
    this.#renderNoPoints(NoPointsText.LOADING);
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;

    this.#clearBoard();
    this.#renderBoard();
  };

  #handleModeChange = () => {
    this.#newPointPresenter?.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleViewAction = async (actionType, updateType, update) => {
    this.#uiBlocker.block();

    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointPresenters.get(update.id).setSaving();
        try {
          await this.#pointsModel.updatePoint(updateType, update);
        } catch(err) {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;
      case UserAction.ADD_POINT:
        this.#newPointPresenter.setSaving();
        try {
          await this.#pointsModel.addPoint(updateType, update);
        } catch(err) {
          this.#newPointPresenter.setAborting();
        }
        break;
      case UserAction.DELETE_POINT:
        this.#pointPresenters.get(update.id).setDeleting();
        try {
          await this.#pointsModel.deletePoint(updateType, update);
        } catch(err) {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;
    }
    this.#uiBlocker.unblock();
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#pointPresenters.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        this.#clearBoard({resetSortType: true});
        this.#renderBoard();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UpdateType.INIT:
        this.#isLoading = false;
        remove(this.#noPointComponent);
        this.#renderBoard();
        break;
      case UpdateType.ERROR:
        this.#isLoading = false;
        remove(this.#noPointComponent);
        this.#renderNoPoints(NoPointsText.ERROR_TEXT);
        break;
    }
  };
}
