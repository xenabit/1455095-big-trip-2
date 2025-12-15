// /src/utils/filter.js

import dayjs from 'dayjs';
import { FilterType } from '../const.js';

export const filter = {
  [FilterType.EVERYTHING]: (points) => points,

  [FilterType.FUTURE]: (points) => {
    const now = dayjs();
    return points.filter((point) =>
      dayjs(point.date_from).isAfter(now) ||
      dayjs(point.date_from).isSame(now, 'day')
    );
  },

  [FilterType.PRESENT]: (points) => {
    const now = dayjs();
    return points.filter((point) =>
      dayjs(point.date_from).isSame(now, 'day') ||
      (dayjs(point.date_from).isBefore(now) && dayjs(point.date_to).isAfter(now))
    );
  },

  [FilterType.PAST]: (points) => {
    const now = dayjs();
    return points.filter((point) => dayjs(point.date_to).isBefore(now));
  }
};

export const filterPoints = (points, filterType) => {
  const filterFunction = filter[filterType];

  if (!filterFunction) {
    throw new Error(`Filter type "${filterType}" is not supported`);
  }

  return filterFunction(points);
};
