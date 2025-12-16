// /src/model/offers-model.js

import Observable from '../framework/observable.js';
import OffersAdapter from '../adapters/offers-adapter.js';

export default class OffersModel extends Observable {
  #offers = [];
  #apiService = null;

  constructor(apiService) {
    super();
    this.#apiService = apiService;
  }

  async init() {
    try {
      const offers = await this.#apiService.getOffers();
      this.#offers = OffersAdapter.adaptToClient(offers);
    } catch (err) {
      this.#offers = [];
      throw new Error('Failed to load offers');
    }
  }

  getOffers() {
    return this.#offers;
  }

  getOffersByType(type) {
    return this.#offers.find((offer) => offer.type === type);
  }
}
