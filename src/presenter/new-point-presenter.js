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

    // СОЗДАЕМ ПУСТУЮ ТОЧКУ С ПЕРВЫМ НАПРАВЛЕНИЕМ ИЗ СПИСКА
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
    const destinations = this.#destinationsModel.getDestinations();
    const offers = this.#offersModel.getOffers();

    // Берем первое направление и первый тип offers
    const firstDestination = destinations.length > 0 ? destinations[0].id : null;
    const firstOfferType = offers.length > 0 ? offers[0].type : 'flight';

    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 3600000);

    return {
      id: null, // Будет сгенерирован в модели
      basePrice: 100, // Начальная цена не 0
      dateFrom: now.toISOString(),
      dateTo: oneHourLater.toISOString(),
      destination: firstDestination, // Ставим первое направление
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

    this.#pointEditComponent.setSaving();
  }

  setAborting() {
    if (!this.#pointEditComponent) {
      return;
    }

    this.#pointEditComponent.setAborting();
  }

  #handleFormSubmit = async (point) => {
    // ПРОВЕРКА ОБЯЗАТЕЛЬНЫХ ПОЛЕЙ
    if (!this.#validatePoint(point)) {
      alert('Please fill in all required fields: destination and price (must be positive)');
      this.#pointEditComponent.setAborting();
      return;
    }

    // Форматируем данные для передачи в модель
    const pointToSend = {
      id: null, // Модель сама сгенерирует ID
      basePrice: Number(point.basePrice),
      dateFrom: point.dateFrom,
      dateTo: point.dateTo,
      destination: point.destination,
      isFavorite: point.isFavorite || false,
      offers: point.offers || [],
      type: point.type || 'flight',
    };

    try {
      await this.#handleDataChange(UserAction.ADD_POINT, pointToSend);
    } catch (error) {
      console.error('❌ Failed to add point:', error);
      this.setAborting();
    }
  };

  #validatePoint(point) {
    // Проверяем обязательные поля
    if (!point.destination) {
      return false;
    }

    const price = Number(point.basePrice);
    if (isNaN(price) || price < 0) {
      return false;
    }

    // Проверяем даты
    const dateFrom = new Date(point.dateFrom);
    const dateTo = new Date(point.dateTo);
    if (dateTo <= dateFrom) {
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
