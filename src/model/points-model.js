// /src/model/points-model.js
import { mockPoints } from '../mock/mock-points.js';
import Observable from '../framework/observable.js';

export default class PointsModel extends Observable {
  #points = mockPoints;

  getPoints() {
    return this.#points;
  }

  updatePoint(updateType, updatedPoint) {
    if (!updatedPoint || !updatedPoint.id) {
      throw new Error('Invalid point data: missing id');
    }

    const index = this.#points.findIndex((point) => point.id === updatedPoint.id);

    if (index === -1) {
      throw new Error(`Point with id ${updatedPoint.id} not found`);
    }

    this.#points = [
      ...this.#points.slice(0, index),
      updatedPoint,
      ...this.#points.slice(index + 1)
    ];

    this._notify(updateType, updatedPoint);
  }

  addPoint(updateType, newPoint) {
    console.log('📥 Model.addPoint called with:', newPoint);

    if (!newPoint) {
      console.error('❌ Invalid point data: null');
      throw new Error('Invalid point data');
    }

    // ВАЖНО: Правильный формат для точки
    const formattedPoint = {
      id: newPoint.id || Date.now(),
      base_price: Number(newPoint.basePrice) || 0,
      date_from: newPoint.dateFrom || new Date().toISOString(),
      date_to: newPoint.dateTo || new Date(Date.now() + 3600000).toISOString(),
      destination: newPoint.destination || null,
      is_favorite: newPoint.isFavorite || false,
      offers: newPoint.offers || [],
      type: newPoint.type || 'flight',
    };

    console.log('✅ Formatted point:', formattedPoint);

    // Добавляем в начало массива для правильной сортировки
    this.#points = [formattedPoint, ...this.#points];

    console.log('📊 Total points after addition:', this.#points.length);

    // Уведомляем с обновленными данными
    this._notify(updateType, formattedPoint);
    console.log('🔔 Notified observers with type:', updateType);
  }

  deletePoint(updateType, pointId) {
    const index = this.#points.findIndex((point) => point.id === pointId);

    if (index === -1) {
      throw new Error(`Point with id ${pointId} not found`);
    }

    this.#points = [
      ...this.#points.slice(0, index),
      ...this.#points.slice(index + 1)
    ];

    this._notify(updateType, pointId);
  }
}
