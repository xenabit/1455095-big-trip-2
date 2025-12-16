import PointEditView from '../view/point-edit-view.js';
import PointItemView from '../view/point-item-view.js';
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

    this.#point = point;

    const prevPointComponent = this.#pointComponent;
    const prevPointEditComponent = this.#pointEditComponent;

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


  #handleFormSubmit = async (updatedPoint) => {
    this.#pointEditComponent?.setSaving();

    try {
      await this.#handlePointChange(UserAction.UPDATE_POINT, updatedPoint);

    } catch (error) {
      this.#pointEditComponent?.setAborting();
    }
  };


  #handleDeleteClick = async (point) => {
    this.#pointEditComponent?.setDeleting();

    try {
      await this.#handlePointChange(UserAction.DELETE_POINT, point || this.#point);
    } catch (error) {
      this.#pointEditComponent?.setAborting();
    }
  };

  setAborting() {
    if (this.#pointEditComponent) {
      this.#pointEditComponent.setAborting();
    }
  }

  #handleFavoriteClick = () => {
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

  updatePoint(updatedPoint) {
    if (this.#point.id !== updatedPoint.id) {
      return;
    }

    this.#point = updatedPoint;
    this.init(updatedPoint);
  }
}
