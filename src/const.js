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
  null: 'img/icons/transport.png',
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

export { typeIcons, Mode, SortType, UpdateType };
