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
      console.log('🔄 Начинаю загрузку точек...');
      const serverPoints = await this.#apiService.getPoints();
      console.log('📥 Получены точки с сервера:', serverPoints);

      // Используем PointAdapter вместо DataAdapter
      this.#points = serverPoints.map((serverPoint) =>
        PointAdapter.adaptToClient(serverPoint)
      );

      console.log('✅ Адаптированные точки:', this.#points);
      this._notify(UpdateType.INIT, {});

    } catch (err) {
      console.error('❌ Ошибка загрузки точек:', err);
      this.#points = [];
      this._notify(UpdateType.INIT, { error: err });
      throw new Error('Failed to load points');
    }
  }

  getPoints() {
  // ВОЗВРАЩАЕМ УЖЕ АДАПТИРОВАННЫЕ ДАННЫЕ
    return this.#points.map((point) => DataAdapter.toClient(point));
  }

  // Аналогично в updatePoint() используйте PointAdapter
  async updatePoint(updateType, updatedPoint) {
    console.log('🔄 Model: Updating point:', updatedPoint);

    // АДАПТИРУЕМ ДЛЯ СЕРВЕРА
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
      console.error('❌ Model: Failed to update point:', err);
      throw new Error('Failed to update point on server');
    }
  }


  #validatePointData(point) {
    if (!point || typeof point !== 'object') {
      console.error('Point is not an object');
      return false;
    }

    if (!point.id) {
      console.error('Point missing id');
      return false;
    }

    if (typeof point.basePrice !== 'number' || point.basePrice < 0) {
      console.error('Invalid basePrice:', point.basePrice);
      return false;
    }

    if (!point.dateFrom || !point.dateTo) {
      console.error('Missing dates');
      return false;
    }

    if (!point.destination) {
      console.error('Missing destination');
      return false;
    }

    if (!point.type) {
      console.error('Missing type');
      return false;
    }

    return true;
  }

  // В методе addPoint():
  async addPoint(updateType, newPoint) {
    console.log('📥 Model: Adding new point:', newPoint);

    try {
    // 1. АДАПТИРУЕМ ДЛЯ СЕРВЕРА
      const serverPoint = PointAdapter.adaptToServer(newPoint);
      console.log('📤 Model: Adapted to server format:', serverPoint);

      // 2. Отправляем на сервер
      const response = await this.#apiService.addPoint(serverPoint);
      console.log('✅ Model: Server response:', response);

      // 3. АДАПТИРУЕМ ОТВЕТ ОБРАТНО
      const adaptedPoint = PointAdapter.adaptToClient(response);

      // 4. Добавляем в локальный массив
      this.#points = [...this.#points, adaptedPoint];
      console.log('➕ Model: Point added locally, total:', this.#points.length);

      // 5. Уведомляем подписчиков
      this._notify(updateType, adaptedPoint);

      return adaptedPoint;

    } catch (err) {
      console.error('❌ Model: Failed to add point:', err);
      throw new Error(`Failed to add point: ${err.message}`);
    }
  }

  async deletePoint(updateType, pointId) {
    console.log('🗑️ Model: Starting to delete point:', pointId);

    const index = this.#points.findIndex((point) => point.id === pointId);

    if (index === -1) {
      throw new Error(`Point with id ${pointId} not found`);
    }

    try {
      // 1. Отправляем DELETE запрос на сервер
      await this.#apiService.deletePoint(pointId);
      console.log('✅ Model: Server confirmed deletion');

      // 2. Удаляем точку из локального массива
      this.#points = [
        ...this.#points.slice(0, index),
        ...this.#points.slice(index + 1)
      ];

      console.log('✅ Model: Point deleted locally, total:', this.#points.length);

      // 3. Уведомляем подписчиков
      this._notify(updateType, pointId);

    } catch (err) {
      console.error('❌ Model: Failed to delete point:', err);
      throw new Error('Failed to delete point on server');
    }
  }
}
