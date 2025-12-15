// /src/presenter/presenter.js
import PointsListView from '/src/view/points-list-view';
import SortView from '/src/view/sort-view';
import PointPresenter from './point-presenter.js';
import NewEventButtonView from '../view/new-event-button-view.js';
import NewPointPresenter from './new-point-presenter.js';
import { render, remove } from '../framework/render.js';

import { SortType, UpdateType, FilterType, UserAction } from '/src/const.js';
import { filterPoints } from '/src/utils/filter.js';
import NoPointView from '/src/view/no-point-view.js';

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

  init() {
    // Инициализируем кнопку New Event
    this.#initNewEventButton();

    this.#sortComponent = new SortView({
      onSortTypeChange: this.#handleSortTypeChange
    });

    const eventsSection = document.querySelector('.trip-events');
    if (!eventsSection) {
      console.error('Could not find .trip-events container');
      return;
    }

    render(this.#sortComponent, eventsSection);
    render(this.#pointsListComponent, eventsSection);

    this.#renderAllPoints();
  }

  #initNewEventButton() {
    const tripMainElement = document.querySelector('.trip-main');

    if (!tripMainElement) {
      console.error('Could not find .trip-main container');
      return;
    }

    this.#newEventButtonComponent = new NewEventButtonView({
      onClick: this.#handleNewEventButtonClick
    });

    const tripControls = tripMainElement.querySelector('.trip-controls');
    if (tripControls) {
      tripControls.before(this.#newEventButtonComponent.element);
    } else {
      tripMainElement.append(this.#newEventButtonComponent.element);
    }
  }

  #handleNewEventButtonClick = () => {
    // Сбрасываем фильтр на "Everything" при создании новой точки
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);

    // Сбрасываем сортировку на DAY
    this.#currentSortType = SortType.DAY;
    if (this.#sortComponent) {
      this.#sortComponent.setSortType(SortType.DAY);
    }

    // Закрываем все открытые формы редактирования
    this.#handleModeChange();

    // Создаем презентер для новой точки
    this.createPoint();
  };

  createPoint() {
    // Если уже есть активная форма создания - не создаем новую
    if (this.#newPointPresenter) {
      return;
    }

    this.#newPointPresenter = new NewPointPresenter({
      container: this.#pointsListComponent.element,
      destinationsModel: this.#destinationsModel,
      offersModel: this.#offersModel,
      onDataChange: this.#handleViewAction,
      onDestroy: this.#handleNewPointDestroy
    });

    this.#newPointPresenter.init();

    // Блокируем кнопку New Event
    if (this.#newEventButtonComponent) {
      this.#newEventButtonComponent.disable();
    }
  }

  #handleNewPointDestroy = () => {
    // Очищаем ссылку на презентер
    this.#newPointPresenter = null;

    // Разблокируем кнопку New Event
    if (this.#newEventButtonComponent) {
      this.#newEventButtonComponent.enable();
    }
  };

  #handleViewAction = (actionType, payload) => {
    console.log(`View action: ${actionType}`, payload);

    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointsModel.updatePoint(UpdateType.MINOR, payload);
        break;
      case UserAction.ADD_POINT:
        // Устанавливаем состояние "сохранение" для формы
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

  #handleModelEvent = (updateType, payload) => {
    console.log(`Model event: ${updateType}`, payload);

    switch (updateType) {
      case UpdateType.PATCH:
        this.#updatePoint(payload);
        break;
      case UpdateType.MINOR:
        // После успешного добавления новой точки закрываем форму
        if (this.#newPointPresenter) {
          this.#newPointPresenter.destroy();
          // Не вызываем #handleNewPointDestroy здесь - он вызовется из destroy()
        }

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
        this.#renderAllPoints();
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

    const pointsCopy = [...filteredPoints];

    switch (sortType) {
      case SortType.DAY:
        return pointsCopy.sort((a, b) => {
          const dateA = new Date(a.date_from);
          const dateB = new Date(b.date_from);
          return dateA - dateB;
        });

      case SortType.TIME:
        return pointsCopy.sort((a, b) => {
          const durationA = new Date(a.date_to) - new Date(a.date_from);
          const durationB = new Date(b.date_to) - new Date(b.date_from);
          return durationB - durationA;
        });

      case SortType.PRICE:
        return pointsCopy.sort((a, b) => b.base_price - a.base_price);

      default:
        return pointsCopy;
    }
  }

  #renderNoPoints() {
    const filterType = this.#filterModel.filter;
    const messages = {
      [FilterType.EVERYTHING]: 'Click New Event to create your first point',
      [FilterType.FUTURE]: 'There are no future events now',
      [FilterType.PRESENT]: 'There are no present events now',
      [FilterType.PAST]: 'There are no past events now'
    };

    this.#noPointComponent = new NoPointView({
      message: messages[filterType] || messages[FilterType.EVERYTHING]
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
    if (this.#noPointComponent) {
      remove(this.#noPointComponent);
      this.#noPointComponent = null;
    }

    const sortedPoints = this.#getSortedPoints();

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
