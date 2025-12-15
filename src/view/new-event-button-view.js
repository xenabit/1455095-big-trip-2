// /src/view/new-event-button-view.js
import AbstractView from '../framework/view/abstract-view.js';

function createTemplate() {
  return `
    <button class="trip-main__event-add-btn  btn  btn--big  btn--yellow" type="button">
      New event
    </button>
  `;
}

export default class NewEventButtonView extends AbstractView {
  #handleClick = null;

  constructor({ onClick }) {
    super();
    this.#handleClick = onClick;

    this.element.addEventListener('click', this.#clickHandler);
  }

  get template() {
    return createTemplate();
  }

  #clickHandler = (evt) => {
    evt.preventDefault();
    this.#handleClick();
  };

  disable() {
    this.element.disabled = true;
  }

  enable() {
    this.element.disabled = false;
  }
}
