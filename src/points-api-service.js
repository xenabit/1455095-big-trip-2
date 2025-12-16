import ApiService from './framework/api-service.js';
import { Url } from './const.js';

const Method = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE',
};

export default class PointsApiService extends ApiService {
  get points() {
    return this._load({url: Url.POINTS})
      .then(ApiService.parseResponse);
  }

  get offers() {
    return this._load({url: Url.OFFERS})
      .then(ApiService.parseResponse);
  }

  get destinations() {
    return this._load({url: Url.DESTINATIONS})
      .then(ApiService.parseResponse);
  }

  async updatePoint(point) {
    const response = await this._load({
      url: `${Url.POINTS}/${point.id}`,
      method: Method.PUT,
      body: JSON.stringify(this.#adaptToServer(point)),
      headers: new Headers({'Content-Type': 'application/json'}),
    });

    return ApiService.parseResponse(response);
  }

  async addPoint(point) {
    const response = await this._load({
      url: Url.POINTS,
      method: Method.POST,
      body: JSON.stringify(this.#adaptToServer(point)),
      headers: new Headers({'Content-Type': 'application/json'}),
    });

    return ApiService.parseResponse(response);
  }

  async deletePoint(point) {
    return this._load({
      url: `${Url.POINTS}/${point.id}`,
      method: Method.DELETE,
    });
  }

  #adaptToServer(point) {
    const adaptedPoint = {...point,
      'id': point.id,
      'base_price': point.basePrice,
      'date_from': point.dateFrom.toISOString(),
      'date_to': point.dateTo.toISOString(),
      'destination': point.destination,
      'is_favorite': point.isFavorite,
      'offers': point.offers,
      'type': point.type
    };

    delete adaptedPoint.basePrice;
    delete adaptedPoint.dateFrom;
    delete adaptedPoint.dateTo;
    delete adaptedPoint.isFavorite;
    return adaptedPoint;
  }
}
