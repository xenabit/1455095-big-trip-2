import { typeIcons } from '/src/const.js';
import { getFormattedEditDateTime } from '../utils';
import AbstractView from '../framework/view/abstract-view';

const BLANK_POINT = {
  id: null,
  base_price: 0,
  date_from: '2023-01-01T00:00:00.000Z',
  date_to: '2023-01-01T00:00:00.000Z',
  destination: null,
  is_favorite: false,
  offers: null,
  type: null,
};

function createLayout(point, destinationsData, offersData) {
  const { base_price: basePrice, date_from: dateFrom, date_to: dateTo, destination, offers, type } = point;

  let nameOfdestination = null;

  if (destination) {
    destinationsData.forEach((element) => {
      if (destination === element.id) {
        nameOfdestination = element.name;
      }
    });
  }

  function getOfferTemplate() {
    let allOffersWithSelected = [];

    offersData.forEach((offerData) => {
      if (offerData.type === type) {
        const currentTypeOffersData = offerData.offers;

        allOffersWithSelected = [...currentTypeOffersData];

        allOffersWithSelected.forEach((item) => {
          if (offers.includes(item.id)) {
            item.checked = true;
          } else {
            item.checked = false;
          }
        });
      }
    });

    return allOffersWithSelected
      .map(
        (item) =>
          `<div class="event__offer-selector">
        <input class="event__offer-checkbox  visually-hidden" id="${item.id}" type="checkbox"  name="${item.title.toLowerCase().trim().replace(/\s+/g, '-')}" ${item.checked ? 'checked' : ''}>
        <label class="event__offer-label" for="${item.id}">
          <span class="event__offer-title">${item.title}</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${item.price}</span>
        </label>
      </div>`
      )
      .join('');
  }

  function getDestinationDesc() {
    if (destination) {
      let descOfdestination = null;
      destinationsData.forEach((element) => {
        if (destination === element.id) {
          descOfdestination = element.description;
        }
      });

      return descOfdestination;
    }
  }

  function getDestinationPictures() {
    if (destination) {
      let destinationPictures = null;

      destinationsData.forEach((element) => {
        if (destination === element.id) {
          destinationPictures = element.pictures;
        }
      });

      return destinationPictures.map((item) => `<img class="event__photo" src="${item.src}" alt="Event photo">`).join('');
    }
  }

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="${type ? typeIcons[type] : typeIcons[null]}" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>

                <div class="event__type-item">
                  <input id="event-type-taxi-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="taxi">
                  <label class="event__type-label  event__type-label--taxi" for="event-type-taxi-1">Taxi</label>
                </div>

                <div class="event__type-item">
                  <input id="event-type-bus-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="bus">
                  <label class="event__type-label  event__type-label--bus" for="event-type-bus-1">Bus</label>
                </div>

                <div class="event__type-item">
                  <input id="event-type-train-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="train">
                  <label class="event__type-label  event__type-label--train" for="event-type-train-1">Train</label>
                </div>

                <div class="event__type-item">
                  <input id="event-type-ship-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="ship">
                  <label class="event__type-label  event__type-label--ship" for="event-type-ship-1">Ship</label>
                </div>

                <div class="event__type-item">
                  <input id="event-type-drive-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="drive">
                  <label class="event__type-label  event__type-label--drive" for="event-type-drive-1">Drive</label>
                </div>

                <div class="event__type-item">
                  <input id="event-type-flight-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="flight" checked>
                  <label class="event__type-label  event__type-label--flight" for="event-type-flight-1">Flight</label>
                </div>

                <div class="event__type-item">
                  <input id="event-type-check-in-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="check-in">
                  <label class="event__type-label  event__type-label--check-in" for="event-type-check-in-1">Check-in</label>
                </div>

                <div class="event__type-item">
                  <input id="event-type-sightseeing-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="sightseeing">
                  <label class="event__type-label  event__type-label--sightseeing" for="event-type-sightseeing-1">Sightseeing</label>
                </div>

                <div class="event__type-item">
                  <input id="event-type-restaurant-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="restaurant">
                  <label class="event__type-label  event__type-label--restaurant" for="event-type-restaurant-1">Restaurant</label>
                </div>
              </fieldset>
            </div>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">
              ${point.type ? point.type : ''}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${
              destination ? nameOfdestination : ''
            }" list="destination-list-1">
            <datalist id="destination-list-1">
              ${destinationsData.map((item) => `<option value="${item.name}"></option>`)}

            </datalist>
          </div>

          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${getFormattedEditDateTime(dateFrom)}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${getFormattedEditDateTime(dateTo)}">
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice ? basePrice : 0}">
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
          <section class="event__section  event__section--offers">
            <h3 class="event__section-title  event__section-title--offers">Offers</h3>

            <div class="event__available-offers">
              ${offers ? getOfferTemplate() : ''}
            </div>
          </section>

          <section class="event__section  event__section--destination">
            <h3 class="event__section-title  event__section-title--destination">Destination</h3>
            <p class="event__destination-description"> ${destination ? getDestinationDesc() : ''}</p>
          </section>
          <section class="event__section  event__section--destination">
            <h3 class="event__section-title  event__section-title--destination">Destination</h3>
            <p class="event__destination-description">Geneva is a city in Switzerland that lies at the southern tip of expansive Lac Léman (Lake Geneva). Surrounded by the Alps and Jura mountains, the city has views of dramatic Mont Blanc.</p>

            <div class="event__photos-container">
              <div class="event__photos-tape">
                ${destination ? getDestinationPictures() : ''}
              </div>
            </div>
          </section>
        </section>
      </form>
    </li>
  `;
}

export default class PointEditView extends AbstractView {
  #pointData = null;
  #destinationsData = null;
  #offersData = null;
  #handleSubmit = null;

  constructor({ pointData = BLANK_POINT, destinationsData, offersData }, handleSubmit) {
    super();
    this.#pointData = pointData;
    this.#destinationsData = destinationsData;
    this.#offersData = offersData;
    this.#handleSubmit = handleSubmit;
    this.#setEventListeners();
  }

  #setEventListeners() {
    const formElement = this.element.querySelector('.event--edit');
    formElement.addEventListener('submit', this.#handleSubmit);

    const rollupButton = this.element.querySelector('.event__rollup-btn');
    rollupButton.addEventListener('click', this.#handleSubmit);
  }

  get template() {
    return createLayout(this.#pointData, this.#destinationsData, this.#offersData);
  }
}
