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


  constructor({
    container,
    destinationsModel,
    offersModel,
    point
  }) {
    this.#container = container;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#point = point;
  }

  init(){
    this.#pointComponent = this.#createPointComponent();
    this.#pointEditComponent = this.#createEditComponent();
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
    document.addEventListener('keydown', this.#escKeyDownHandler);
  };

  #handleFormSubmit = () => {
    this.#replacePointToForm();
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  };

  #escKeyDownHandler = (evt) => {
    if (isEscEvent(evt)) {
      evt.preventDefault();
      this.#handleFormSubmit();
    }
  };

  #createPointComponent() {

    return new PointItemView({
      pointData: this.#point,
      destinationsData: this.#destinationsModel.getDestination(),
      offersData: this.#offersModel.getOffers(),
    }, this.#handleRollupClick);
  }

  #createEditComponent() {

    return new PointEditView(
      {
        pointData: this.#point,
        destinationsData: this.#destinationsModel.getDestination(),
        offersData: this.#offersModel.getOffers(),
      }, this.#handleFormSubmit);
  }


  destroy() {
    remove(this.#pointComponent);
    remove(this.#pointEditComponent);
  }
}
