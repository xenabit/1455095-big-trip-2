import AbstractStatefulView from '/src/framework/view/abstract-stateful-view.js';
import { typeIcons } from '/src/const.js';
import {
  getFormattedEditDateTime,
  FLATPICKR_DATE_FORMAT
} from '../utils/utils.js';

import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
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
  #isDestroyed = false;

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

  removeElement() {
    this.#isDestroyed = true;

    if (this.#dateFromPicker) {
      this.#dateFromPicker.destroy();
      this.#dateFromPicker = null;
    }

    if (this.#dateToPicker) {
      this.#dateToPicker.destroy();
      this.#dateToPicker = null;
    }

    super.removeElement();
  }

  setSaving() {
    if (this.#isDestroyed) {
      return;
    }

    const saveButton = this.element?.querySelector('.event__save-btn');
    const resetButton = this.element?.querySelector('.event__reset-btn');
    const rollupButton = this.element?.querySelector('.event__rollup-btn');

    if (saveButton) {
      saveButton.textContent = 'Saving...';
      saveButton.disabled = true;
    }

    if (resetButton) {
      resetButton.disabled = true;
    }

    if (rollupButton) {
      rollupButton.disabled = true;
    }
  }


  setDeleting() {
    if (this.#isDestroyed) {
      return;
    }

    const resetButton = this.element?.querySelector('.event__reset-btn');
    const saveButton = this.element?.querySelector('.event__save-btn');
    const rollupButton = this.element?.querySelector('.event__rollup-btn');

    if (resetButton) {
      resetButton.textContent = 'Deleting...';
      resetButton.disabled = true;
    }

    if (saveButton) {
      saveButton.disabled = true;
    }

    if (rollupButton) {
      rollupButton.disabled = true;
    }
  }

  setAborting() {
    if (this.#isDestroyed) {
      return;
    }

    const saveButton = this.element?.querySelector('.event__save-btn');
    const resetButton = this.element?.querySelector('.event__reset-btn');
    const rollupButton = this.element?.querySelector('.event__rollup-btn');

    if (saveButton) {
      saveButton.textContent = 'Save';
      saveButton.disabled = false;
    }

    if (resetButton) {
      resetButton.textContent = 'Delete';
      resetButton.disabled = false;
    }

    if (rollupButton) {
      rollupButton.disabled = false;
    }

    this.shake(() => {});
  }

  resetButtons() {
    if (this.#isDestroyed) {
      return;
    }

    const saveButton = this.element?.querySelector('.event__save-btn');
    const resetButton = this.element?.querySelector('.event__reset-btn');
    const rollupButton = this.element?.querySelector('.event__rollup-btn');

    if (saveButton) {
      saveButton.textContent = 'Save';
      saveButton.disabled = false;
    }

    if (resetButton) {
      resetButton.textContent = 'Delete';
      resetButton.disabled = false;
    }

    if (rollupButton) {
      rollupButton.disabled = false;
    }
  }

  _restoreHandlers() {
    this.#setEventListeners();
    this.#initDatePickers();
  }

  #initDatePickers() {
    if (this.#isDestroyed) {
      return;
    }

    const dateFromInput = this.element?.querySelector('#event-start-time-1');
    const dateToInput = this.element?.querySelector('#event-end-time-1');

    if (!dateFromInput || !dateToInput) {
      return;
    }

    const commonConfig = {
      enableTime: true,
      dateFormat: FLATPICKR_DATE_FORMAT,
      locale: {
        firstDayOfWeek: 1
      },
      time24hr: true,
      allowInput: true,
    };

    if (this.#dateFromPicker) {
      this.#dateFromPicker.destroy();
    }

    if (this.#dateToPicker) {
      this.#dateToPicker.destroy();
    }

    this.#dateFromPicker = flatpickr(dateFromInput, {
      ...commonConfig,
      defaultDate: getFormattedEditDateTime(this._state.dateFrom),
      onChange: (selectedDates) => {
        if (selectedDates[0]) {
          const formattedDate = selectedDates[0].toISOString();
          this.#updateStateWithoutRerender({ dateFrom: formattedDate });

          if (this.#dateToPicker) {
            this.#dateToPicker.set('minDate', selectedDates[0]);
          }
        }
      },
      onClose: (selectedDates) => {
        if (selectedDates[0]) {
          const formattedDate = selectedDates[0].toISOString();
          this.#updateStateWithoutRerender({ dateFrom: formattedDate });
        }
      }
    });

    this.#dateToPicker = flatpickr(dateToInput, {
      ...commonConfig,
      defaultDate: getFormattedEditDateTime(this._state.dateTo),
      minDate: getFormattedEditDateTime(this._state.dateFrom),
      onChange: (selectedDates) => {
        if (selectedDates[0]) {
          const formattedDate = selectedDates[0].toISOString();
          this.#updateStateWithoutRerender({ dateTo: formattedDate });
        }
      },
      onClose: (selectedDates) => {
        if (selectedDates[0]) {
          const formattedDate = selectedDates[0].toISOString();
          this.#updateStateWithoutRerender({ dateTo: formattedDate });
        }
      }
    });
  }

  #setEventListeners() {
    if (this.#isDestroyed || !this.element) {
      return;
    }

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
      priceInput.addEventListener('input', this.#priceInputHandler);
      priceInput.addEventListener('change', this.#priceChangeHandler);
      priceInput.addEventListener('keydown', this.#priceKeydownHandler);
      priceInput.addEventListener('blur', this.#priceBlurHandler);
    }

    const rollupButton = this.element.querySelector('.event__rollup-btn');
    if (rollupButton) {
      rollupButton.addEventListener('click', this.#rollupButtonClickHandler);
    }

    this.#initDatePickers();
  }

  #updateStateWithoutRerender(update) {
    if (this.#isDestroyed) {
      return;
    }

    if (!update) {
      return;
    }

    this._setState(update);
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

  #destinationInputHandler = (evt) => {
    if (this.#isDestroyed) {
      return;
    }

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

  #destinationChangeHandler = (evt) => {
    if (this.#isDestroyed) {
      return;
    }

    const destinationName = evt.target.value.trim();

    if (!destinationName) {
      this.#updateStateWithoutRerender({ destination: null });
      return;
    }

    const destination = this.#destinationsData.find((d) =>
      d.name.toLowerCase() === destinationName.toLowerCase()
    );

    if (destination) {
      this.#updateStateWithoutRerender({ destination: destination.id });
    } else {
      this.#updateStateWithoutRerender({ destination: null });
    }
  };

  #destinationKeydownHandler = (evt) => {
    if (this.#isDestroyed) {
      return;
    }

    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Tab', 'Home', 'End'
    ];

    if (allowedKeys.includes(evt.key)) {
      return;
    }

    if (!/^[a-zA-Zа-яА-ЯёЁ\s-]$/.test(evt.key)) {
      evt.preventDefault();
    }
  };

  #destinationBlurHandler = (evt) => {
    if (this.#isDestroyed) {
      return;
    }

    const destinationInput = evt.target;
    const destinationName = destinationInput.value.trim();

    if (!destinationName) {
      return;
    }

    const destinationExists = this.#destinationsData.some((d) =>
      d.name.toLowerCase() === destinationName.toLowerCase()
    );

    if (!destinationExists) {
      this.#showDestinationError(destinationInput, `"${destinationName}" не найден. Выберите из списка.`);
      destinationInput.value = '';
      this.#updateStateWithoutRerender({ destination: null });
    }
  };

  #showDestinationError(input, message) {
    if (this.#isDestroyed || !input.parentElement) {
      return;
    }

    let errorElement = input.parentElement.querySelector('.destination-error');

    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'destination-error';
      errorElement.style.color = '#ff6b6b';
      errorElement.style.fontSize = '12px';
      errorElement.style.marginTop = '4px';
      input.parentElement.appendChild(errorElement);
    }

    errorElement.textContent = message;

    setTimeout(() => {
      if (errorElement && errorElement.parentElement) {
        errorElement.remove();
      }
    }, 3000);
  }

  #offerChangeHandler = (evt) => {
    if (this.#isDestroyed) {
      return;
    }

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

    this.#updateStateWithoutRerender({ offers: updatedOffers });
  };

  #priceInputHandler = (evt) => {
    if (this.#isDestroyed) {
      return;
    }

    const input = evt.target;
    const value = input.value;

    const cleanedValue = value.replace(/[^\d-]/g, '');

    let finalValue = cleanedValue.replace(/(?!^-)-/g, '');

    if (finalValue.startsWith('--')) {
      finalValue = finalValue.replace(/--+/g, '-');
    }

    if (value !== finalValue) {
      input.value = finalValue;
    }

    const numericValue = finalValue === '-' || finalValue === '' ? 0 : parseInt(finalValue, 10) || 0;
    this.#updateStateWithoutRerender({ basePrice: numericValue });
  };

  #priceChangeHandler = (evt) => {
    if (this.#isDestroyed) {
      return;
    }

    const value = evt.target.value;
    const basePrice = value === '' ? 0 : parseInt(value, 10) || 0;

    this.#updateStateWithoutRerender({ basePrice: basePrice });
  };

  #priceKeydownHandler = (evt) => {
    if (this.#isDestroyed) {
      return;
    }

    const allowedKeys = [
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      '-',
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight',
      'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End'
    ];

    if (evt.ctrlKey && ['a', 'c', 'v', 'x'].includes(evt.key.toLowerCase())) {
      return;
    }

    if (evt.key === '-' && evt.target.selectionStart !== 0) {
      evt.preventDefault();
      return;
    }

    if (!allowedKeys.includes(evt.key)) {
      evt.preventDefault();
    }
  };

  #priceBlurHandler = (evt) => {
    if (this.#isDestroyed) {
      return;
    }

    const input = evt.target;
    const value = input.value;

    if (!value || value === '' || value === '-') {
      input.value = '0';
      this.#updateStateWithoutRerender({ basePrice: 0 });
      return;
    }

    const numericValue = parseInt(value, 10);

    if (numericValue < 0) {
      input.value = '0';
      this.#updateStateWithoutRerender({ basePrice: 0 });
      this.#showPriceError(input, 'Цена не может быть отрицательной');
    }
  };

  #showPriceError(input, message) {
    if (this.#isDestroyed || !input.parentElement) {
      return;
    }

    let errorElement = input.parentElement.querySelector('.price-error');

    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'price-error';
      errorElement.style.color = '#ff6b6b';
      errorElement.style.fontSize = '12px';
      errorElement.style.marginTop = '4px';
      input.parentElement.appendChild(errorElement);
    }

    errorElement.textContent = message;

    setTimeout(() => {
      if (errorElement && errorElement.parentElement) {
        errorElement.remove();
      }
    }, 3000);
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    if (this.#isDestroyed) {
      return;
    }


    Promise.resolve().then(() => {
      const formData = this.#collectFormData();


      if (!formData) {
        this.resetButtons();
        this.#showQuickError('Please fill in all required fields correctly');
        return;
      }

      if (!this.#validateFormBasic(formData)) {
        this.resetButtons();
        this.#showQuickError('Invalid data. Please check your input.');
        return;
      }


      if (this.#handleSubmit) {
        this.#handleSubmit(formData);
      } else {
        this.resetButtons();
      }
    }).catch(() => {
      this.resetButtons();
    });
  };

  #validateFormBasic(formData) {
    if (!formData.destination) {
      return false;
    }

    if (typeof formData.basePrice !== 'number' || formData.basePrice <= 0) {
      return false;
    }

    if (!formData.dateFrom || !formData.dateTo) {
      return false;
    }

    return true;
  }

  #collectFormData() {

    const typeRadios = this.element.querySelectorAll('.event__type-input');
    let selectedType = 'flight';
    typeRadios.forEach((radio) => {
      if (radio.checked) {
        selectedType = radio.value;
      }
    });

    const formData = {
      id: this._state.id,
      basePrice: Number(this._state.basePrice) || 0,
      dateFrom: this._state.dateFrom,
      dateTo: this._state.dateTo,
      destination: this._state.destination,
      isFavorite: this._state.isFavorite || false,
      offers: this._state.offers || [],
      type: selectedType || 'flight',
    };

    return formData;
  }

  #validateForm() {
    if (!this.element) {
      return false;
    }

    const destinationInput = this.element.querySelector('.event__input--destination');
    const priceInput = this.element.querySelector('.event__input--price');

    if (!destinationInput || !destinationInput.value.trim()) {
      this.#showQuickError('Выберите пункт назначения из списка');
      destinationInput?.focus();
      return false;
    }

    const destinationName = destinationInput.value.trim();
    const destinationExists = this.#destinationsData.some((d) =>
      d.name.toLowerCase() === destinationName.toLowerCase()
    );

    if (!destinationExists) {
      this.#showQuickError(`"${destinationName}" не найден. Выберите из списка.`);
      destinationInput.focus();
      return false;
    }

    if (!priceInput || !priceInput.value || priceInput.value === '0') {
      this.#showQuickError('Введите цену больше 0');
      priceInput?.focus();
      return false;
    }

    const price = parseInt(priceInput.value, 10);
    if (isNaN(price) || price <= 0) {
      this.#showQuickError('Цена должна быть числом больше 0');
      priceInput.focus();
      return false;
    }

    return true;
  }

  #showQuickError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff6b6b;
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      z-index: 10000;
      animation: fadeInOut 3s ease;
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-10px); }
        10% { opacity: 1; transform: translateY(0); }
        90% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-10px); }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(errorDiv);

    setTimeout(() => {
      if (errorDiv.parentElement) {
        errorDiv.remove();
      }
      if (style.parentElement) {
        style.remove();
      }
    }, 3000);
  }

  #formResetHandler = (evt) => {
    evt.preventDefault();
    if (this.#handleDelete) {
      this.#handleDelete(this.#stateToPoint());
    }
  };

  #rollupButtonClickHandler = (evt) => {
    evt.preventDefault();
    if (this.#handleRollupClick) {
      this.#handleRollupClick();
    }
  };

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

    const validOffers = state.offers.filter((offerId) =>
      availableOffers.some((offer) => offer.id === offerId)
    );

    if (validOffers.length !== state.offers.length) {
      this._setState({ offers: validOffers });
    }
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
        <form class="event event--edit" action="#" method="post" onsubmit="return false;">
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
                     autocomplete="off"
                     placeholder="Выберите из списка..."
                     required>
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
                     step="1"
                     pattern="\\d*"
                     inputmode="numeric"
                     placeholder="0"
                     required>
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
