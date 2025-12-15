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
    if (this.#isDestroyed || !this.element) return;

    const formElement = this.element.querySelector('.event--edit');
    if (formElement) {
      // Убедимся, что предотвращаем отправку формы
      formElement.addEventListener('submit', this.#formSubmitHandler);
    }

    const typeInputs = this.element.querySelectorAll('.event__type-input');
    typeInputs.forEach((input) => {
      input.addEventListener('change', this.#typeChangeHandler);
    });

    const destinationInput = this.element.querySelector('.event__input--destination');
    if (destinationInput) {
      destinationInput.addEventListener('input', this.#destinationInputHandler);
      destinationInput.addEventListener('change', this.#destinationChangeHandler);
      destinationInput.addEventListener('keydown', this.#destinationKeydownHandler);
      destinationInput.addEventListener('blur', this.#destinationBlurHandler);
    }

    const offersCheckboxes = this.element.querySelectorAll('.event__offer-checkbox');
    offersCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', this.#offerChangeHandler);
    });

    const priceInput = this.element.querySelector('.event__input--price');
    if (priceInput) {
      // Для type="text" с pattern="[0-9]*" валидация будет проще
      priceInput.addEventListener('input', this.#priceInputHandler);
      priceInput.addEventListener('change', this.#priceChangeHandler);
      priceInput.addEventListener('keydown', this.#priceKeydownHandler);
      priceInput.addEventListener('blur', this.#priceBlurHandler);
    }

    const deleteButton = this.element.querySelector('.event__reset-btn');
    if (deleteButton) {
      // Обработчик для кнопки Delete
      deleteButton.addEventListener('click', this.#deleteButtonClickHandler);
    }

    const rollupButton = this.element.querySelector('.event__rollup-btn');
    if (rollupButton) {
      rollupButton.addEventListener('click', this.#rollupButtonClickHandler);
    }

    this.#initDatePickers();
  }

  // ДОБАВЛЯЕМ НОВЫЙ ОБРАБОТЧИК ДЛЯ КНОПКИ DELETE
  #deleteButtonClickHandler = (evt) => {
    evt.preventDefault();
    if (this.#handleDelete) {
      this.#handleDelete(this.#stateToPoint());
    }
  };

  // ИСПРАВЛЯЕМ ОБРАБОТЧИК ДЛЯ ПОЛЯ ЦЕНЫ
  #priceInputHandler = (evt) => {
    if (this.#isDestroyed) return;

    const input = evt.target;
    let value = input.value;

    // Удаляем все нецифровые символы
    const cleanedValue = value.replace(/[^\d]/g, '');

    // Ограничиваем максимальную длину (например, 6 цифр)
    const maxLength = 6;
    if (cleanedValue.length > maxLength) {
      input.value = cleanedValue.slice(0, maxLength);
      return;
    }

    // Если значение изменилось, обновляем поле
    if (value !== cleanedValue) {
      input.value = cleanedValue;
    }

    // Обновляем состояние без перерисовки
    const numericValue = cleanedValue === '' ? 0 : parseInt(cleanedValue, 10) || 0;
    this.#updateStateWithoutRerender({ basePrice: numericValue });
  };

  #priceKeydownHandler = (evt) => {
    if (this.#isDestroyed) return;

    const allowedKeys = [
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight',
      'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End'
    ];

    if (evt.ctrlKey && ['a', 'c', 'v', 'x'].includes(evt.key.toLowerCase())) {
      return;
    }

    if (!allowedKeys.includes(evt.key)) {
      evt.preventDefault();
    }
  };

  get template() {
    return createLayout(
      this.#pointData,
      this.#destinationsData,
      this.#offersData
    );
  }
}
