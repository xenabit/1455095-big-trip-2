// /src/utils/filter.js
import dayjs from 'dayjs';
import { FilterType } from '../const.js';
import { DataAdapter } from './data-adapter.js';

// Вспомогательные функции
const normalizePoints = (points) => {
  if (!points) {
    return [];
  }
  return points.map((point) => DataAdapter.forSorting(point));
};

const isFuturePoint = (point, now) => dayjs(point.dateFrom).isAfter(now);

const isPresentPoint = (point, now) => {
  const dateFrom = dayjs(point.dateFrom);
  const dateTo = dayjs(point.dateTo);
  const nowDayjs = dayjs(now);

  return (dateFrom.isSame(nowDayjs, 'day') && dateTo.isSame(nowDayjs, 'day')) ||
    (dateFrom.isBefore(nowDayjs) && dateTo.isAfter(nowDayjs));
};

const isPastPoint = (point, now) => dayjs(point.dateTo).isBefore(now);

// Основная функция фильтрации
export const filterPoints = (points, filterType) => {
  // 1. Проверяем входные данные
  if (!Array.isArray(points)) {
    console.error('filterPoints: points must be an array', points);
    return [];
  }

  if (points.length === 0) {
    return [];
  }

  // 2. Нормализуем точки (приводим к единому формату)
  const normalizedPoints = normalizePoints(points);
  const now = dayjs();

  // 3. Применяем фильтр
  switch (filterType) {
    case FilterType.EVERYTHING:
      return normalizedPoints;

    case FilterType.FUTURE:
      return normalizedPoints.filter((point) => isFuturePoint(point, now));

    case FilterType.PRESENT:
      return normalizedPoints.filter((point) => isPresentPoint(point, now));

    case FilterType.PAST:
      return normalizedPoints.filter((point) => isPastPoint(point, now));

    default:
      console.warn(`Unknown filter type: ${filterType}. Returning all points.`);
      return normalizedPoints;
  }
};

// Для отладки
export const debugFilter = (points, filterType) => {
  console.group('🔍 Filter Debug');
  console.log('Input points:', points);
  console.log('Filter type:', filterType);

  const filtered = filterPoints(points, filterType);
  console.log('Filtered result:', filtered);
  console.log('Filtered count:', filtered.length);

  console.groupEnd();
  return filtered;
};
