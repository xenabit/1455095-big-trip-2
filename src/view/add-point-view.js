import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { humanizeTaskDueDate } from '../utils/date-utils.js';
import { findOfferByType } from '../utils/point-utils.js';
import { DateFormat, BLANK_POINT, PointPrice, ValidateText } from '../const.js';
import flatpickr from 'flatpickr';
import he from 'he';

import 'flatpickr/dist/flatpickr.min.css';

function createOffersTemplate(offerByType, currentOffers) {
  if (!offerByType) {
    return;
  }

  const {offers} = offerByType;
  if (offers.length === 0) {
    return '';
  }

  return (
    `<section class="event__section  event__section--offers">
      <h3 class="event__section-title  event__section-title--offers">Offers</h3>
        <div class="event__available-offers">
          ${offers.map(({id, title, price}) =>
      `<div class="event__offer-selector">
        <input
          class="event__offer-checkbox visually-hidden"
          id="${id}"
          type="checkbox"
          name="event-offer-${title.split(' ')[0]}"
          data-offer-id="${id}"
          ${currentOffers.includes(id) ? 'checked' : ''}
        >
        <label class="event__offer-label" for="${id}">
          <span class="event__offer-title">${title}</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${price}</span>
        </label>
      </div>`).join('')
    }
        </div>
    </section>`
  );
}

function createDescriptionTemplate(currentDestination) {
  if (!currentDestination) {
    return '';
  }
  const {name, description, pictures} = currentDestination;
  return !description ? '' : (
    `<section class="event__section  event__section--destination">
      <h3 class="event__section-title  event__section-title--destination">${name}</h3>
      ${createTextDescriptionTemplate(description)}
      ${createPhotosTemplate(pictures)}
    </section>`
  );
}

function createTextDescriptionTemplate(description) {
  if (!description) {
    return '';
  }
  return `<p class="event__destination-description">${description}</p>`;
}

function createPhotosTemplate(pictures) {
  if (pictures.length === 0) {
    return '';
  }
  return (
    `<div class="event__photos-container">
      <div class="event__photos-tape">
      ${pictures.map(({src, description}) => `<img
      class="event__photo"
      src="${src}"
      alt="${description}">`).join('')}
     </div>
    </div>`
  );
}

function createEventsTemplate(offers, currentType, isDisabled) {
  return offers.map(({type, i}) => `<div class="event__type-item">
    <input id="event-type-${type}-${i}"
      class="event__type-input visually-hidden"
      type="radio"
      name="event-type"
      data-value="${type}"
      value=${type}
      ${type === currentType ? 'checked' : ''}
      ${isDisabled ? 'disabled' : ''}
      >
    <label class="event__type-label  event__type-label--${type}"
      for="event-type-${type}-${i}">${type.charAt(0).toUpperCase() + type.slice(1)}</label>
  </div>`).join('');
}

function createDestinationsListTemplate(destinations) {
  return destinations.map(({name}) => `<option value="${name}">${name}</option>`).join(' ');
}

function createAddPointTemplate(point, destinations, offers, isNewPoint) {

  const {
    basePrice,
    dateFrom,
    dateTo,
    destination,
    type,
    offers: currentOffers,
    isDisabled,
    isSaving,
    isDeleting
  } = point;

  const dateStart = humanizeTaskDueDate(dateFrom, DateFormat.DATE_ADD_FORMAT);
  const dateEnd = humanizeTaskDueDate(dateTo, DateFormat.DATE_ADD_FORMAT);
  const isSubmitDisabled = (dateTo === null) || (dateFrom === null);
  const currentDestination = destinations.find((element) => element.id === destination);
  const offerByType = findOfferByType(offers, type);

  const eventsTemplate = createEventsTemplate(offers, type, isDisabled);
  const offersTemplate = createOffersTemplate(offerByType, currentOffers);
  const descriptionTemplate = createDescriptionTemplate(currentDestination);
  const destinationsListTemplate = createDestinationsListTemplate(destinations);
  const rollupButtonTemplate = `<button class="event__rollup-btn" type="button">
      <span class="visually-hidden">Open event</span>
    </button>`;

  return (
    `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type.toLowerCase()}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                  ${eventsTemplate}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">
              ${type}
            </label>
            <input class="event__input  event__input--destination"
              id="event-destination-1"
              type="text" name="event-destination"
              value="${he.encode(currentDestination ? currentDestination.name : '')}"
              list="destination-list-1"
              ${isDisabled ? 'disabled' : ''}>
            <datalist id="destination-list-1">
              ${destinationsListTemplate}
            </datalist>
          </div>

          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${dateStart}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${dateEnd}">
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input
              event__input--price"
              id="event-price-1"
              type="text"
              name="event-price"
              value="${he.encode(basePrice.toString())}"
              ${isDisabled ? 'disabled' : ''}>
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit" ${isSubmitDisabled || isDisabled ? 'disabled' : ''}>
            ${isSaving ? 'saving...' : 'save'}
          </button>
          <button class="event__reset-btn" type="reset">${isNewPoint ? 'Cancel' : `${isDeleting ? 'deleting...' : 'delete'}`}</button>
          ${!isNewPoint ? rollupButtonTemplate : ''}
        </header>
        <section class="event__details">
            ${offersTemplate}
            ${descriptionTemplate}
        </section>
      </form>
    </li>`
  );
}

export default class AddPointView extends AbstractStatefulView {
  #destinations = null;
  #offers = null;
  #isNewPoint = false;

  #datepickerStart = null;
  #datepickerEnd = null;

