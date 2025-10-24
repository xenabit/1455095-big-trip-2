import { mockDestinations } from '../mock/mock-destinations.js';

export default class DestinationsModel {
  destinations = mockDestinations;

  getDestination() {
    return this.destinations;
  }
}
