import PointsListView from '/src/view/points-list-view';
import FilterView from '/src/view/filter-view';
import SortView from '/src/view/sort-view';
import PointPresenter from './point-presenter.js';
import { render, remove } from '../framework/render.js';


import { SortType, UpdateType, FilterType } from '/src/const.js';
import { filterPoints } from '/src/utils/filter.js';
import NoPointView from '/src/view/no-point-view.js';


const body = document.querySelector('.page-body');
const eventsSection = body.querySelector('.trip-events');
const filterSection = body.querySelector('.trip-controls__filters');

export default class Presenter {
  #pointsListComponent = new PointsListView();
  #sortComponent = null; // FilterView теперь не здесь

  #pointPresenters = new Map();
  #pointsModel = null;
  #destinationsModel = null;
  #offersModel = null;
  #filterModel = null;

  #currentSortType = SortType.DAY;
  #renderedPoints = [];
  #noPointComponent = null;

  constructor({
    pointsModel,
    destinationsModel,
    offersModel,
    filterModel,
  }) {
    this.#pointsModel = pointsModel;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#filterModel = filterModel;

    // Подписываемся на изменения в моделях
    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  init() {
    // FilterView теперь инициализируется FilterPresenter'ом

    this.#sortComponent = new SortView({
      onSortTypeChange: this.#handleSortTypeChange
    });

    // Получаем контейнер из DOM
    const eventsSection = document.querySelector('.trip-events');
    if (!eventsSection) {
      console.error('Could not find .trip-events container');
      return;
    }

    render(this.#sortComponent, eventsSection);
    render(this.#pointsListComponent, eventsSection);

    this.#renderAllPoints();
  }


  #handleModelEvent = (updateType, payload) => {
    console.log(`Model event: ${updateType}`, payload);

    switch (updateType) {
      case UpdateType.PATCH:
        this.#updatePoint(payload);
        break;
      case UpdateType.MINOR:
        // Для MINOR обновлений перерисовываем только если точка видна в текущем фильтре
        const filteredPoints = this.#getFilteredPoints();
        const isPointVisible = filteredPoints.some((point) => point.id === payload?.id);

        if (isPointVisible) {
          this.#clearPoints();
          this.#renderAllPoints();
        }
        break;
      case UpdateType.MAJOR:
        // При смене фильтра или других MAJOR изменениях
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

    // Если фильтр не оставил точек, возвращаем пустой массив
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

    render(this.#noPointComponent, eventsSection);
  }

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


  #renderAllPoints() {
    // Очищаем заглушку, если она есть
    if (this.#noPointComponent) {
      remove(this.#noPointComponent);
      this.#noPointComponent = null;
    }

    const sortedPoints = this.#getSortedPoints();

    // Если точек нет, показываем заглушку
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
    // Очищаем заглушку
    if (this.#noPointComponent) {
      remove(this.#noPointComponent);
      this.#noPointComponent = null;
    }

    // Очищаем точки
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }
}
