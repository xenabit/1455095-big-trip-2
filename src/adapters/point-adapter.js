export default class PointAdapter {
  static adaptToClient(serverPoint) {
    console.log('🔧 PointAdapter.adaptToClient input:', serverPoint);
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
    console.log('🔧 PointAdapter.adaptToServer input:', clientPoint);

    const serverPoint = {
      id: clientPoint.id,
      base_price: Number(clientPoint.basePrice) || 0,
      date_from: clientPoint.dateFrom,
      date_to: clientPoint.dateTo,
      destination: clientPoint.destination,
      is_favorite: Boolean(clientPoint.isFavorite),
      offers: clientPoint.offers || [],
      type: clientPoint.type || 'flight',
    };

    console.log('🔧 PointAdapter.adaptToServer output:', serverPoint);
    console.log('🔍 Проверка полей PointAdapter:');
    console.log('- type:', serverPoint.type);
    console.log('- is_favorite:', serverPoint.is_favorite);
    console.log('- offers:', serverPoint.offers);
    console.log('- destination:', serverPoint.destination);

    return serverPoint;
  }
}
