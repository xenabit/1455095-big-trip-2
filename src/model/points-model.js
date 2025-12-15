// /src/model/points-model.js

import { mockPoints } from '../mock/mock-points.js';
import Observable from '../framework/observable.js'; // Наследуемся от Observable

export default class PointsModel extends Observable {
  #points = mockPoints;

  // Метод для получения точек (оставляем без изменений)
  getPoints() {
    return this.#points;
  }

  // Метод для обновления конкретной точки
  updatePoint(updateType, updatedPoint) {
    if (!updatedPoint || !updatedPoint.id) {
      throw new Error('Invalid point data: missing id');
    }

    const index = this.#points.findIndex((point) => point.id === updatedPoint.id);

    if (index === -1) {
      throw new Error(`Point with id ${updatedPoint.id} not found`);
    }

    // Иммутабельное обновление
    this.#points = [
      ...this.#points.slice(0, index),
      updatedPoint,
      ...this.#points.slice(index + 1)
    ];

    // Уведомляем подписчиков об изменении
    this._notify(updateType, updatedPoint);
  }

  // Метод для добавления новой точки
  addPoint(updateType, newPoint) {
    if (!newPoint) {
      throw new Error('Invalid point data');
    }

    // Генерируем уникальный ID (в реальном приложении это делается на бэкенде)
    const pointWithId = {
      ...newPoint,
      id: Date.now() // Временное решение для моковых данных
    };

    this.#points = [pointWithId, ...this.#points];
    this._notify(updateType, pointWithId);
  }

  // Метод для удаления точки
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
