import { createElement } from '/src/render.js';
import { getFormattedEventDay, getFormattedAttrEventDay, getFormattedTimeEvent, getFormattedAttrDatatimeEvent} from '../utils';
import { typeIcons } from '/src/const.js';


function createLayout(pointModel, destinationsModel, offersModel) {
  const {
    base_price: basePrice,
    date_from: dateFrom,
    date_to: dateTo,
    destination,
    is_favorite: isFavorite,
    offers,
    type
  } = pointModel;

  const eventDay = getFormattedEventDay(dateFrom);
  const eventTimeStart = getFormattedTimeEvent(dateFrom);
  const eventTimeEnd = getFormattedTimeEvent(dateTo);
  const eventDayAttr = getFormattedAttrEventDay(dateFrom);
  const eventTimeStartAttr = getFormattedAttrDatatimeEvent(dateFrom);
  const eventTimeEndAttr = getFormattedAttrDatatimeEvent(dateTo);

  let nameOfdestination;

  destinationsModel.forEach((element) => {
    if (destination === element.id) {
      nameOfdestination = element.name;
    }
  });

  let selectedOffers = [];

  offersModel.forEach((offerModel) => {
    if (offerModel.type === type) {
      const currentTypeOffersModel = offerModel.offers;

      selectedOffers = offers.map((id) => {
        const mathedOffer = currentTypeOffersModel.find((element) => element.id === id);
        return mathedOffer;
      });

    }
  });

  return `
        <li class="trip-events__item">
          <div class="event">
            <time class="event__date" datetime="${eventDayAttr}">${eventDay}</time>
            <div class="event__type">
              <img class="event__type-icon" width="42" height="42" src="${typeIcons[type]}" alt="Event type icon">
            </div>
            <h3 class="event__title">${nameOfdestination}</h3>
            <div class="event__schedule">
              <p class="event__time">
                <time class="event__start-time" datetime="${eventTimeStartAttr}">${eventTimeStart}</time>
                &mdash;
                <time class="event__end-time" datetime="${eventTimeEndAttr}">${eventTimeEnd}</time>
              </p>
              <p class="event__duration">40M</p>
            </div>
            <p class="event__price">
              &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
            </p>
            <h4 class="visually-hidden">Offers:</h4>
            <ul class="event__selected-offers">
            ${selectedOffers.map((item) => `
              <li class="event__offer">
                <span class="event__offer-title">${item.title}</span>
                &plus;&euro;&nbsp;
                <span class="event__offer-price">${item.price}</span>
              </li>
            `)}
            </ul>
            <button class="event__favorite-btn ${isFavorite ? 'event__favorite-btn--active' : ''} " type="button">
              <span class="visually-hidden">Add to favorite</span>
              <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
                <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
              </svg>
            </button>
            <button class="event__rollup-btn" type="button">
              <span class="visually-hidden">Open event</span>
            </button>
          </div>
        </li>
  `;
}

export default class PointItemView {
  constructor({pointModel, destinationsModel, offersModel}){
    this.pointModel = pointModel;
    this.destinationsModel = destinationsModel;
    this.offersModel = offersModel;
  }

  getTemplate() {
    return createLayout(this.pointModel, this.destinationsModel, this.offersModel);
  }

  getElement() {
    if(!this.element) {
      this.element = createElement(this.getTemplate());
    }

    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}
