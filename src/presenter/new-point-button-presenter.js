import { render } from '../framework/render.js';
import NewPointButtonView from '../view/new-point-button-view.js';

export default class NewPointButtonPresenter {
  #boardPresenter = null;
  #containerElement = null;
  #newEventButtonComponent = null;

  constructor({boardPresenter, containerElement}) {
    this.#boardPresenter = boardPresenter;
    this.#containerElement = containerElement;
  }

  #renderNewButton() {
    this.#newEventButtonComponent = new NewPointButtonView({
      onClick: this.#handleNewPointButtonClick
    });
    render(this.#newEventButtonComponent, this.#containerElement);
  }

  init() {
    this.#renderNewButton();
  }

  #handleNewPointButtonClick = () => {
    this.#boardPresenter.createPoint({
      newEventButtonComponent: this.#newEventButtonComponent.element
    });
    this.#newEventButtonComponent.element.disabled = true;
  };
}
