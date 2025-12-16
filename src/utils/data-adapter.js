export const DataAdapter = {
  toClient: function(data) {
    if (!data) {
      return null;
    }

    // Разворачиваем вложенный тернарный оператор
    let isFavorite = false;
    if (data.isFavorite !== undefined) {
      isFavorite = Boolean(data.isFavorite);
    } else if (data.is_favorite !== undefined) {
      isFavorite = Boolean(data.is_favorite);
    }

    const result = {
      id: data.id || null,
      basePrice: data.basePrice || data.base_price || 0,
      dateFrom: data.dateFrom || data.date_from || new Date().toISOString(),
      dateTo: data.dateTo || data.date_to || new Date(Date.now() + 3600000).toISOString(),
      destination: data.destination || null,
      isFavorite: isFavorite,
      offers: data.offers || [],
      type: data.type || 'flight',
    };

    return result;
  },
  toServer: function(data) {
    if (!data) {
      return null;
    }


    // Сначала нормализуем к клиентскому формату
    const clientData = this.toClient(data);


    // Затем конвертируем в серверный формат
    const result = {
      id: clientData.id,
      base_price: Number(clientData.basePrice) || 0, // eslint-disable-line camelcase
      date_from: clientData.dateFrom, // eslint-disable-line camelcase
      date_to: clientData.dateTo, // eslint-disable-line camelcase
      destination: clientData.destination,
      is_favorite: Boolean(clientData.isFavorite), // eslint-disable-line camelcase
      offers: clientData.offers || [],
      type: clientData.type || 'flight',
    };

    return result;
  },

  forSorting: function(data) {
    return this.toClient(data);
  }
};
