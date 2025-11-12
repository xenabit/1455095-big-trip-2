import PointsListView from '/src/view/points-list-view';
import FilterView from '/src/view/filter-view';
import SortView from '/src/view/sort-view';
import PointPresenter from './point-presenter.js';


import { render } from '/src/framework/render.js';

const body = document.querySelector('.page-body');
const eventsSection = body.querySelector('.trip-events');
const filterSection = body.querySelector('.trip-controls__filters');
export default class Presenter {
  #pointsListComponent = new PointsListView();
  #FilterComponent = new FilterView();
  #SortComponent = new SortView();
  #pointPresenters = new Map();
  #pointsModel = null;
  #destinationsModel = null;
  #offersModel = null;

  constructor({
    pointsModel,
    destinationsModel,
    offersModel,
  }) {
    this.#pointsModel = pointsModel;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;

  }

  init() {
    render(this.#FilterComponent, filterSection);
    render(this.#SortComponent, eventsSection);
    render(this.#pointsListComponent, eventsSection);

    this.#renderAllPoints();
  }


  #renderAllPoints(){
    const points = this.#pointsModel.getPoints();

    points.forEach((point) => {
      const pointPresenter = new PointPresenter({
        container: this.#pointsListComponent.element,
        point: point,
        destinationsModel: this.#destinationsModel,
        offersModel: this.#offersModel,
      });

      pointPresenter.init();
      this.#pointPresenters.set(point.id, pointPresenter);
    });


  }
}
