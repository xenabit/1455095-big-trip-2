import PointEditView from "/src/view/point-edit-view";
import FilterView from "/src/view/filter-view";
import SortView from "/src/view/sort-view";
import PointsListView from "/src/view/points-list-view";
import PointItemView from "/src/view/point-item-view";
import { render } from "/src/framework/render.js";

const siteBodySection = document.querySelector(".page-body");
const siteFilterSection = siteBodySection.querySelector(
  ".trip-controls__filters"
);
const siteContentSection = siteBodySection.querySelector(".trip-events");

export default class Presenter {
  #pointListComponent = new PointsListView();

  constructor({
    pointsContainer,
    pointsModel,
    destinationsModel,
    offersModel,
  }) {
    this.pointsContainer = pointsContainer;
    this.pointsModel = pointsModel;
    this.destinationsModel = destinationsModel;
    this.offersModel = offersModel;
  }

  init() {
    this.points = [...this.pointsModel.getPoints()];
    this.destinations = [...this.destinationsModel.getDestination()];
    this.offers = [...this.offersModel.getOffers()];

    render(new FilterView(), siteFilterSection);
    render(new SortView(), siteContentSection);
    render(this.#pointListComponent, this.pointsContainer);

    render(
      new PointEditView({
        destinationsData: this.destinations,
        offersData: this.offers,
      }),
      this.#pointListComponent.element
    );

    for (let i = 1; i < this.points.length; i++) {
      render(
        new PointItemView({
          pointData: this.points[i],
          destinationsData: this.destinations,
          offersData: this.offers,
        }),
        this.#pointListComponent.element
      );
    }
  }
}
