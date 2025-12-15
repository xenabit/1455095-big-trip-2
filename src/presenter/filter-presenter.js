// /src/presenter/filter-presenter.js

import FilterView from '../view/filter-view.js';
import { FilterType, UpdateType } from '../const.js';
import { render, replace, remove } from '../framework/render.js';

export default class FilterPresenter {
  #container = null;
  #filterModel = null;
  #pointsModel = null;

  #filterComponent = null;

  constructor({ container, filterModel, pointsModel }) {
    this.#container = container;
    this.#filterModel = filterModel;
    this.#pointsModel = pointsModel;

    // Подписываемся на изменения в моделях
    this.#filterModel.addObserver(this.#handleModelEvent);
    this.#pointsModel.addObserver(this.#handleModelEvent);
  }

  init() {
    const filters = this.#getFilters();
    const prevFilterComponent = this.#filterComponent;

    this.#filterComponent = new FilterView({
      filters,
      currentFilterType: this.#filterModel.filter,
      onFilterTypeChange: this.#handleFilterTypeChange
    });

    if (!prevFilterComponent) {
      render(this.#filterComponent, this.#container);
      return;
    }

    replace(this.#filterComponent, prevFilterComponent);
    remove(prevFilterComponent);
  }

  #handleModelEvent = () => {
    this.init();
  };

  #handleFilterTypeChange = (filterType) => {
    if (this.#filterModel.filter === filterType) {
      return;
    }

    // При смене фильтра сбрасываем сортировку на DAY
    this.#filterModel.setFilter(UpdateType.MAJOR, filterType);
  };

  #getFilters() {
    const points = this.#pointsModel.getPoints();
    const now = new Date();

    return [
      {
        type: FilterType.EVERYTHING,
        name: 'Everything',
        count: points.length
      },
      {
        type: FilterType.FUTURE,
        name: 'Future',
        count: points.filter((point) => new Date(point.date_from) > now).length
      },
      {
        type: FilterType.PRESENT,
        name: 'Present',
        count: points.filter((point) =>
          new Date(point.date_from) <= now && new Date(point.date_to) >= now
        ).length
      },
      {
        type: FilterType.PAST,
        name: 'Past',
        count: points.filter((point) => new Date(point.date_to) < now).length
      }
    ];
  }

  destroy() {
    remove(this.#filterComponent);
  }
}
