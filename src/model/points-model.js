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
    console.log('🔄 Model: Starting point update for:', updatedPoint.id);

    if (!updatedPoint || !updatedPoint.id) {
      throw new Error('Invalid point data: missing id');
    }

    const index = this.#points.findIndex((point) => point.id === updatedPoint.id);

    if (index === -1) {
      throw new Error(`Point with id ${updatedPoint.id} not found`);
    }

    try {
      // 1. Преобразуем данные в формат сервера
      const serverPoint = PointAdapter.adaptToServer(updatedPoint);
      console.log('📤 Model: Sending to server:', serverPoint);

      // 2. Отправляем запрос на сервер
      const response = await this.#apiService.updatePoint(serverPoint);
      console.log('✅ Model: Server response:', response);

      // 3. Преобразуем ответ сервера обратно в формат приложения
      const adaptedPoint = PointAdapter.adaptToClient(response);
      console.log('🔄 Model: Adapted from server:', adaptedPoint);

      console.log('🔄 Model: Starting point update for:', updatedPoint.id);

      // Валидация данных
      if (!this.#validatePointData(updatedPoint)) {
        throw new Error('Invalid point data');
      }


      // 4. Обновляем данные в модели
      this.#points = [
        ...this.#points.slice(0, index),
        adaptedPoint,
        ...this.#points.slice(index + 1)
      ];

      console.log('✅ Model: Points updated locally');

      // 5. Уведомляем подписчиков об успешном обновлении
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
