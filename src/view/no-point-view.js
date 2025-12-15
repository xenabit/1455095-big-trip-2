// /src/view/no-point-view.js

import AbstractView from '../framework/view/abstract-view';

function createTemplate(message) {
  return `
    <section class="trip-events">
      <h2 class="visually-hidden">Trip events</h2>
      <p class="trip-events__msg">${message}</p>
    </section>
  `;
}

export default class NoPointView extends AbstractView {
  #message = null;

  constructor({ message }) {
    super();
    this.#message = message;
  }

  get template() {
    return createTemplate(this.#message);
  }
}
