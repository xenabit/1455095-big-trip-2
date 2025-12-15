import AbstractView from '../framework/view/abstract-view';
import { SortType } from '/src/const.js';

function createLayout() {
  return `<form class="trip-events__trip-sort  trip-sort" action="#" method="get">
            <div class="trip-sort__item  trip-sort__item--day">
              <input id="sort-day" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-day" checked>
              <label class="trip-sort__btn" for="sort-day" data-sort-type="${SortType.DAY}">Day</label>
            </div>

            <div class="trip-sort__item  trip-sort__item--event">
              <input id="sort-event" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-event" disabled>
              <label class="trip-sort__btn" for="sort-event">Event</label>
            </div>

            <div class="trip-sort__item  trip-sort__item--time">
              <input id="sort-time" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-time">
              <label class="trip-sort__btn" for="sort-time" data-sort-type="${SortType.TIME}">Time</label>
            </div>

            <div class="trip-sort__item  trip-sort__item--price">
              <input id="sort-price" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-price">
              <label class="trip-sort__btn" for="sort-price" data-sort-type="${SortType.PRICE}">Price</label>
            </div>

            <div class="trip-sort__item  trip-sort__item--offer">
              <input id="sort-offer" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-offer" disabled>
              <label class="trip-sort__btn" for="sort-offer">Offers</label>
            </div>
          </form>`;
}

export default class SortView extends AbstractView {
  #handleSortTypeChange = null;

  constructor({ onSortTypeChange }) {
    super();
    this.#handleSortTypeChange = onSortTypeChange;

    this.element.addEventListener('click', this.#sortTypeChangeHandler);
  }

  setSortType(sortType) {
    const inputId = `sort-${sortType}`;
    const radioElement = this.element.querySelector(`#${inputId}`);

    if (radioElement && !radioElement.disabled) {
      radioElement.checked = true;
    }
  }

  #sortTypeChangeHandler = (evt) => {
    if (evt.target.tagName !== 'LABEL' || !evt.target.dataset.sortType) {
      return;
    }

    evt.preventDefault();
    const sortType = evt.target.dataset.sortType;

    const radioId = evt.target.getAttribute('for');
    if (radioId) {
      const radioElement = this.element.querySelector(`#${radioId}`);
      if (radioElement && !radioElement.disabled) {
        radioElement.checked = true;
        this.#handleSortTypeChange(sortType);
      }
    }
  };

  get template() {
    return createLayout();
  }

  destroy() {
    this.element.removeEventListener('click', this.#sortTypeChangeHandler);
  }
}
