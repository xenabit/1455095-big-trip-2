import dayjs from 'dayjs';
import { FilterType } from '../const.js';
import { DataAdapter } from './data-adapter.js';

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

export const filterPoints = (points, filterType) => {
  if (!Array.isArray(points)) {
    return [];
  }

  if (points.length === 0) {
    return [];
  }

  const normalizedPoints = normalizePoints(points);
  const now = dayjs();

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
      return normalizedPoints;
  }
};

export const debugFilter = (points, filterType) => {

  const filtered = filterPoints(points, filterType);

  return filtered;
};
