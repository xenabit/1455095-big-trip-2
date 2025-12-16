import { remove, render, RenderPosition } from '../framework/render.js';
import AddPointView from '../view/add-point-view';
import { UserAction, UpdateType } from '../const.js';

export default class NewPointPresenter {
  #pointEditComponent = null;
  #tripListContainer = null;
  #handleDataChange = null;
  #handleDestroy = null;
  #destinations = null;
  #offers = null;

  constructor({tripListContainer, onDataChange, handleDestroy, destinations, offers}) {
    this.#tripListContainer = tripListContainer;
    this.#handleDataChange = onDataChange;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#handleDestroy = handleDestroy;
  }

  init() {
    if (this.#pointEditComponent !== null) {
      return;
    }

    this.#pointEditComponent = new AddPointView({
      destinations: this.#destinations,
      offers: this.#offers,
      onFormSubmit: this.#handleFormSubmit,
      onDeleteClick: this.#handleDeleteClick,
      isNewPoint: true,
    });

    render(this.#pointEditComponent, this.#tripListContainer, RenderPosition.AFTERBEGIN);
    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  destroy() {
    if (this.#pointEditComponent === null) {
      return;
    }

    this.#handleDestroy();
    remove(this.#pointEditComponent);
    this.#pointEditComponent = null;
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  setSaving() {
    this.#pointEditComponent.updateElement({
      isDisabled: true,
      isSaving: true,
    });
  }

  setAborting() {
    const resetFormState = () => {
      this.#pointEditComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };
    this.#pointEditComponent.shake(resetFormState);
  }

  #handleFormSubmit = (point) => {
    this.#handleDataChange(
      UserAction.ADD_POINT,
      UpdateType.MINOR,
      point,
    );
  };

  #handleDeleteClick = () => {
    this.destroy();
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.destroy();
    }
  };
}
