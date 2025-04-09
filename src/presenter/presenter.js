import PointEditView from "/src/view/point-edit-view";
import FilterView from "/src/view/filter-view";
import SortView from "/src/view/sort-view";
import PointsListView from "/src/view/points-list-view";
import PointItemView from "/src/view/point-item-view";
import { render, replace } from "/src/framework/render.js";

const siteBodySection = document.querySelector(".page-body");
const siteFilterSection = siteBodySection.querySelector(
  ".trip-controls__filters"
);
const siteContentSection = siteBodySection.querySelector(".trip-events");

export default class Presenter {
  #pointListComponent = new PointsListView();
  #pointComposition = [];
  #activeEditComponent = null;

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

    for (let i = 0; i < this.points.length; i++) {
      let itemComponent;
      let pointEditView;

      const handlePointClick = () => {
        replace(pointEditView, itemComponent);
        this.#activeEditComponent = { itemComponent, pointEditView };
      };

      const handleFormSubmit = () => {
        replace(itemComponent, pointEditView);
        this.#activeEditComponent = null;
      };

      itemComponent = this.#createComponentItem(
        {
          pointData: this.points[i],
          destinationsData: this.destinations,
          offersData: this.offers,
        },
        handlePointClick
      );

      pointEditView = this.#createComponentEditView(
        {
          pointData: this.points[i],
          destinationsData: this.destinations,
          offersData: this.offers,
        },
        handleFormSubmit
      );

      this.#pointComposition.push({
        itemComponent: itemComponent,
        pointEditView: pointEditView,
      });

      render(itemComponent, this.#pointListComponent.element);
    }

    document.addEventListener("keydown", this.#handleEscKeyDown);
  }

  #handleEscKeyDown = (evt) => {
    if (evt.key === "Escape" || evt.key === "Esc") {
      if (this.#activeEditComponent) {
        const { itemComponent, pointEditView } = this.#activeEditComponent;
        replace(itemComponent, pointEditView);
        this.#activeEditComponent = null; // Сбрасываем после закрытия
      }
    }
  };

  #createComponentEditView(data, handler) {
    return new PointEditView(data, handler);
  }

  #createComponentItem(item, handler) {
    return new PointItemView(item, handler);
  }
}
