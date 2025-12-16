// /src/model/destinations-model.js

import Observable from '../framework/observable.js';
import DestinationsAdapter from '../adapters/destinations-adapter.js';

export default class DestinationsModel extends Observable {
  #destinations = [];
  #apiService = null;

  constructor(apiService) {
    super();
    this.#apiService = apiService;
  }

  async init() {
    try {
      const destinations = await this.#apiService.getDestinations();
      this.#destinations = DestinationsAdapter.adaptToClient(destinations);
    } catch (err) {
      this.#destinations = [];
      throw new Error('Failed to load destinations');
    }
  }

  getDestinations() {
    return this.#destinations;
  }

  getDestinationById(id) {
    return this.#destinations.find((destination) => destination.id === id);
  }

  getDestinationByName(name) {
    return this.#destinations.find(
      (destination) => destination.name.toLowerCase() === name.toLowerCase()
    );
  }
}
