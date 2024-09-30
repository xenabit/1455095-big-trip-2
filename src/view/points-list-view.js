import { createElement } from '../render';

function createLayout() {
  return ` <ul class="trip-events__list">
          </ul>`;
}

export default class PointsListView {
  getTemplate() {
    return createLayout();
  }

  getElement() {
    if(!this.element) {
      this.element = createElement(this.getTemplate());
    }

    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}
