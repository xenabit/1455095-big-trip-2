// /src/adapters/offers-adapter.js

export default class OffersAdapter {
  static adaptToClient(offers) {
    return offers.map((offerGroup) => ({
      type: offerGroup.type,
      offers: offerGroup.offers.map((offer) => ({
        id: offer.id,
        title: offer.title,
        price: offer.price,
      }))
    }));
  }
}
