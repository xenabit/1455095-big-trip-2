// /src/presenter/new-point-presenter.js
import PointEditView from '../view/point-edit-view.js';
import { render, remove } from '../framework/render.js';
import { UserAction, UpdateType } from '../const.js'; // <-- ДОБАВЬТЕ UpdateType
import { isEscEvent } from '../utils/utils.js';

export default class NewPointPresenter {
  #container = null;
  #destinationsModel = null;
  #offersModel = null;
  #pointsModel = null; // <-- ДОБАВЛЯЕМ ССЫЛКУ НА МОДЕЛЬ ТОЧЕК
  #handleDataChange = null;
  #handleDestroy = null;

  #pointEditComponent = null;

  constructor({
    container,
    destinationsModel,
    offersModel,
    pointsModel, // <-- ДОБАВЬТЕ ЭТОТ ПАРАМЕТР
    onDataChange,
    onDestroy
  }) {
    this.#container = container;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#pointsModel = pointsModel; // <-- ТЕПЕРЬ ПЕРЕДАЕТСЯ
    this.#handleDataChange = onDataChange;
    this.#handleDestroy = onDestroy;

    // ПОДПИСЫВАЕМСЯ НА ИЗМЕНЕНИЯ В МОДЕЛИ
    if (this.#pointsModel) {
      this.#pointsModel.addObserver(this.#handleModelEvent);
    }
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

  // /src/presenter/new-point-presenter.js

  // ОБРАБОТЧИК ИЗМЕНЕНИЙ МОДЕЛИ
  // /src/presenter/new-point-presenter.js

  #handleModelEvent = (updateType, payload) => {
    console.log('📬 NewPointPresenter received model event:', updateType);

    // ЗАКРЫВАЕМ ФОРМУ ТОЛЬКО ПОСЛЕ УСПЕШНОГО СОХРАНЕНИЯ
    if (updateType === UpdateType.MAJOR || updateType === UpdateType.MINOR) {
      console.log('✅ Point operation successful, destroying form');

      // Небольшая задержка для визуального подтверждения
      setTimeout(() => {
        if (this.#pointEditComponent) {
          this.destroy();
        }
      }, 500);
    }

    // Обработка ошибок
    if (updateType === UpdateType.INIT && payload?.error) {
      console.error('❌ Failed to save point:', payload.error);
      this.setAborting();
    }
  };

  // /src/presenter/new-point-presenter.js
  #createBlankPoint() {
    const destinations = this.#destinationsModel.getDestinations();
    const offers = this.#offersModel.getOffers();

    // Берем первое направление
    const firstDestination = destinations.length > 0 ? destinations[0].id : null;

    // ЯВНО устанавливаем тип
    const defaultType = 'flight'; // Или 'taxi', но нужно убедиться что тип существует

    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 7200000); // 2 часа позже

    return {
      id: null,
      basePrice: 100,
      dateFrom: now.toISOString(),
      dateTo: twoHoursLater.toISOString(),
      destination: firstDestination,
      isFavorite: false, // ✅ ЯВНО устанавливаем
      offers: [], // ✅ ЯВНО устанавливаем (пустой массив)
      type: defaultType, // ✅ ЯВНО устанавливаем тип
    };
  }

  #handleFormSubmit = async (point) => {
    console.log('📝 New point form submitted (FULL):', point);

    // ДОБАВЬТЕ ЭТУ ПРОВЕРКУ
    console.log('🔍 Проверка полей в точке:');
    console.log('- type:', point.type);
    console.log('- destination:', point.destination);
    console.log('- basePrice:', point.basePrice);
    console.log('- isFavorite:', point.isFavorite);
    console.log('- offers:', point.offers);
    console.log('- dateFrom:', point.dateFrom);
    console.log('- dateTo:', point.dateTo);

    if (!this.#validatePoint(point)) {
      this.setAborting();
      alert('Please fill in all required fields');
      return;
    }

    this.setSaving();

    try {
    // ВАЖНО: Убедитесь, что все поля есть!
      const pointToSend = {
        basePrice: Number(point.basePrice) || 100,
        dateFrom: point.dateFrom,
        dateTo: point.dateTo,
        destination: point.destination,
        isFavorite: point.isFavorite !== undefined ? point.isFavorite : false, // ✅
        offers: point.offers || [], // ✅
        type: point.type || 'flight', // ✅
      };

      console.log('📤 FINAL point to send (with ALL fields):', pointToSend);

      await this.#handleDataChange(UserAction.ADD_POINT, pointToSend);

    } catch (error) {
      console.error('❌ Failed to create point:', error);
      this.setAborting();

      if (error.message.includes('400')) {
        alert('Server rejected the point. Make sure:\n1. Type is selected\n2. Destination is valid\n3. Price is positive\n4. All required fields are present');
      } else {
        alert(`Failed to create point: ${error.message}`);
      }
    }
  };

  destroy() {
    console.log('🗑️ NewPointPresenter.destroy() called');

    // ОТПИСЫВАЕМСЯ ОТ МОДЕЛИ
    if (this.#pointsModel) {
      this.#pointsModel.removeObserver(this.#handleModelEvent);
    }

    if (!this.#pointEditComponent) {
      return;
    }

    // Сбрасываем состояние кнопок перед уничтожением
    this.resetButtons();

    document.removeEventListener('keydown', this.#escKeyDownHandler);
    remove(this.#pointEditComponent);
    this.#pointEditComponent = null;

    if (this.#handleDestroy) {
      this.#handleDestroy();
    }

    console.log('✅ NewPointPresenter destroyed successfully');
  }

  // Добавьте метод для сброса кнопок
  resetButtons() {
    if (!this.#pointEditComponent) {
      return;
    }

    const saveButton = this.#pointEditComponent.element?.querySelector('.event__save-btn');
    const resetButton = this.#pointEditComponent.element?.querySelector('.event__reset-btn');
    const rollupButton = this.#pointEditComponent.element?.querySelector('.event__rollup-btn');

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


  #validatePoint(point) {
  // Проверяем обязательные поля
    if (!point.destination) {
      console.error('Missing destination');
      return false;
    }

    if (!point.type) {
      console.error('Missing type');
      return false;
    }

    const price = Number(point.basePrice);
    if (isNaN(price) || price <= 0) {
      console.error('Invalid price:', price);
      return false;
    }

    // Проверяем даты
    const dateFrom = new Date(point.dateFrom);
    const dateTo = new Date(point.dateTo);
    if (dateTo <= dateFrom) {
      console.error('Invalid dates: end before start');
      return false;
    }

    return true;
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
