export default class PointAdapter {
  static adaptToClient(serverPoint) {
    return {
      id: serverPoint.id,
      basePrice: serverPoint.base_price,
      dateFrom: serverPoint.date_from,
      dateTo: serverPoint.date_to,
      destination: serverPoint.destination,
      isFavorite: serverPoint.is_favorite,
      offers: serverPoint.offers || [],
      type: serverPoint.type,
    };
  }

  static adaptToServer(clientPoint) {

    const serverPoint = {
      id: clientPoint.id,
      base_price: Number(clientPoint.basePrice) || 0, // eslint-disable-line camelcase
      date_from: clientPoint.dateFrom, // eslint-disable-line camelcase
      date_to: clientPoint.dateTo, // eslint-disable-line camelcase
      destination: clientPoint.destination,
      is_favorite: Boolean(clientPoint.isFavorite), // eslint-disable-line camelcase
      offers: clientPoint.offers || [],
      type: clientPoint.type || 'flight',
    };


    return serverPoint;
  }
}