  #handleCloseButtonClick = null;
  #handleFormSubmit = null;
  #handleDeleteClick = null;


  constructor({point = BLANK_POINT, destinations, offers, onFormSubmit, onCloseButtonClick, onDeleteClick, isNewPoint}) {
    super();
    this._setState(AddPointView.parsePointToState(point));
    this.#destinations = destinations;
    this.#offers = offers;
    this.#isNewPoint = isNewPoint;

    this._restoreHandlers();

    this.#handleCloseButtonClick = onCloseButtonClick;
    this.#handleFormSubmit = onFormSubmit;
    this.#handleDeleteClick = onDeleteClick;
  }

  get template() {
    return createAddPointTemplate(this._state, this.#destinations, this.#offers, this.#isNewPoint);
  }

  #setDatepickerFrom() {
    this.#datepickerStart = flatpickr(
      this.element.querySelector('#event-start-time-1'),
      {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        'time_24hr': true,
        defaultDate: this._state.dateFrom,
        onChange: this.#dateFromChangeHandler,
      },
    );
  }

  #setDatepickerTo() {
    this.#datepickerEnd = flatpickr(
      this.element.querySelector('#event-end-time-1'),
      {
        minDate: this._state.dateFrom,
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        'time_24hr': true,
        defaultDate: this._state.dateTo,
        onChange: this.#dateToChangeHandler,
      },
    );
  }

  removeElement() {
    super.removeElement();

    if (this.#datepickerStart) {
      this.#datepickerStart.destroy();
      this.#datepickerStart = null;
    }

    if (this.#datepickerEnd) {
      this.#datepickerEnd.destroy();
      this.#datepickerEnd = null;
    }
  }

  reset(point) {
    this.updateElement(
      AddPointView.parsePointToState(point),
    );
  }

  _restoreHandlers() {
    this.element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);
    this.element.querySelector('.event__rollup-btn')?.addEventListener('click', this.#closeButtonClickHandler);
    this.element.querySelector('.event__type-group').addEventListener('click', this.#eventTypeToggleHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);
    this.element.querySelector('.event__available-offers')?.addEventListener('click', this.#offerCurrentHandler);
    this.element.querySelector('.event__input--price').addEventListener('change', this.#priceChangeHandler);
    this.element.querySelector('.event__reset-btn')?.addEventListener('click', this.#formDeleteClickHandler);

    this.#setDatepickerFrom();
    this.#setDatepickerTo();
  }

  #dateFromChangeHandler = ([userDateFrom]) => {
    this._setState({dateFrom: userDateFrom});
    this.#setDatepickerTo();
  };

  #dateToChangeHandler = ([userDateTo]) => {
    this._setState({dateTo: userDateTo});
    this.#setDatepickerFrom();
  };

  #eventTypeToggleHandler = (evt) => {
    const target = evt.target.closest('.event__type-item');

    if (!target) {
      return;
    }
    evt.preventDefault();
    this.updateElement({
      type: target.querySelector('input').dataset.value,
      offers: [],
    });
  };

  #offerCurrentHandler = (evt) => {
    evt.preventDefault();

    const target = evt.target.closest('.event__offer-label');

    if (!target) {
      return;
    }

    const currentOfferFeld = target.parentElement.querySelector('.event__offer-checkbox');
    currentOfferFeld.toggleAttribute('checked');

    this.updateElement({
      offers: [...evt.currentTarget.querySelectorAll('.event__offer-checkbox:checked')]
        .map((item) => item.dataset.offerId),
    });
  };

  #destinationChangeHandler = (evt) => {
    evt.preventDefault();

    const currentDestination = this.#destinations.find((destination) => destination.name.toLowerCase() === evt.target.value.toLowerCase());

    if (!currentDestination) {
      this.updateElement({
        destination: '',
      });

      return;
    }

    this.updateElement({
      destination: currentDestination.id,
    });
  };

  #priceChangeHandler = (evt) => {
    evt.preventDefault();

    const newPrice = parseInt(evt.target.value,10);
    this.updateElement({
      basePrice: newPrice > PointPrice.MIN_POINT_PRICE ? newPrice : PointPrice.MIN_POINT_PRICE,
    });
  };

  #formDeleteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleDeleteClick(AddPointView.parseStateToPoint(this._state));
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();

    const destinationInput = this.element.querySelector('.event__input--destination');
    const destinationOptions = this.#destinations.map((destination) => destination.name);
    const priceInput = this.element.querySelector('.event__input--price');

    destinationInput.setCustomValidity('');

    if (!destinationOptions.includes(destinationInput.value.trim())) {
      destinationInput.setCustomValidity(ValidateText.DESTINATIONS_NAME_FAILED);
      destinationInput.reportValidity();
    }

    priceInput.setCustomValidity('');

    if (priceInput.value > PointPrice.MAX_POINT_PRICE) {
      priceInput.setCustomValidity(ValidateText.PRICE_MAX_FAILED);
      priceInput.reportValidity();
    }

    if (priceInput.value < PointPrice.MIN_POINT_PRICE) {
      priceInput.setCustomValidity(ValidateText.PRICE_MIN_FAILED);
      priceInput.reportValidity();
    }

    this.#handleFormSubmit(AddPointView.parseStateToPoint(this._state));
  };

  #closeButtonClickHandler = () => {
    this.#handleCloseButtonClick();
  };

  static parsePointToState(point) {
    return {...point,
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    };
  }

  static parseStateToPoint(state) {
    const point = {...state};

    delete point.isDisabled;
    delete point.isSaving;
    delete point.isDeleting;

    return point;
  }
}
