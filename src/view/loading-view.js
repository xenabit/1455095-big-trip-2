// /src/view/loading-view.js

import AbstractView from '../framework/view/abstract-view';

function createTemplate() {
  return `
    <p class="trip-events__msg">Loading...</p>
  `;
}

export default class LoadingView extends AbstractView {
  get template() {
    return createTemplate();
  }
}
