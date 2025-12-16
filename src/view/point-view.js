import he from 'he';
import AbstractView from '../framework/view/abstract-view.js';
import { humanizeTaskDueDate, getDurationTime } from '../utils/date-utils.js';
import { findOfferByType, getSelectedOffers } from '../utils/point-utils.js';
import { DateFormat } from '../const.js';

function createOffersTemplate (offers) {

  return offers.map(({title, price}) => `<li
    class="event__offer">
      <span
        class="event__offer-title">${title}</span>
        &plus;&euro;&nbsp;
    <span class="event__offer-price">${price}</span>
  </li>`).join('');
}

function createPointTemplate(point, destinations, offers) {
  const {basePrice, dateFrom, dateTo, destination, isFavorite, type, offers: currentOffers} = point;
  const day = humanizeTaskDueDate(dateFrom, DateFormat.DATE_DAY_FORMAT);
  const dataDay = humanizeTaskDueDate(dateFrom, DateFormat.DATE_DATA_DAY_FORMAT);
  const dateStart = humanizeTaskDueDate(dateFrom, DateFormat.DATE_PERIOD_FORMAT);
  const dateDataStart = humanizeTaskDueDate(dateFrom, DateFormat.DATE_DATA_PERIOD_FORMAT);
  const dateEnd = humanizeTaskDueDate(dateTo, DateFormat.DATE_PERIOD_FORMAT);
  const dateDataEnd = humanizeTaskDueDate(dateTo, DateFormat.DATE_DATA_PERIOD_FORMAT);

  const currentDestination = destinations.find((element) => element.id === destination);
  const offerByType = findOfferByType(offers, type);

  const selectedOffers = getSelectedOffers(offerByType, currentOffers);
  const offersTemplate = createOffersTemplate(selectedOffers);

  const favoriteClassName = isFavorite
    ? 'event__favorite-btn--active'
    : '';

  return (
    `<li class="trip-events__item">
      <div class="event">
        <time class="event__date" datetime="${dataDay}">${day}</time>
        <div class="event__type">
          <img class="event__type-icon" width="42" height="42" src="img/icons/${type.toLowerCase()}.png" alt="Event type icon">
        </div>
        <h3 class="event__title">${type.toLowerCase()} ${he.encode(currentDestination.name)}</h3>
        <div class="event__schedule">
          <p class="event__time">
            <time class="event__start-time" datetime="${dateDataStart}">${dateStart}</time>
            &mdash;
            <time class="event__end-time" datetime="${dateDataEnd}">${dateEnd}</time>
          </p>
          <p class="event__duration">${getDurationTime(dateFrom, dateTo)}</p>
        </div>
        <p class="event__price">
        &euro;&nbsp;<span class="event__price-value">${he.encode(basePrice.toString())}</span>
        </p>
        <h4 class="visually-hidden">Offers:</h4>
        <ul class="event__selected-offers">
          ${offersTemplate}
        </ul>
        <button class="event__favorite-btn ${favoriteClassName}" type="button">
          <span class="visually-hidden">Add to favorite</span>
          <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
            <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
          </svg>
        </button>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </div>
    </li>`
  );
}

export default class PointView extends AbstractView {
  #point = null;
  #destinations = null;
  #offers = null;
  #handleEditClick = null;
  #handleFavoriteClick = null;

  constructor({point, destinations, offers, onEditClick, onFavoriteClick}) {
    super();
    this.#point = point;
    this.#destinations = destinations;
    this.#offers = offers;

    this.#handleFavoriteClick = onFavoriteClick;
    this.#handleEditClick = onEditClick;
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#editClickHandler);
    this.element.querySelector('.event__favorite-btn').addEventListener('click', this.#favoriteClickHandler);
  }

  get template() {
    return createPointTemplate(this.#point, this.#destinations, this.#offers);
  }

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleFavoriteClick();
  };

  #editClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleEditClick();
  };
}
