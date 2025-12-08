import { SortType } from '../const.js';

export const sortPoints = (points, sortType = SortType.DAY) => {
  if (!points.length) {
    return points;
  }

  const pointsCopy = [...points];

  const sortByDay = (items) => items.sort((a, b) => {
    const dateA = new Date(a.date_from);
    const dateB = new Date(b.date_from);

    if (dateA.getTime() === dateB.getTime()) {
      return a.id - b.id;
    }

    return dateA - dateB;
  });

  const sortByTime = (items) => items.sort((a, b) => {
    const durationA = new Date(a.date_to) - new Date(a.date_from);
    const durationB = new Date(b.date_to) - new Date(b.date_from);

    if (durationA === durationB) {
      return new Date(a.date_from) - new Date(b.date_from);
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


