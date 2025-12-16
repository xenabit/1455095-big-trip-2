import PointEditView from '../view/point-edit-view.js';
import { render, remove } from '../framework/render.js';
import { UserAction, UpdateType } from '../const.js';
import { isEscEvent } from '../utils/utils.js';

export default class NewPointPresenter {
  #container = null;
  #destinationsModel = null;
  #offersModel = null;
  #pointsModel = null;
  #handleDataChange = null;
  #handleDestroy = null;

  #pointEditComponent = null;

  constructor({
    container,
    destinationsModel,
    offersModel,
    pointsModel,
    onDataChange,
    onDestroy
  }) {
    this.#container = container;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#pointsModel = pointsModel;
    this.#handleDataChange = onDataChange;
    this.#handleDestroy = onDestroy;

    if (this.#pointsModel) {
      this.#pointsModel.addObserver(this.#handleModelEvent);
    }
  }

  init() {
    if (this.#pointEditComponent) {
      return;
    }

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


  #handleModelEvent = (updateType, payload) => {

    if (updateType === UpdateType.MAJOR || updateType === UpdateType.MINOR) {

      setTimeout(() => {
        if (this.#pointEditComponent) {
          this.destroy();
        }
      }, 500);
    }

    if (updateType === UpdateType.INIT && payload?.error) {
      this.setAborting();
    }
  };

  #createBlankPoint() {
    const destinations = this.#destinationsModel.getDestinations();
    const firstDestination = destinations.length > 0 ? destinations[0].id : null;
    const defaultType = 'flight';
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 7200000); // 2 часа позже

    return {
      id: null,
      basePrice: 100,
      dateFrom: now.toISOString(),
      dateTo: twoHoursLater.toISOString(),
      destination: firstDestination,
      isFavorite: false,
      offers: [],
      type: defaultType,
    };
  }

  #handleFormSubmit = async (point) => {
    if (!this.#validatePoint(point)) {
      this.setAborting();
      return;
    }

    this.setSaving();

    try {
      const pointToSend = {
        basePrice: Number(point.basePrice) || 100,
        dateFrom: point.dateFrom,
        dateTo: point.dateTo,
        destination: point.destination,
        isFavorite: point.isFavorite !== undefined ? point.isFavorite : false,
        offers: point.offers || [],
        type: point.type || 'flight',
      };
      await this.#handleDataChange(UserAction.ADD_POINT, pointToSend);
    } catch (error) {
      this.setAborting();


    }
  };

  destroy() {
    if (this.#pointsModel) {
      this.#pointsModel.removeObserver(this.#handleModelEvent);
    }

    if (!this.#pointEditComponent) {
      return;
    }

    this.resetButtons();

    document.removeEventListener('keydown', this.#escKeyDownHandler);
    remove(this.#pointEditComponent);
    this.#pointEditComponent = null;

    if (this.#handleDestroy) {
      this.#handleDestroy();
    }
  }

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
    if (!point.destination) {
      return false;
    }

    if (!point.type) {
      return false;
    }

    const price = Number(point.basePrice);
    if (isNaN(price) || price <= 0) {
      return false;
    }

    const dateFrom = new Date(point.dateFrom);
    const dateTo = new Date(point.dateTo);
    if (dateTo <= dateFrom) {
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
