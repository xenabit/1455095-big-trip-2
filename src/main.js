// /src/main.js

import Presenter from '/src/presenter/presenter.js';
import PointsModel from './model/points-model.js';
import DestinationsModel from './model/destinations-model.js';
import OffersModel from './model/offers-model.js';
import FilterModel from './model/filter-model.js';
import FilterPresenter from './presenter/filter-presenter.js';

import 'flatpickr/dist/flatpickr.min.css';
import 'flatpickr/dist/themes/material_blue.css';

// Инициализируем модели
const pointsModel = new PointsModel();
const destinationsModel = new DestinationsModel();
const offersModel = new OffersModel();
const filterModel = new FilterModel();

// Получаем контейнеры из DOM
const body = document.querySelector('.page-body');
const eventsSection = body.querySelector('.trip-events');
const filterSection = body.querySelector('.trip-controls__filters');

// ВАЖНО: Проверяем, что контейнеры существуют
if (!eventsSection || !filterSection) {
  console.error('Could not find required DOM elements');
}

// Создаём презентер фильтров
const filterPresenter = new FilterPresenter({
  container: filterSection,
  filterModel: filterModel,
  pointsModel: pointsModel
});

// Создаём главный презентер
const presenter = new Presenter({
  pointsModel: pointsModel,
  destinationsModel: destinationsModel,
  offersModel: offersModel,
  filterModel: filterModel
});

// Инициализируем презентеры
filterPresenter.init();
presenter.init();
