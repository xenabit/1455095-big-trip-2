import PointEditView from '/src/view/point-edit-view';
import PointItemView from '/src/view/point-item-view';

import { render, replace, remove } from '/src/framework/render.js';
import { isEscEvent } from '../utils';


export default class PointPresenter {
  #container = null;
  #destinationsModel = null;
  #offersModel = null;
  #point = null;

  #pointComponent = null;
  #pointEditComponent = null;
  #handleDataChange = null;

  constructor({
    container,
    destinationsModel,
    offersModel, onDataChange
  }) {
    this.#container = container;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#handleDataChange = onDataChange;
  }


  init(point){
    this.#point = point;

    this.#pointComponent = new PointItemView({
      pointData: this.#point,
      destinationsData: this.#destinationsModel.getDestination(),
      offersData: this.#offersModel.getOffers(),
    }, this.#handleRollupClick, this.#handleFavoriteClick);

    this.#pointEditComponent = new PointEditView(
      {
        pointData: this.#point,
        destinationsData: this.#destinationsModel.getDestination(),
        offersData: this.#offersModel.getOffers(),
      }, this.#handleFormSubmit);

    render(this.#pointComponent, this.#container);
  }

  #replacePointToForm = () => {
    replace(this.#pointComponent, this.#pointEditComponent);
  };

  #replaceFormToPoint = () => {
    replace(this.#pointEditComponent, this.#pointComponent);
  };

  #handleRollupClick = () => {
    this.#replaceFormToPoint();
    document.addEventListener('keydown', this.#handleEscKeyDown);
  };

  #handleFormSubmit = () => {
    this.#replacePointToForm();
    document.removeEventListener('keydown', this.#handleEscKeyDown);
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange({...this.#point, isFavorite: !this.#point.isFavorite});
  };

  #handleEscKeyDown = (evt) => {
    if (isEscEvent(evt)) {
      evt.preventDefault();
      this.#handleFormSubmit();
    }
  };


  destroy() {
    remove(this.#pointComponent);
    remove(this.#pointEditComponent);
  }
}
