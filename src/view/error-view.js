import AbstractView from '../framework/view/abstract-view.js';

export default class ErrorView extends AbstractView {
  constructor({ message }) {
    super();
    this._message = message;
  }

  get template() {
    return `
      <section class="trip-events">
        <h2 class="visually-hidden">Trip events</h2>
        <p class="trip-events__msg">${this._message}</p>
      </section>
    `;
  }
}
