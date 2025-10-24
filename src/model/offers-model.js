import { mockOffers } from '../mock/mock-offers.js';

export default class OffersModel {
  offers = mockOffers;

  getOffers() {
    return this.offers;
  }
}
