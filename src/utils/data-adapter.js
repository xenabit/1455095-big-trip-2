export const DataAdapter = {
  toClient: function(data) {
    if (!data) {
      return null;
    }

    console.log('🔧 DataAdapter.toClient input:', data);

    const result = {
      id: data.id || null,
      basePrice: data.basePrice || data.base_price || 0,
      dateFrom: data.dateFrom || data.date_from || new Date().toISOString(),
      dateTo: data.dateTo || data.date_to || new Date(Date.now() + 3600000).toISOString(),
      destination: data.destination || null,
      isFavorite: data.isFavorite !== undefined ? Boolean(data.isFavorite) :
        data.is_favorite !== undefined ? Boolean(data.is_favorite) : false,
      offers: data.offers || [],
      type: data.type || 'flight',
    };

    console.log('🔧 DataAdapter.toClient output:', result);
    return result;
  },

  toServer: function(data) {
    if (!data) {
      return null;
    }

    console.log('🔧 DataAdapter.toServer input:', data);

    // Сначала нормализуем к клиентскому формату
    const clientData = this.toClient(data);

    console.log('🔧 DataAdapter.toServer after toClient:', clientData);

    // Затем конвертируем в серверный формат
    const result = {
      id: clientData.id,
      base_price: Number(clientData.basePrice) || 0,
      date_from: clientData.dateFrom,
      date_to: clientData.dateTo,
      destination: clientData.destination,
      is_favorite: Boolean(clientData.isFavorite),
      offers: clientData.offers || [],
      type: clientData.type || 'flight',
    };

    console.log('🔧 DataAdapter.toServer output:', result);
    console.log('🔍 Проверка всех полей:');
    console.log('- type exists:', 'type' in result, result.type);
    console.log('- is_favorite exists:', 'is_favorite' in result, result.is_favorite);
    console.log('- offers exists:', 'offers' in result, result.offers);
    console.log('- destination exists:', 'destination' in result, result.destination);

    return result;
  },

  forSorting: function(data) {
    return this.toClient(data);
  }
};
