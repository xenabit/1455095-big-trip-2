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

  // Создание новой точки
  async addPoint(point) {
    return await this._load({
      url: 'points',
      method: Method.POST,
      body: JSON.stringify(point),
      headers: new Headers({ 'Content-Type': 'application/json' })
    }).then(ApiService.parseResponse);
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

  // Удаление точки
  async deletePoint(pointId) {
    return await this._load({
      url: `points/${pointId}`,
      method: Method.DELETE,
    });
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
