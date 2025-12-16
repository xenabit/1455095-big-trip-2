const MAX_SHOW_DESTINATIONS = 3;

const PointPrice = {
  STARTING_POINT_PRICE: 0,
  MIN_POINT_PRICE: 1,
  MAX_POINT_PRICE: 100000,
};

const BLANK_POINT = {
  basePrice: PointPrice.STARTING_POINT_PRICE,
  dateFrom: null,
  dateTo: null,
  destination: '',
  isFavorite: false,
  offers: [],
  type: 'flight',
};

const DateFormat = {
  DATE_ADD_FORMAT: 'DD/MM/YY hh:mm',
  DATE_DAY_FORMAT: 'MMM DD',
  DATE_TRIPS_FORMAT: 'DD MMM',
  DATE_DATA_DAY_FORMAT: 'YYYY-MM-DD',
  DATE_PERIOD_FORMAT: 'HH:mm',
  DATE_DATA_PERIOD_FORMAT: 'YYYY-ММ-DDThh:mm',
  DATE_DURATION_MINUTE_FORMAT: 'mm[M]',
  DATE_DURATION_HOUR_FORMAT: 'HH[H] mm[M]',
  DATE_DURATION_DAY_FORMAT: 'DD[D] HH[H] mm[M]',
};

const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past',
};

const SortType = {
  DAY: 'day',
  TIME: 'time',
  PRICE: 'price',
};

const UserAction = {
  UPDATE_POINT: 'UPDATE_POINT',
  ADD_POINT: 'ADD_POINT',
  DELETE_POINT: 'DELETE_POINT',
};

const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
  INIT: 'INIT',
  ERROR: 'ERROR',
};

const NoPointsText = {
  LOADING: 'Loading...',
  ERROR_TEXT: 'Failed to load latest route information',
};

const NoPointsFiltersText = {
  [FilterType.EVERYTHING]: 'Click New Event to create your first point',
  [FilterType.FUTURE]: 'There are no future events now',
  [FilterType.PRESENT]: 'There are no present events now',
  [FilterType.PAST]: 'There are no past events now',
};

const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

const Url = {
  POINTS: 'points',
  OFFERS: 'offers',
  DESTINATIONS: 'destinations',
};

const ValidateText = {
  PRICE_MAX_FAILED: `стоимость не может превышать ${PointPrice.MAX_POINT_PRICE} €` ,
  PRICE_MIN_FAILED: `стоимость не может быть меньше ${PointPrice.MIN_POINT_PRICE} €`,
  DESTINATIONS_NAME_FAILED: 'Выберете путь из предложенного списка',
};

export {
  MAX_SHOW_DESTINATIONS,
  DateFormat,
  FilterType,
  SortType,
  UserAction,
  UpdateType,
  PointPrice,
  BLANK_POINT,
  NoPointsText,
  NoPointsFiltersText,
  TimeLimit,
  Mode,
  Url,
  ValidateText,
};
