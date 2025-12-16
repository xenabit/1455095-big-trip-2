// /src/adapters/point-adapter.js

export default class PointAdapter {
  /**
   * Адаптирует данные с сервера к формату приложения
   */
  static adaptToClient(point) {
    const adaptedPoint = {
      id: point.id,
      basePrice: point.base_price,
      dateFrom: point.date_from,
      dateTo: point.date_to,
      destination: point.destination,
      isFavorite: point.is_favorite,
      offers: point.offers || [],
      type: point.type,
    };

    return adaptedPoint;
  }

  /**
   * Адаптирует данные приложения к формату сервера
   */
  static adaptToServer(point) {
    if (!point) {
      return null;
    }

    const adaptedPoint = {
      'id': point.id,
      'base_price': Number(point.basePrice) || 0,
      'date_from': point.dateFrom,
      'date_to': point.dateTo,
      'destination': point.destination,
      'is_favorite': Boolean(point.isFavorite),
      'offers': Array.isArray(point.offers) ? point.offers : [],
      'type': point.type || 'flight',
    };

    return adaptedPoint;
  }
}
