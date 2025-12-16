import TripInfoView from '../view/trip-info-view.js';
import { render, replace, remove, RenderPosition } from '../framework/render.js';

export default class TripInfoPresenter {
  #infoContainer = null;
  #pointsModel = null;
  #infoComponent = null;

  constructor({infoContainer, pointsModel}) {
    this.#infoContainer = infoContainer;
    this.#pointsModel = pointsModel;
    this.#pointsModel.addObserver(this.#handleModelEvent);
  }

  init() {
    const points = [...this.#pointsModel.points];
    const destinations = this.#pointsModel.destinations;
    const offers = this.#pointsModel.offers;

    const prevInfoComponent = this.#infoComponent;

    this.#infoComponent = new TripInfoView({
      points,
      destinations,
      offers
    });

    if (prevInfoComponent === null) {
      render(this.#infoComponent, this.#infoContainer, RenderPosition.AFTERBEGIN);
      return;
    }

    replace(this.#infoComponent, prevInfoComponent);
    remove(prevInfoComponent);
  }

  #handleModelEvent = () => {
    this.init();
  };
}
