import { SortType } from '../const.js';
import dayjs from 'dayjs';

export const sortPoints = (points, sortType = SortType.DAY) => {
  if (!points.length) {
    return points;
  }

  const pointsCopy = [...points];

  const sortByDay = (items) => items.sort((a, b) => {
    const dateA = dayjs(a.date_from);
    const dateB = dayjs(b.date_from);

    if (dateA.isSame(dateB)) {
      return a.id - b.id;
    }

    return dateA.isBefore(dateB) ? -1 : 1;
  });

  const sortByTime = (items) => items.sort((a, b) => {
    const durationA = dayjs(a.date_to).diff(dayjs(a.date_from));
    const durationB = dayjs(b.date_to).diff(dayjs(b.date_from));

    if (durationA === durationB) {
      return dayjs(a.date_from).diff(dayjs(b.date_from));
    }

    return durationB - durationA;
  });

  const sortByPrice = (items) => items.sort((a, b) => {
    if (a.base_price === b.base_price) {
      const nameA = a.destination?.name || '';
      const nameB = b.destination?.name || '';
      return nameA.localeCompare(nameB);
    }

    return b.base_price - a.base_price;
  });

  switch (sortType) {
    case SortType.DAY:
      return sortByDay(pointsCopy);
    case SortType.TIME:
      return sortByTime(pointsCopy);
    case SortType.PRICE:
      return sortByPrice(pointsCopy);
    default:
      return pointsCopy;
  }
};
