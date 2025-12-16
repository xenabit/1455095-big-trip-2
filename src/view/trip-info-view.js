import AbstractView from '../framework/view/abstract-view.js';
import { humanizeTaskDueDate } from '../utils/date-utils.js';
import { findOfferByType, getSelectedOffers, sortPointsByDay } from '../utils/point-utils.js';
import { DateFormat, MAX_SHOW_DESTINATIONS } from '../const.js';

const createTitleTemplate = (points, destinations) => {
  if (points.length === 0) {
    return '';
  }

  const destinationNames = points
    .map((point) => destinations
      .find((element) => element.id === point.destination).name);

  const uniqueDestinationNames = Array.from(new Set(destinationNames));

  return uniqueDestinationNames.length <= MAX_SHOW_DESTINATIONS ?
    uniqueDestinationNames.join(' — ') :
    `${uniqueDestinationNames[0]} — ... — ${uniqueDestinationNames[uniqueDestinationNames.length - 1]}`;
};

const createDurationTemplate = (points) => {
  if (points.length === 0) {
    return '';
  }

  const sortedByTimePoints = points.sort(sortPointsByDay);
  const startDate = humanizeTaskDueDate(sortedByTimePoints[0].dateFrom, DateFormat.DATE_TRIPS_FORMAT);
  const endDate = humanizeTaskDueDate(sortedByTimePoints[sortedByTimePoints.length - 1].dateTo, DateFormat.DATE_TRIPS_FORMAT);

  return `${startDate} - ${endDate}`;
};

const createCostTemplate = (points, offers) => points.reduce((totalSum, point) => {
  const offerByType = findOfferByType(offers, point.type);
  const selectedOffers = getSelectedOffers(offerByType, point.offers);
  const offersCost = selectedOffers.reduce((sum, offer) => sum + offer.price, 0);

  return totalSum + point.basePrice + offersCost;
}, 0);

function createTripInfoTemplate(points, destinations, offers) {
  const titleTemplate = createTitleTemplate(points, destinations);
  const durationTemplate = createDurationTemplate(points);
  const costTemplate = createCostTemplate(points, offers);

  return (
    `<section class="trip-main__trip-info  trip-info">
      <div class="trip-info__main">
        <h1 class="trip-info__title">
          ${titleTemplate}
        </h1>
        <p class="trip-info__dates">${durationTemplate}</p>
      </div>
      <p class="trip-info__cost">
        ${points.length !== 0 ? `Total: &euro;&nbsp;<span class="trip-info__cost-value">${costTemplate}</span>` : ''}
      </p>
    </section>`
  );
}

export default class TripInfoView extends AbstractView {
  #points = null;
  #destinations = null;
  #offers = null;

  constructor({points, destinations, offers}) {
    super();
    this.#points = points;
    this.#destinations = destinations;
    this.#offers = offers;
  }

  get template() {
    return createTripInfoTemplate(this.#points, this.#destinations, this.#offers);
  }
}
