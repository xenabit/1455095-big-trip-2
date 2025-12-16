// /src/model/points-model.js

import Observable from '../framework/observable.js';
import PointAdapter from '../adapters/point-adapter.js';
import { UpdateType } from '../const.js';

export default class PointsModel extends Observable {
  #points = [];
  #apiService = null;

  constructor(apiService) {
    super();
    this.#apiService = apiService;
  }

  async init() {
    try {
      console.log('🔄 Начинаю загрузку точек...');
      const points = await this.#apiService.getPoints();
      console.log('📥 Получены точки с сервера:', points);

      this.#points = points.map(PointAdapter.adaptToClient);
      console.log('✅ Адаптированные точки:', this.#points);

      // Проверяем первую точку
      if (this.#points.length > 0) {
        const firstPoint = this.#points[0];
        console.log('🔍 Первая точка после адаптации:', {
          id: firstPoint.id,
          basePrice: firstPoint.basePrice,
          dateFrom: firstPoint.dateFrom,
          dateTo: firstPoint.dateTo,
          isFavorite: firstPoint.isFavorite
        });
      }

      this._notify(UpdateType.INIT, {});
    } catch (err) {
      console.error('❌ Ошибка загрузки точек:', err);
      this.#points = [];
      this._notify(UpdateType.INIT, { error: err });
      throw new Error('Failed to load points');
    }
  }

  getPoints() {
    console.log('📊 Получаю точки из модели:', this.#points.length);
    return this.#points;
  }


  async updatePoint(updateType, updatedPoint) {
    if (!updatedPoint || !updatedPoint.id) {
      throw new Error('Invalid point data: missing id');
    }

    const index = this.#points.findIndex((point) => point.id === updatedPoint.id);

    if (index === -1) {
      throw new Error(`Point with id ${updatedPoint.id} not found`);
    }

    try {
      const serverPoint = PointAdapter.adaptToServer(updatedPoint);
      const response = await this.#apiService.updatePoint(serverPoint);
      const adaptedPoint = PointAdapter.adaptToClient(response);

      this.#points = [
        ...this.#points.slice(0, index),
        adaptedPoint,
        ...this.#points.slice(index + 1)
      ];

      this._notify(updateType, adaptedPoint);
    } catch (err) {
      console.error('Failed to update point:', err);
      throw new Error('Failed to update point');
    }
  }

  async addPoint(updateType, newPoint) {
    try {
      const serverPoint = PointAdapter.adaptToServer({
        ...newPoint,
        id: null // ID будет сгенерирован сервером
      });

      const response = await this.#apiService.addPoint(serverPoint);
      const adaptedPoint = PointAdapter.adaptToClient(response);

      this.#points = [adaptedPoint, ...this.#points];
      this._notify(updateType, adaptedPoint);
    } catch (err) {
      console.error('Failed to add point:', err);
      throw new Error('Failed to add point');
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
      console.error('Failed to delete point:', err);
      throw new Error('Failed to delete point');
    }
  }
}
