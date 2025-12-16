import dayjs from 'dayjs';

const findOfferByType = (offers, offerType) => offers.find((offer) => offer.type === offerType);

const getSelectedOffers = (offerByType, currentOffers) =>
  offerByType.offers.filter((offer) => currentOffers.includes(offer.id));


const sortPointsByDay = (pointA, pointB) => dayjs(pointA.dateFrom).diff(dayjs(pointB.dateFrom));

const sortPointsByTime = (pointA, pointB) =>
  dayjs(pointB.dateTo).diff(dayjs(pointB.dateFrom)) - dayjs(pointA.dateTo).diff(dayjs(pointA.dateFrom));

const sortPointsByPrice = (pointA, pointB) => pointB.basePrice - pointA.basePrice;

export {
  findOfferByType,
  getSelectedOffers,
  sortPointsByPrice,
  sortPointsByDay,
  sortPointsByTime
};
