import PointsListView from '/src/view/points-list-view';
import FilterView from '/src/view/filter-view';
import SortView from '/src/view/sort-view';
import PointPresenter from './point-presenter.js';

import { render } from '/src/framework/render.js';
import { SortType, UpdateType } from '/src/const.js';

const body = document.querySelector('.page-body');
const eventsSection = body.querySelector('.trip-events');
const filterSection = body.querySelector('.trip-controls__filters');

export default class Presenter {
  #pointsListComponent = new PointsListView();
  #filterComponent = new FilterView();
  #sortComponent = null;

  #pointPresenters = new Map();
  #pointsModel = null;
  #destinationsModel = null;
  #offersModel = null;

  #currentSortType = SortType.DAY;
  #renderedPoints = [];

  constructor({
    pointsModel,
    destinationsModel,
    offersModel,
  }) {
    this.#pointsModel = pointsModel;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;

    this.#pointsModel.addObserver(this.#handleModelEvent);
  }

  init() {
    render(this.#filterComponent, filterSection);

    this.#sortComponent = new SortView({
      onSortTypeChange: this.#handleSortTypeChange
    });

    render(this.#sortComponent, eventsSection);
    render(this.#pointsListComponent, eventsSection);

    this.#renderAllPoints();
  }

  #handleModelEvent = (updateType, payload) => {

    switch (updateType) {
      case UpdateType.PATCH:
        // Обновляем только конкретную точку
        this.#updatePoint(payload);
        break;
      case UpdateType.MINOR:
        // Перерисовываем все точки (после редактирования)
        this.#clearPoints();
        this.#renderAllPoints();
        break;
      case UpdateType.MAJOR:
        // Полная перерисовка с учетом сортировки/фильтрации
        this.#clearPoints();
        this.#renderAllPoints();
        break;
      case UpdateType.INIT:
        // Инициализация
        this.#renderAllPoints();
        break;
    }
  };

  #handlePointChange = (updatedPoint) => {
    // Используем модель для обновления данных
    this.#pointsModel.updatePoint(UpdateType.MINOR, updatedPoint);
  };

  #updatePoint = (updatedPoint) => {
    // Обновляем конкретный презентер точки
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

  #getSortedPoints(sortType = this.#currentSortType) {
    const points = [...this.#pointsModel.getPoints()];

    switch (sortType) {
      case SortType.DAY:
        return points.sort((a, b) => {
          const dateA = new Date(a.date_from);
          const dateB = new Date(b.date_from);
          return dateA - dateB;
        });

      case SortType.TIME:
        return points.sort((a, b) => {
          const durationA = new Date(a.date_to) - new Date(a.date_from);
          const durationB = new Date(b.date_to) - new Date(b.date_from);
          return durationB - durationA;
        });

      case SortType.PRICE:
        return points.sort((a, b) => b.base_price - a.base_price);

      default:
        return points;
    }
  }

  #renderAllPoints() {
    const sortedPoints = this.#getSortedPoints();
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
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }
}
