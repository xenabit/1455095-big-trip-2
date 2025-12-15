// /src/main.js
import PointsModel from './model/points-model.js';
import DestinationsModel from './model/destinations-model.js';
import OffersModel from './model/offers-model.js';
import FilterModel from './model/filter-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import Presenter from './presenter/presenter.js';

// Инициализация моделей
const pointsModel = new PointsModel();
const destinationsModel = new DestinationsModel();
const offersModel = new OffersModel();
const filterModel = new FilterModel();

// Проверяем, что данные загружены
console.log('📍 Destinations:', destinationsModel.getDestinations());
console.log('🎁 Offers:', offersModel.getOffers());
console.log('📌 Points:', pointsModel.getPoints());


// Инициализация презентеров
const filterPresenter = new FilterPresenter({
  container: document.querySelector('.trip-controls__filters'),
  filterModel,
  pointsModel
});

const presenter = new Presenter({
  pointsModel,
  destinationsModel,
  offersModel,
  filterModel
});

// Инициализация
filterPresenter.init();
presenter.init();

// Для отладки
window.presenter = presenter;
window.models = { pointsModel, filterModel };
