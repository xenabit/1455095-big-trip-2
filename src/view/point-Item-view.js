// /src/view/point-item-view.js (исправляем шаблон)
import AbstractView from '../framework/view/abstract-view';
import {
  getFormattedEventDay,
  getFormattedAttrEventDay,
  getFormattedTimeEvent,
  getFormattedAttrDatatimeEvent,
  getTimeDuration,
} from '../utils/utils.js';
import { typeIcons } from '/src/const.js';

function createLayout(pointData, destinationsData, offersData) {
  const {
    base_price: basePrice,
    date_from: dateFrom,
    date_to: dateTo,
    destination,
    is_favorite: isFavorite,
    offers,
    type,
  } = pointData;

  // Используем dayjs для форматирования дат
  const eventDay = getFormattedEventDay(dateFrom);
  const eventTimeStart = getFormattedTimeEvent(dateFrom);
  const eventTimeEnd = getFormattedTimeEvent(dateTo);
  const eventDayAttr = getFormattedAttrEventDay(dateFrom);
  const eventTimeStartAttr = getFormattedAttrDatatimeEvent(dateFrom);
  const eventTimeEndAttr = getFormattedAttrDatatimeEvent(dateTo);
  const timeDurationInMinutes = getTimeDuration(dateFrom, dateTo);

  // НАЙДЕМ НАЗВАНИЕ НАПРАВЛЕНИЯ БЕЗОПАСНО
  let nameOfDestination = '';
  if (destination && destinationsData) {
    const destinationItem = destinationsData.find((element) => destination === element.id);
    nameOfDestination = destinationItem ? destinationItem.name : '';
  }

  // НАЙДЕМ ВЫБРАННЫЕ ПРЕДЛОЖЕНИЯ БЕЗОПАСНО
  let selectedOffers = [];
  if (offersData && offers) {
    offersData.forEach((offerData) => {
      if (offerData.type === type) {
        const currentTypeOffersData = offerData.offers;

        selectedOffers = offers.map((id) => {
          const matchedOffer = currentTypeOffersData.find(
            (element) => element.id === id
          );
          return matchedOffer;
        }).filter(Boolean); // Убираем undefined
      }
    });
  }

  // ИСПРАВЛЯЕМ ИКОНКУ - ЕСЛИ typeIcons[type] НЕ СУЩЕСТВУЕТ, ИСПОЛЬЗУЕМ ЗАПАСНУЮ
  const iconSrc = typeIcons[type] || typeIcons.null;

  return `
        <li class="trip-events__item">
          <div class="event">
            <time class="event__date" datetime="${eventDayAttr}">${eventDay}</time>
            <div class="event__type">
              <img class="event__type-icon" width="42" height="42" src="${iconSrc}" alt="Event type icon">
            </div>
            <h3 class="event__title">${nameOfDestination || 'New Point'}</h3>
            <div class="event__schedule">
              <p class="event__time">
                <time class="event__start-time" datetime="${eventTimeStartAttr}">${eventTimeStart}</time>
                &mdash;
                <time class="event__end-time" datetime="${eventTimeEndAttr}">${eventTimeEnd}</time>
              </p>
              <p class="event__duration">${timeDurationInMinutes}</p>
            </div>
            <p class="event__price">
              &euro;&nbsp;<span class="event__price-value">${basePrice || 0}</span>
            </p>
            ${selectedOffers.length > 0 ? `
              <h4 class="visually-hidden">Offers:</h4>
              <ul class="event__selected-offers">
              ${selectedOffers.map((item) => `
                <li class="event__offer">
                  <span class="event__offer-title">${item.title}</span>
                  &plus;&euro;&nbsp;
                  <span class="event__offer-price">${item.price}</span>
                </li>
              `).join('')}
              </ul>
            ` : ''}
            <button class="event__favorite-btn ${isFavorite ? 'event__favorite-btn--active' : ''}" type="button">
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

export default class PointItemView extends AbstractView {
  #pointData = null;
  #destinationsData = null;
  #offersData = null;
  #handleRollupClick = null;
  #handleFavoriteClick = null;

  constructor({ pointData, destinationsData, offersData }, handleRollupClick, handleFavoriteClick) {
    super();
    this.#pointData = pointData;
    this.#destinationsData = destinationsData;
    this.#offersData = offersData;
    this.#handleRollupClick = handleRollupClick;
    this.#handleFavoriteClick = handleFavoriteClick;

    this.#setEventListeners();
  }

  #setEventListeners() {
    const itemElement = this.element.querySelector('.event__rollup-btn');
    if (itemElement) {
      itemElement.addEventListener('click', this.#handleRollupClick);
    }

    const favoriteElement = this.element.querySelector('.event__favorite-btn');
    if (favoriteElement) {
      favoriteElement.addEventListener('click', this.#handleFavoriteClick);
    }
  }

  get template() {
    return createLayout(
      this.#pointData,
      this.#destinationsData,
      this.#offersData
    );
  }
}
