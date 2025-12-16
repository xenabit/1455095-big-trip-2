// /src/services/api-service.js

import ApiService from '../framework/api-service.js';

const Method = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE',
};

export default class PointsApiService extends ApiService {
  constructor(endPoint, authorization) {
    super(endPoint, authorization);
  }

  // Получение точек
  async getPoints() {
    return await this._load({ url: 'points' })
      .then(ApiService.parseResponse);
  }

  async addPoint(point) {
    console.log('📤 API Service: Sending point to server:', point);
    console.log('🔍 Проверка всех полей для отправки:');
    console.log('- type:', point.type);
    console.log('- base_price:', point.base_price);
    console.log('- destination:', point.destination);
    console.log('- is_favorite:', point.is_favorite);
    console.log('- offers:', point.offers);
    console.log('- date_from:', point.date_from);
    console.log('- date_to:', point.date_to);

    try {
      const response = await this._load({
        url: 'points',
        method: Method.POST,
        body: JSON.stringify(point),
        headers: new Headers({ 'Content-Type': 'application/json' })
      });

      console.log('✅ API Service: Response status:', response.status);
      const result = await ApiService.parseResponse(response);
      console.log('✅ API Service: Response data:', result);
      return result;

    } catch (err) {
      console.error('❌ API Service: Error:', err);
      throw err;
    }
  }

  // УДАЛЕНИЕ: DELETE запрос
  async deletePoint(pointId) {
    return await this._load({
      url: `points/${pointId}`,
      method: Method.DELETE,
    });
  }


  // Обновление точки
  async updatePoint(point) {
    return await this._load({
      url: `points/${point.id}`,
      method: Method.PUT,
      body: JSON.stringify(point),
      headers: new Headers({ 'Content-Type': 'application/json' })
    }).then(ApiService.parseResponse);
  }


  // Получение направлений
  async getDestinations() {
    return await this._load({ url: 'destinations' })
      .then(ApiService.parseResponse);
  }

  // Получение предложений
  async getOffers() {
    return await this._load({ url: 'offers' })
      .then(ApiService.parseResponse);
  }
}
