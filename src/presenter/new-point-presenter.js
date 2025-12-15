// /src/presenter/new-point-presenter.js
import PointEditView from '../view/point-edit-view.js';
import { render, remove } from '../framework/render.js';
import { UserAction } from '../const.js';
import { isEscEvent } from '../utils/utils.js';

export default class NewPointPresenter {
  #container = null;
  #destinationsModel = null;
  #offersModel = null;
  #handleDataChange = null;
  #handleDestroy = null;

  #pointEditComponent = null;

  constructor({
    container,
    destinationsModel,
    offersModel,
    onDataChange,
    onDestroy
  }) {
    this.#container = container;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#handleDataChange = onDataChange;
    this.#handleDestroy = onDestroy;
  }

  init() {
    if (this.#pointEditComponent) {
      return;
    }

    // СОЗДАЕМ ТОЧКУ С РЕАЛЬНЫМИ ЗНАЧЕНИЯМИ ПО УМОЛЧАНИЮ
    const BLANK_POINT = this.#createBlankPoint();

    this.#pointEditComponent = new PointEditView(
      {
        pointData: BLANK_POINT,
        destinationsData: this.#destinationsModel.getDestinations(),
        offersData: this.#offersModel.getOffers(),
      },
      this.#handleFormSubmit,
      this.#handleDeleteClick,
      this.#handleRollupClick
    );

    render(this.#pointEditComponent, this.#container, 'afterbegin');
    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  #createBlankPoint() {
    // Берем первый существующий destination
    const destinations = this.#destinationsModel.getDestinations();
    const firstDestination = destinations.length > 0 ? destinations[0] : null;

    // Берем первый тип offers
    const offers = this.#offersModel.getOffers();
    const firstOfferType = offers.length > 0 ? offers[0].type : 'flight';

    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 3600000);

    return {
      id: null,
      basePrice: 100, // Начальная цена по умолчанию
      dateFrom: now.toISOString(),
      dateTo: oneHourLater.toISOString(),
      destination: firstDestination ? firstDestination.id : null,
      isFavorite: false,
      offers: [],
      type: firstOfferType,
    };
  }

  destroy() {
    if (!this.#pointEditComponent) {
      return;
    }

    document.removeEventListener('keydown', this.#escKeyDownHandler);
    remove(this.#pointEditComponent);
    this.#pointEditComponent = null;

    if (this.#handleDestroy) {
      this.#handleDestroy();
    }
  }

  setSaving() {
    if (!this.#pointEditComponent) {
      return;
    }

    const saveButton = this.#pointEditComponent.element.querySelector('.event__save-btn');
    if (saveButton) {
      saveButton.textContent = 'Saving...';
      saveButton.disabled = true;
    }

    // Также блокируем все инпуты
    const inputs = this.#pointEditComponent.element.querySelectorAll('input, button');
    inputs.forEach((input) => {
      if (input !== saveButton) {
        input.disabled = true;
      }
    });
  }

  setAborting() {
    if (!this.#pointEditComponent) {
      return;
    }

    const resetFormState = () => {
      if (this.#pointEditComponent) {
        const saveButton = this.#pointEditComponent.element.querySelector('.event__save-btn');
        if (saveButton) {
          saveButton.textContent = 'Save';
          saveButton.disabled = false;
        }

        // Разблокируем все инпуты
        const inputs = this.#pointEditComponent.element.querySelectorAll('input, button');
        inputs.forEach((input) => {
          input.disabled = false;
        });
      }
    };

    this.#pointEditComponent.shake(resetFormState);
  }

  #handleFormSubmit = (point) => {
    // ПРОВЕРЯЕМ, ЧТО ВСЕ ОБЯЗАТЕЛЬНЫЕ ПОЛЯ ЗАПОЛНЕНЫ
    if (!this.#validatePoint(point)) {
      alert('Please fill in all required fields: destination and price');
      this.setAborting();
      return;
    }

    this.#handleDataChange(UserAction.ADD_POINT, point);
  };

  #validatePoint(point) {
    // Проверяем обязательные поля
    if (!point.destination || point.destination === null) {
      return false;
    }

    if (point.basePrice === undefined || point.basePrice === null || point.basePrice < 0) {
      return false;
    }

    return true;
  }

  #handleDeleteClick = () => {
    this.destroy();
  };

  #handleRollupClick = () => {
    this.destroy();
  };

  #escKeyDownHandler = (evt) => {
    if (isEscEvent(evt)) {
      evt.preventDefault();
      this.destroy();
    }
  };
}
