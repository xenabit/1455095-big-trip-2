// /src/model/filter-model.js

import Observable from '../framework/observable.js';

const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past'
};

export default class FilterModel extends Observable {
  #currentFilter = FilterType.EVERYTHING;

  get filter() {
    return this.#currentFilter;
  }

  setFilter(updateType, filter) {
    if (!Object.values(FilterType).includes(filter)) {
      throw new Error(`Invalid filter type: ${filter}`);
    }

    this.#currentFilter = filter;
    this._notify(updateType, filter);
  }
}

export { FilterType };
