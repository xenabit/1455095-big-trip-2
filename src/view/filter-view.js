// /src/view/filter-view.js

import AbstractView from '../framework/view/abstract-view';
import { FilterType } from '../const.js';

function createFilterItemTemplate(filter, currentFilterType) {
  const { type, name, count } = filter;

  return `
    <div class="trip-filters__filter">
      <input
        id="filter-${type}"
        class="trip-filters__filter-input  visually-hidden"
        type="radio"
        name="trip-filter"
        value="${type}"
        ${type === currentFilterType ? 'checked' : ''}
        ${count === 0 ? 'disabled' : ''}
      >
      <label
        class="trip-filters__filter-label"
        for="filter-${type}"
        ${count === 0 ? 'style="opacity: 0.5; cursor: not-allowed;"' : ''}
      >
        ${name} (${count})
      </label>
    </div>
  `;
}

function createTemplate(filters, currentFilterType) {
  const filterItemsTemplate = filters
    .map((filter) => createFilterItemTemplate(filter, currentFilterType))
    .join('');

  return `
    <form class="trip-filters" action="#" method="get">
      ${filterItemsTemplate}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>
  `;
}

export default class FilterView extends AbstractView {
  #filters = null;
  #currentFilter = null;
  #handleFilterTypeChange = null;

  constructor({ filters, currentFilterType, onFilterTypeChange }) {
    super();

    // Проверяем, что параметры переданы
    if (!filters || !onFilterTypeChange) {
      console.error('FilterView: Missing required parameters');
    }

    this.#filters = filters;
    this.#currentFilter = currentFilterType;
    this.#handleFilterTypeChange = onFilterTypeChange;

    this.element.addEventListener('change', this.#filterTypeChangeHandler);
  }

  get template() {
    return createTemplate(this.#filters, this.#currentFilter);
  }

  #filterTypeChangeHandler = (evt) => {
    if (evt.target.tagName !== 'INPUT') {
      return;
    }

    evt.preventDefault();
    this.#handleFilterTypeChange(evt.target.value);
  };

  destroy() {
    this.element.removeEventListener('change', this.#filterTypeChangeHandler);
  }
}
