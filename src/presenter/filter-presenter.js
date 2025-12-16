import FilterView from '../view/filter-view.js';
import { FilterType, UpdateType } from '../const.js';
import { render, replace, remove } from '../framework/render.js';
import { DataAdapter } from '../utils/data-adapter.js';

export default class FilterPresenter {
  #container = null;
  #filterModel = null;
  #pointsModel = null;

  #filterComponent = null;

  constructor({ container, filterModel, pointsModel }) {
    this.#container = container;
    this.#filterModel = filterModel;
    this.#pointsModel = pointsModel;

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

    this.#filterModel.setFilter(UpdateType.MAJOR, filterType);
  };


  #getFilters() {
    const points = this.#pointsModel.getPoints();
    const now = new Date();

    const normalizedPoints = points.map((point) => DataAdapter.forSorting(point));

    return [
      {
        type: FilterType.EVERYTHING,
        name: 'Everything',
        count: normalizedPoints.length
      },
      {
        type: FilterType.FUTURE,
        name: 'Future',
        count: normalizedPoints.filter((point) => new Date(point.dateFrom) > now).length
      },
      {
        type: FilterType.PRESENT,
        name: 'Present',
        count: normalizedPoints.filter((point) =>
          new Date(point.dateFrom) <= now && new Date(point.dateTo) >= now
        ).length
      },
      {
        type: FilterType.PAST,
        name: 'Past',
        count: normalizedPoints.filter((point) => new Date(point.dateTo) < now).length
      }
    ];
  }

  destroy() {
    remove(this.#filterComponent);
  }
}
