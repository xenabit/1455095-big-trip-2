import Observable from '../framework/observable.js';
import PointAdapter from '../adapters/point-adapter.js';
import { UpdateType } from '../const.js';

import { DataAdapter } from '../utils/data-adapter.js';
export default class PointsModel extends Observable {
  #points = [];
  #apiService = null;

  constructor(apiService) {
    super();
    this.#apiService = apiService;
  }

  // В методе init():
  async init() {
    try {
      const serverPoints = await this.#apiService.getPoints();

      this.#points = serverPoints.map((serverPoint) =>
        PointAdapter.adaptToClient(serverPoint)
      );

      this._notify(UpdateType.INIT, {});

    } catch (err) {
      this.#points = [];
      this._notify(UpdateType.INIT, { error: err });
      throw new Error('Failed to load points');
    }
  }

  getPoints() {
    return this.#points.map((point) => DataAdapter.toClient(point));
  }

  async updatePoint(updateType, updatedPoint) {

    const serverPoint = PointAdapter.adaptToServer(updatedPoint);

    const index = this.#points.findIndex((point) => point.id === serverPoint.id);

    if (index === -1) {
      throw new Error(`Point with id ${serverPoint.id} not found`);
    }

    try {
      const response = await this.#apiService.updatePoint(serverPoint);
      const adaptedPoint = PointAdapter.adaptToClient(response);

      this.#points = [
        ...this.#points.slice(0, index),
        adaptedPoint,
        ...this.#points.slice(index + 1)
      ];

      this._notify(updateType, adaptedPoint);

    } catch (err) {
      throw new Error('Failed to update point on server');
    }
  }


  #validatePointData(point) {
    if (!point || typeof point !== 'object') {
      return false;
    }

    if (!point.id) {
      return false;
    }

    if (typeof point.basePrice !== 'number' || point.basePrice < 0) {
      return false;
    }

    if (!point.dateFrom || !point.dateTo) {
      return false;
    }

    if (!point.destination) {
      return false;
    }

    if (!point.type) {
      return false;
    }

    return true;
  }

  async addPoint(updateType, newPoint) {

    try {
      const serverPoint = PointAdapter.adaptToServer(newPoint);

      const response = await this.#apiService.addPoint(serverPoint);

      const adaptedPoint = PointAdapter.adaptToClient(response);

      this.#points = [...this.#points, adaptedPoint];

      this._notify(updateType, adaptedPoint);

      return adaptedPoint;

    } catch (err) {
      throw new Error(`Failed to add point: ${err.message}`);
    }
  }

  async deletePoint(updateType, pointId) {

    const index = this.#points.findIndex((point) => point.id === pointId);

    if (index === -1) {
      throw new Error(`Point with id ${pointId} not found`);
    }

    try {
      await this.#apiService.deletePoint(pointId);

      this.#points = [
        ...this.#points.slice(0, index),
        ...this.#points.slice(index + 1)
      ];


      this._notify(updateType, pointId);

    } catch (err) {
      throw new Error('Failed to delete point on server');
    }
  }
}
