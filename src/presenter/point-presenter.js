// /src/presenter/point-presenter.js

import PointEditView from '/src/view/point-edit-view.js';
import PointItemView from '/src/view/point-item-view.js';
import { Mode, UserAction } from '/src/const.js';
import { render, replace, remove } from '/src/framework/render.js';
import { isEscEvent } from '../utils/utils.js';

export default class PointPresenter {
  #container = null;
  #destinationsModel = null;
  #offersModel = null;

  #point = null;
  #mode = Mode.DEFAULT;

  #pointComponent = null;
  #pointEditComponent = null;

  #handlePointChange = null;
  #handleModeChange = null;

  constructor({
    container,
    destinationsModel,
    offersModel,
    handlePointChange,
    handleModeChange
  }) {
    this.#container = container;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#handlePointChange = handlePointChange;
    this.#handleModeChange = handleModeChange;
  }

  init(point) {
    console.log('🎯 PointPresenter init called with point:', point);

    this.#point = point;

    const prevPointComponent = this.#pointComponent;
    const prevPointEditComponent = this.#pointEditComponent;

    // ДЕБАГ: Проверяем данные
    console.log('📍 Destination ID:', point.destination);
    console.log('💰 Base Price:', point.basePrice);
    console.log('📅 Date From:', point.dateFrom);
    console.log('📅 Date To:', point.dateTo);
    console.log('⭐ Is Favorite:', point.isFavorite);
    console.log('🛠️ Offers:', point.offers);

    this.#pointComponent = new PointItemView(
      {
        pointData: this.#point,
        destinationsData: this.#destinationsModel.getDestinations(),
        offersData: this.#offersModel.getOffers(),
      },
      this.#handleRollupClick,
      this.#handleFavoriteClick
    );

    this.#pointEditComponent = new PointEditView(
      {
        pointData: this.#point,
        destinationsData: this.#destinationsModel.getDestinations(),
        offersData: this.#offersModel.getOffers(),
      },
      this.#handleFormSubmit,
      this.#handleDeleteClick,
      this.#handleRollupClick
    );

    if (!prevPointComponent || !prevPointEditComponent) {
      render(this.#pointComponent, this.#container);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#pointComponent, prevPointComponent);
    }

    if (this.#mode === Mode.EDITING) {
      this.#pointEditComponent.reset(this.#point);
      replace(this.#pointEditComponent, prevPointComponent);
    }

    remove(prevPointComponent);
    remove(prevPointEditComponent);
  }

  resetView = () => {
    if (this.#mode !== Mode.DEFAULT) {
      this.#closeForm();
    }
  };

  destroy() {
    remove(this.#pointComponent);
    remove(this.#pointEditComponent);
  }

  #openForm = () => {
    replace(this.#pointEditComponent, this.#pointComponent);
    this.#handleModeChange();
    this.#mode = Mode.EDITING;
    document.addEventListener('keydown', this.#handleEscKeyDown);
  };

  #closeForm = () => {
    replace(this.#pointComponent, this.#pointEditComponent);
    this.#mode = Mode.DEFAULT;
    document.removeEventListener('keydown', this.#handleEscKeyDown);
  };

  #handleRollupClick = () => {
    if (this.#mode === Mode.DEFAULT) {
      this.#openForm();
    } else {
      this.#closeForm();
    }
  };


  // /src/presenter/point-presenter.js

  // /src/presenter/point-presenter.js

  #handleFormSubmit = async (updatedPoint) => {
    console.log('📝 Point form submitted:', updatedPoint);

    // Устанавливаем состояние "сохранение"
    this.#pointEditComponent?.setSaving();

    try {
    // Отправляем обновление
      await this.#handlePointChange(UserAction.UPDATE_POINT, updatedPoint);

      console.log('✅ Form submitted successfully');
      // Форма закроется через handleModelEvent когда модель уведомит об успешном обновлении

    } catch (error) {
      console.error('❌ Update failed:', error);

      // Возвращаем кнопкам обычное состояние
      this.#pointEditComponent?.setAborting();

      // Показываем сообщение об ошибке
      alert('Failed to save changes. Please try again.');
    }
  };


  #handleDeleteClick = async (point) => {
    console.log('🗑️ Delete button clicked for point:', point?.id || this.#point.id);

    // Устанавливаем состояние "удаление"
    this.#pointEditComponent?.setDeleting();

    try {
    // Отправляем запрос на удаление
      await this.#handlePointChange(UserAction.DELETE_POINT, point || this.#point);

      console.log('✅ Delete request sent successfully');
      // Форма закроется через handleModelEvent когда модель уведомит об успешном удалении

    } catch (error) {
      console.error('❌ Failed to delete point:', error);

      // Возвращаем кнопкам обычное состояние
      this.#pointEditComponent?.setAborting();

      // Показываем сообщение об ошибке
      alert('Failed to delete point. Please try again.');
    }
  };

  setAborting() {
    if (this.#pointEditComponent) {
      this.#pointEditComponent.setAborting();
    }
  }

  #handleFavoriteClick = () => {
    console.log('⭐ Toggling favorite for point:', this.#point.id);
    const updatedPoint = {
      ...this.#point,
      isFavorite: !this.#point.isFavorite
    };

    this.#handlePointChange(UserAction.UPDATE_POINT, updatedPoint);
  };

  #handleEscKeyDown = (evt) => {
    if (isEscEvent(evt)) {
      evt.preventDefault();
      this.#closeForm();
    }
  };

  // Метод для обновления точки в ответ на изменение модели
  updatePoint(updatedPoint) {
    if (this.#point.id !== updatedPoint.id) {
      return;
    }

    console.log('🔄 Updating point in presenter:', updatedPoint);
    this.#point = updatedPoint;
    this.init(updatedPoint);
  }
}
