import AbstractStatefulView from '/src/framework/view/abstract-stateful-view.js';
import { typeIcons } from '/src/const.js';
import { getFormattedEditDateTime } from '../utils/utils.js';

const BLANK_POINT = {
  id: null,
  basePrice: 0,
  dateFrom: '2023-01-01T00:00:00.000Z',
  dateTo: '2023-01-01T00:00:00.000Z',
  destination: null,
  isFavorite: false,
  offers: [],
  type: 'flight',
};

export default class PointEditView extends AbstractStatefulView {
  #destinationsData = null;
  #offersData = null;
  #handleSubmit = null;
  #handleRollupClick = null;
  #handleDelete = null;
  #typeToggleChangeHandler = null;

  constructor(
    { pointData = BLANK_POINT, destinationsData, offersData },
    handleSubmit,
    handleDelete,
    handleRollupClick
  ) {
    super();
    this.#destinationsData = destinationsData;
    this.#offersData = offersData;
    this.#handleSubmit = handleSubmit;
    this.#handleDelete = handleDelete;
    this.#handleRollupClick = handleRollupClick;

    this._state = this.#pointToState(pointData);

    this.#setEventListeners();
  }

  get template() {
    return this.#createTemplate(this._state);
  }


  #pointToState(pointData) {
    return {
      id: pointData.id,
      basePrice: pointData.base_price || 0,
      dateFrom: pointData.date_from || BLANK_POINT.dateFrom,
      dateTo: pointData.date_to || BLANK_POINT.dateTo,
      destination: pointData.destination || null,
      isFavorite: pointData.is_favorite || false,
      offers: pointData.offers || [],
      type: pointData.type || 'flight',
    };
  }


  #stateToPoint() {
    return {
      id: this._state.id,
      basePrice: Number(this._state.basePrice) || 0,
      dateFrom: this._state.dateFrom,
      dateTo: this._state.dateTo,
      destination: this._state.destination,
      isFavorite: this._state.isFavorite,
      offers: this._state.offers,
      type: this._state.type,
    };
  }


  _restoreHandlers() {
    this.#setEventListeners();
  }


  #setEventListeners() {
    const formElement = this.element.querySelector('.event--edit');
    formElement.addEventListener('submit', this.#formSubmitHandler);
    formElement.addEventListener('reset', this.#formResetHandler);

    const typeToggle = this.element.querySelector('.event__type-toggle');
    typeToggle.addEventListener('change', this.#typeToggleChangeHandler);

    const typeInputs = this.element.querySelectorAll('.event__type-input');
    typeInputs.forEach((input) => {
      input.addEventListener('change', this.#typeChangeHandler);
    });

    const destinationInput = this.element.querySelector('.event__input--destination');
    destinationInput.addEventListener('change', this.#destinationChangeHandler);

    const offersCheckboxes = this.element.querySelectorAll('.event__offer-checkbox');
    offersCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', this.#offerChangeHandler);
    });

    const priceInput = this.element.querySelector('.event__input--price');
    priceInput.addEventListener('change', this.#priceChangeHandler);

    const dateFromInput = this.element.querySelector('#event-start-time-1');
    const dateToInput = this.element.querySelector('#event-end-time-1');
    dateFromInput.addEventListener('change', this.#dateFromChangeHandler);
    dateToInput.addEventListener('change', this.#dateToChangeHandler);

    const rollupButton = this.element.querySelector('.event__rollup-btn');
    rollupButton.addEventListener('click', this.#rollupButtonClickHandler);
  }


  #typeChangeHandler = (evt) => {
    evt.preventDefault();
    const newType = evt.target.value;


    this.updateElement({
      type: newType,
      offers: [],
      icon: typeIcons[newType],
    });
  };


  #destinationChangeHandler = (evt) => {
    const destinationName = evt.target.value;
    const destination = this.#destinationsData.find((d) => d.name === destinationName);

    if (destination) {
      this.updateElement({
        destination: destination.id,
      });
    }
  };


  #offerChangeHandler = (evt) => {
    const offerId = evt.target.id;
    const isChecked = evt.target.checked;
    let updatedOffers = [...this._state.offers];

    if (isChecked) {
      updatedOffers.push(offerId);
    } else {
      updatedOffers = updatedOffers.filter((id) => id !== offerId);
    }

    this.updateElement({
      offers: updatedOffers,
    });
  };


  #priceChangeHandler = (evt) => {
    const basePrice = parseInt(evt.target.value, 10) || 0;
    this.updateElement({
      basePrice: basePrice,
    });
  };


  #dateFromChangeHandler = (evt) => {
    this.updateElement({
      dateFrom: evt.target.value,
    });
  };


  #dateToChangeHandler = (evt) => {
    this.updateElement({
      dateTo: evt.target.value,
    });
  };


  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleSubmit(this.#stateToPoint());
  };


  #formResetHandler = (evt) => {
    evt.preventDefault();
    this.#handleDelete(this.#stateToPoint());
  };


  #rollupButtonClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleRollupClick();
  };


  #createTemplate(state) {
    const {
      basePrice,
      dateFrom,
      dateTo,
      destination,
      offers,
      type,
    } = state;

    const destinationItem = this.#destinationsData.find((d) => d.id === destination);
    const destinationName = destinationItem ? destinationItem.name : '';

    const currentTypeOffers = this.#offersData.find((offer) => offer.type === type);
    const availableOffers = currentTypeOffers ? currentTypeOffers.offers : [];

    const offersTemplate = availableOffers.map((offer) => `
      <div class="event__offer-selector">
        <input class="event__offer-checkbox visually-hidden"
               id="${offer.id}"
               type="checkbox"
               name="${offer.title.toLowerCase().trim().replace(/\s+/g, '-')}"
               ${offers.includes(offer.id) ? 'checked' : ''}>
        <label class="event__offer-label" for="${offer.id}">
          <span class="event__offer-title">${offer.title}</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${offer.price}</span>
        </label>
      </div>
    `).join('');

    // Формируем описание и фотографии пункта назначения
    const destinationDescription = destinationItem ? destinationItem.description : '';
    const destinationPhotos = destinationItem ? destinationItem.pictures.map((pic) =>
      `<img class="event__photo" src="${pic.src}" alt="${pic.description || 'Event photo'}">`
    ).join('') : '';

    return `
      <li class="trip-events__item">
        <form class="event event--edit" action="#" method="post">
          <header class="event__header">
            <div class="event__type-wrapper">
              <label class="event__type event__type-btn" for="event-type-toggle-1">
                <span class="visually-hidden">Choose event type</span>
                <img class="event__type-icon" width="17" height="17" src="${typeIcons[type]}" alt="${type} icon">
              </label>
              <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">

              <div class="event__type-list">
                <fieldset class="event__type-group">
                  <legend class="visually-hidden">Event type</legend>
                  ${this.#createTypeOptions(type)}
                </fieldset>
              </div>
            </div>

            <div class="event__field-group event__field-group--destination">
              <label class="event__label event__type-output" for="event-destination-1">
                ${type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
              <input class="event__input event__input--destination"
                     id="event-destination-1"
                     type="text"
                     name="event-destination"
                     value="${destinationName}"
                     list="destination-list-1"
                     autocomplete="off">
              <datalist id="destination-list-1">
                ${this.#destinationsData.map((d) =>
    `<option value="${d.name}"></option>`
  ).join('')}
              </datalist>
            </div>

            <div class="event__field-group event__field-group--time">
              <label class="visually-hidden" for="event-start-time-1">From</label>
              <input class="event__input event__input--time"
                     id="event-start-time-1"
                     type="text"
                     name="event-start-time"
                     value="${getFormattedEditDateTime(dateFrom)}">
              &mdash;
              <label class="visually-hidden" for="event-end-time-1">To</label>
              <input class="event__input event__input--time"
                     id="event-end-time-1"
                     type="text"
                     name="event-end-time"
                     value="${getFormattedEditDateTime(dateTo)}">
            </div>

            <div class="event__field-group event__field-group--price">
              <label class="event__label" for="event-price-1">
                <span class="visually-hidden">Price</span>
                &euro;
              </label>
              <input class="event__input event__input--price"
                     id="event-price-1"
                     type="number"
                     name="event-price"
                     value="${basePrice}"
                     min="0">
            </div>

            <button class="event__save-btn btn btn--blue" type="submit">Save</button>
            <button class="event__reset-btn" type="reset">Delete</button>
            <button class="event__rollup-btn" type="button">
              <span class="visually-hidden">Open event</span>
            </button>
          </header>

          <section class="event__details">
            ${availableOffers.length > 0 ? `
              <section class="event__section event__section--offers">
                <h3 class="event__section-title event__section-title--offers">Offers</h3>
                <div class="event__available-offers">
                  ${offersTemplate}
                </div>
              </section>
            ` : ''}

            ${destinationItem ? `
              <section class="event__section event__section--destination">
                <h3 class="event__section-title event__section-title--destination">Destination</h3>
                <p class="event__destination-description">${destinationDescription}</p>
                ${destinationItem.pictures.length > 0 ? `
                  <div class="event__photos-container">
                    <div class="event__photos-tape">
                      ${destinationPhotos}
                    </div>
                  </div>
                ` : ''}
              </section>
            ` : ''}
          </section>
        </form>
      </li>
    `;
  }


  #createTypeOptions(currentType) {
    const types = [
      { value: 'taxi', label: 'Taxi' },
      { value: 'bus', label: 'Bus' },
      { value: 'train', label: 'Train' },
      { value: 'ship', label: 'Ship' },
      { value: 'drive', label: 'Drive' },
      { value: 'flight', label: 'Flight' },
      { value: 'check-in', label: 'Check-in' },
      { value: 'sightseeing', label: 'Sightseeing' },
      { value: 'restaurant', label: 'Restaurant' },
    ];

    return types.map((type) => `
      <div class="event__type-item">
        <input id="event-type-${type.value}-1"
               class="event__type-input visually-hidden"
               type="radio"
               name="event-type"
               value="${type.value}"
               ${currentType === type.value ? 'checked' : ''}>
        <label class="event__type-label event__type-label--${type.value}"
               for="event-type-${type.value}-1">
          ${type.label}
        </label>
      </div>
    `).join('');
  }


  reset(pointData) {
    this._state = this.#pointToState(pointData);
    this.updateElement({});
  }
}
