// /src/const.js (проверяем, что есть иконка для null)
const typeIcons = {
  taxi: 'img/icons/taxi.png',
  bus: 'img/icons/bus.png',
  train: 'img/icons/train.png',
  ship: 'img/icons/ship.png',
  drive: 'img/icons/drive.png',
  flight: 'img/icons/flight.png',
  'check-in': 'img/icons/check-in.png',
  sightseeing: 'img/icons/sightseeing.png',
  restaurant: 'img/icons/restaurant.png',
  null: 'img/icons/transport.png', // Убедитесь, что этот путь существует
};


const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

const SortType = {
  DAY: 'day',
  TIME: 'time',
  PRICE: 'price',
};

const UpdateType = {
  PATCH: 'PATCH', // Изменение части объекта (например, isFavorite)
  MINOR: 'MINOR', // Изменение одной точки (редактирование)
  MAJOR: 'MAJOR', // Изменения, требующие перерисовки списка (сортировка, фильтрация)
  INIT: 'INIT' // Инициализация приложения
};


const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past'
};

// /src/const.js (дополняем существующий файл)

const UserAction = {
  UPDATE_POINT: 'UPDATE_POINT',
  ADD_POINT: 'ADD_POINT',
  DELETE_POINT: 'DELETE_POINT',
};

// Экспортируем вместе с остальными константами
export { typeIcons, Mode, SortType, UpdateType, FilterType, UserAction };
