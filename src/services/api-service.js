
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

  async getPoints() {
    return await this._load({ url: 'points' })
      .then(ApiService.parseResponse);
  }

  async addPoint(point) {
    const response = await this._load({
      url: 'points',
      method: Method.POST,
      body: JSON.stringify(point),
      headers: new Headers({ 'Content-Type': 'application/json' })
    });

    return await ApiService.parseResponse(response);
  }

  async deletePoint(pointId) {
    return await this._load({
      url: `points/${pointId}`,
      method: Method.DELETE,
    });
  }


  async updatePoint(point) {
    return await this._load({
      url: `points/${point.id}`,
      method: Method.PUT,
      body: JSON.stringify(point),
      headers: new Headers({ 'Content-Type': 'application/json' })
    }).then(ApiService.parseResponse);
  }


  async getDestinations() {
    return await this._load({ url: 'destinations' })
      .then(ApiService.parseResponse);
  }

  async getOffers() {
    return await this._load({ url: 'offers' })
      .then(ApiService.parseResponse);
  }
}
