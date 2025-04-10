import AbstractView from '../framework/view/abstract-view';

function createLayout() {
  return ` <ul class="trip-events__list">
          </ul>`;
}

export default class PointsListView extends AbstractView {
  get template() {
    return createLayout();
  }
}
