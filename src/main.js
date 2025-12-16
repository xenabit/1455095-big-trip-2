// /src/main.js

import PointsModel from './model/points-model.js';
import DestinationsModel from './model/destinations-model.js';
import OffersModel from './model/offers-model.js';
import FilterModel from './model/filter-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import Presenter from './presenter/presenter.js';
import PointsApiService from './services/api-service.js';

// Константы для API
const AUTHORIZATION = 'Basic eo0w590ik29889a'; // Замените на ваш реальный ключ
const END_POINT = 'https://22.objects.htmlacademy.pro/big-trip';

// Инициализация API сервиса
const apiService = new PointsApiService(END_POINT, AUTHORIZATION);

// Инициализация моделей с API
const pointsModel = new PointsModel(apiService);
const destinationsModel = new DestinationsModel(apiService);
const offersModel = new OffersModel(apiService);
const filterModel = new FilterModel();

// Загрузка данных
const loadData = async () => {
  try {
    await Promise.all([
      destinationsModel.init(),
      offersModel.init(),
      pointsModel.init()
    ]);

    console.log('✅ Данные успешно загружены');
    console.log('📍 Destinations:', destinationsModel.getDestinations().length);
    console.log('🎁 Offers:', offersModel.getOffers().length);
    console.log('📌 Points:', pointsModel.getPoints().length);

    // Инициализация презентеров после загрузки данных
    initPresenters();

  } catch (error) {
    console.error('❌ Ошибка загрузки данных:', error);
    // Все равно инициализируем приложение
    initPresenters();
  }
};

const initPresenters = () => {
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
};

// Показываем заглушку загрузки
const showLoadingMessage = () => {
  const eventsSection = document.querySelector('.trip-events');
  if (eventsSection) {
    eventsSection.innerHTML = `
      <p class="trip-events__msg">Loading...</p>
    `;
  }
};

// Запуск приложения
const init = async () => {
  showLoadingMessage();
  await loadData();
};

init();
