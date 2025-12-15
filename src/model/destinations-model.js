// /src/model/destinations-model.js

import { mockDestinations } from '../mock/mock-destinations.js';
import Observable from '../framework/observable.js';

export default class DestinationsModel extends Observable {
  #destinations = mockDestinations;

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
