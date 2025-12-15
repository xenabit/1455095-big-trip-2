const SortType = {
  DAY: 'day',
  TIME: 'time',
  PRICE: 'price',
};


const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past'
};


// /src/const.js
const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
  INIT: 'INIT'
};

const UserAction = {
  UPDATE_POINT: 'UPDATE_POINT',
  ADD_POINT: 'ADD_POINT',
  DELETE_POINT: 'DELETE_POINT'
};

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING'
};

// Иконки для типов точек
const typeIcons = {
  'taxi': 'img/icons/taxi.png',
  'bus': 'img/icons/bus.png',
  'train': 'img/icons/train.png',
  'ship': 'img/icons/ship.png',
  'drive': 'img/icons/drive.png',
  'flight': 'img/icons/flight.png',
  'check-in': 'img/icons/check-in.png',
  'sightseeing': 'img/icons/sightseeing.png',
  'restaurant': 'img/icons/restaurant.png',
  'null': 'img/icons/check-in.png' // Запасная иконка
};

// Экспортируем вместе с остальными константами
export { typeIcons, Mode, SortType, UpdateType, FilterType, UserAction };
