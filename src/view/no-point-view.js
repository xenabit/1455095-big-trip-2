import AbstractView from '../framework/view/abstract-view.js';

function createNoPointTemplate(noPointsText) {
  return (
    `<p class="trip-events__msg">
      ${noPointsText}
    </p>`
  );
}

export default class NoPointView extends AbstractView {
  #noPointsText = '';

  constructor(noPointsText) {
    super();

    this.#noPointsText = noPointsText;
  }

  get template() {
    return createNoPointTemplate(this.#noPointsText);
  }
}
