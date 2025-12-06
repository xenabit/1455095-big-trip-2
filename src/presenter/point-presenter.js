import PointEditView from '/src/view/point-edit-view';
import PointItemView from '/src/view/point-item-view';

import { render, replace, remove } from '/src/framework/render.js';
import { isEscEvent } from '../utils';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

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

  init(point){
    this.#point = point;

    const prevPointComponent = this.#pointComponent;
    const prevPointEditComponent = this.#pointEditComponent;

    this.#pointComponent = new PointItemView(
      {
        pointData: this.#point,
        destinationsData: this.#destinationsModel.getDestination(),
        offersData: this.#offersModel.getOffers(),
      },
      this.#handleRollupClick,
      this.#handleFavoriteClick
    );

    this.#pointEditComponent = new PointEditView(
      {
        pointData: this.#point,
        destinationsData: this.#destinationsModel.getDestination(),
        offersData: this.#offersModel.getOffers(),
      },
      this.#handleFormSubmit
    );

    if (!prevPointComponent || !prevPointEditComponent) {
      render(this.#pointComponent, this.#container);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#pointComponent, prevPointComponent);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#pointEditComponent, prevPointComponent);
    }

    remove(prevPointComponent);
    remove(prevPointEditComponent);
  }

  resetView = () => {
    if (this.#mode !== Mode.DEFAULT) {
      this.#closeForm ();
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
    this.#openForm();
  };

  #handleFormSubmit = () => {
    this.#closeForm ();
    document.removeEventListener('keydown', this.#handleEscKeyDown);
  };

  #handleFavoriteClick = () => {
    this.#handlePointChange({...this.#point, isFavorite: !this.#point.isFavorite});
  };

  #handleEscKeyDown = (evt) => {
    if (isEscEvent(evt)) {
      evt.preventDefault();
      this.#closeForm ();
    }
  };
}
