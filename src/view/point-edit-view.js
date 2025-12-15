import AbstractStatefulView from '/src/framework/view/abstract-stateful-view.js';
import { typeIcons } from '/src/const.js';
import {
  getFormattedEditDateTime,
  parseFlatpickrDate,
  FLATPICKR_DATE_FORMAT
} from '../utils/utils.js';

// Импортируем flatpickr и стили
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

// Дополнительные стили для темы (опционально)
import 'flatpickr/dist/themes/material_blue.css';

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
  #dateFromPicker = null;
  #dateToPicker = null;

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

  /**
   * Удаляем компонент и уничтожаем flatpickr инстансы
   */
  removeElement() {
    super.removeElement();

    if (this.#dateFromPicker) {
      this.#dateFromPicker.destroy();
      this.#dateFromPicker = null;
    }

    if (this.#dateToPicker) {
      this.#dateToPicker.destroy();
      this.#dateToPicker = null;
    }
  }

  /**
   * Восстанавливаем обработчики после перерисовки
   */
  _restoreHandlers() {
    this.#setEventListeners();
    this.#initDatePickers();
  }

  /**
   * Инициализируем flatpickr для полей дат
   */
  #initDatePickers() {
    const dateFromInput = this.element.querySelector('#event-start-time-1');
    const dateToInput = this.element.querySelector('#event-end-time-1');

    if (!dateFromInput || !dateToInput) {
      return;
    }

    // Настройки для flatpickr согласно ТЗ
    const commonConfig = {
      enableTime: true,
      dateFormat: FLATPICKR_DATE_FORMAT,
      locale: {
        firstDayOfWeek: 1
      },
      time24hr: true,
      allowInput: true,
    };

    // Уничтожаем старые инстансы если они есть
    if (this.#dateFromPicker) {
      this.#dateFromPicker.destroy();
    }

    if (this.#dateToPicker) {
      this.#dateToPicker.destroy();
    }

    // Создаем первый datepicker для даты начала
    this.#dateFromPicker = flatpickr(dateFromInput, {
      ...commonConfig,
      defaultDate: getFormattedEditDateTime(this._state.dateFrom),
      onChange: (selectedDates) => {
        if (selectedDates[0]) {
          const formattedDate = selectedDates[0].toISOString();
          this.updateElement({
            dateFrom: formattedDate,
          });

          // Обновляем минимальную дату для dateToPicker
          if (this.#dateToPicker) {
            this.#dateToPicker.set('minDate', selectedDates[0]);
          }
        }
      },
    });

    // Создаем второй datepicker для даты окончания
    this.#dateToPicker = flatpickr(dateToInput, {
      ...commonConfig,
      defaultDate: getFormattedEditDateTime(this._state.dateTo),
      minDate: getFormattedEditDateTime(this._state.dateFrom),
      onChange: (selectedDates) => {
        if (selectedDates[0]) {
          const formattedDate = selectedDates[0].toISOString();
          this.updateElement({
            dateTo: formattedDate,
          });
        }
      },
    });
  }

  /**
   * Настраивает обработчики событий
   */
  #setEventListeners() {
    const formElement = this.element.querySelector('.event--edit');
    if (formElement) {
      formElement.addEventListener('submit', this.#formSubmitHandler);
      formElement.addEventListener('reset', this.#formResetHandler);
    }


    const typeInputs = this.element.querySelectorAll('.event__type-input');
    typeInputs.forEach((input) => {
      input.addEventListener('change', this.#typeChangeHandler);
    });

    const destinationInput = this.element.querySelector('.event__input--destination');
    if (destinationInput) {
      destinationInput.addEventListener('change', this.#destinationChangeHandler);
      destinationInput.addEventListener('input', this.#destinationInputHandler);
    }

    const offersCheckboxes = this.element.querySelectorAll('.event__offer-checkbox');
    offersCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', this.#offerChangeHandler);
    });

    const priceInput = this.element.querySelector('.event__input--price');
    if (priceInput) {
      priceInput.addEventListener('change', this.#priceChangeHandler);
      priceInput.addEventListener('input', this.#priceInputHandler);
    }

    const rollupButton = this.element.querySelector('.event__rollup-btn');
    if (rollupButton) {
      rollupButton.addEventListener('click', this.#rollupButtonClickHandler);
    }

    // Инициализируем datepickers
    this.#initDatePickers();
  }

  /**
   * Обработчик изменения типа точки
   */
  #typeChangeHandler = (evt) => {
    evt.preventDefault();
    const newType = evt.target.value;

    this.updateElement({
      type: newType,
      offers: [],
      icon: typeIcons[newType],
    });
  };

  /**
   * Обработчик изменения пункта назначения
   */
  #destinationChangeHandler = (evt) => {
    const destinationName = evt.target.value.trim();
    if (!destinationName) {
      return;
    }

    const destination = this.#destinationsData.find((d) =>
      d.name.toLowerCase() === destinationName.toLowerCase()
    );

    if (destination) {
      this.updateElement({
        destination: destination.id,
      });
    }
  };

  /**
   * Обработчик ввода в поле пункта назначения
   */
  #destinationInputHandler = (evt) => {
    const value = evt.target.value;
    const datalist = this.element.querySelector('#destination-list-1');
    if (!datalist) {
      return;
    }

    const options = Array.from(datalist.querySelectorAll('option'));

    options.forEach((option) => {
      if (option.value.toLowerCase().includes(value.toLowerCase())) {
        option.style.display = 'block';
      } else {
        option.style.display = 'none';
      }
    });
  };

  /**
   * Обработчик изменения дополнительных предложений
   */
  #offerChangeHandler = (evt) => {
    const offerId = evt.target.id;
    const isChecked = evt.target.checked;
    let updatedOffers = [...this._state.offers];

    if (isChecked) {
      if (!updatedOffers.includes(offerId)) {
        updatedOffers.push(offerId);
      }
    } else {
      updatedOffers = updatedOffers.filter((id) => id !== offerId);
    }

    this.updateElement({ offers: updatedOffers });
  };

  /**
   * Обработчик изменения цены
   */
  #priceChangeHandler = (evt) => {
    const value = evt.target.value;
    const basePrice = parseInt(value, 10) || 0;

    if (basePrice >= 0) {
      this.updateElement({ basePrice: basePrice });
    }
  };

  /**
   * Обработчик ввода цены (валидация)
   */
  #priceInputHandler = (evt) => {
    const value = evt.target.value;
    if (!/^\d*$/.test(value)) {
      evt.target.value = value.replace(/[^\d]/g, '');
    }
  };

  /**
   * Обработчик отправки формы
   */
  #formSubmitHandler = (evt) => {
    evt.preventDefault();

    // Получаем актуальные значения из flatpickr
    if (this.#dateFromPicker && this.#dateFromPicker.input) {
      const dateFromValue = this.#dateFromPicker.input.value;
      if (dateFromValue) {
        this._state.dateFrom = parseFlatpickrDate(dateFromValue);
      }
    }

    if (this.#dateToPicker && this.#dateToPicker.input) {
      const dateToValue = this.#dateToPicker.input.value;
      if (dateToValue) {
        this._state.dateTo = parseFlatpickrDate(dateToValue);
      }
    }

    if (this.#handleSubmit) {
      this.#handleSubmit(this.#stateToPoint());
    }
  };

  /**
   * Обработчик сброса формы
   */
  #formResetHandler = (evt) => {
    evt.preventDefault();
    if (this.#handleDelete) {
      this.#handleDelete(this.#stateToPoint());
    }
  };

  /**
   * Обработчик клика по кнопке свернуть - ИСПРАВЛЕННАЯ СТРЕЛОЧНАЯ ФУНКЦИЯ
   */
  #rollupButtonClickHandler = (evt) => {
    evt.preventDefault();
    if (this.#handleRollupClick) {
      this.#handleRollupClick();
    }
  };


  /**
   * Преобразует данные точки в состояние компонента
   */
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

  /**
   * Преобразует состояние компонента в данные точки
   */
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

  /**
   * Создает шаблон на основе состояния
   */
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

    const destinationDescription = destinationItem ? destinationItem.description : '';
    const destinationPhotos = destinationItem && destinationItem.pictures ?
      destinationItem.pictures.map((pic) =>
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
              <input class="event__input event__input--time flatpickr-input"
                     id="event-start-time-1"
                     type="text"
                     name="event-start-time"
                     value="${getFormattedEditDateTime(dateFrom)}"
                     data-input>
              &mdash;
              <label class="visually-hidden" for="event-end-time-1">To</label>
              <input class="event__input event__input--time flatpickr-input"
                     id="event-end-time-1"
                     type="text"
                     name="event-end-time"
                     value="${getFormattedEditDateTime(dateTo)}"
                     data-input>
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
                     min="0"
                     step="1">
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
                ${destinationDescription ? `
                  <p class="event__destination-description">${destinationDescription}</p>
                ` : ''}
                ${destinationItem.pictures && destinationItem.pictures.length > 0 ? `
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

  /**
   * Создает варианты типов точек
   */
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

  /**
   * Сбрасывает состояние формы
   */
  reset(pointData) {
    this._state = this.#pointToState(pointData);
    this.updateElement({});
  }
}
