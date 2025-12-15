import { mockOffers } from '../mock/mock-offers.js';
import Observable from '../framework/observable.js';


export default class OffersModel extends Observable {
  #offers = mockOffers;

  getOffers() {
    return this.#offers;
  }
}
