import { FilterType } from '../const';
import { isPointPast, isPointFuture, isPointPresent, } from './date-utils.js';

const filter = {
  [FilterType.EVERYTHING]: (points) => points,
  [FilterType.FUTURE]: (points) => points.filter((point) => isPointFuture(point.dateFrom)),
  [FilterType.PRESENT]: (points) => points.filter((point) => isPointPresent(point.dateFrom, point.dateTo)),
  [FilterType.PAST]: (points) => points.filter((point) => isPointPast(point.dateTo)),
};

export {filter};
