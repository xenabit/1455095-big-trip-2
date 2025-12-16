import PointsModel from './model/points-model.js';
import DestinationsModel from './model/destinations-model.js';
import OffersModel from './model/offers-model.js';
import FilterModel from './model/filter-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import Presenter from './presenter/presenter.js';
import PointsApiService from './services/api-service.js';

const AUTHORIZATION = 'Basic eo0w590ik29889a';
const END_POINT = 'https://22.objects.htmlacademy.pro/big-trip';

const apiService = new PointsApiService(END_POINT, AUTHORIZATION);

const pointsModel = new PointsModel(apiService);
const destinationsModel = new DestinationsModel(apiService);
const offersModel = new OffersModel(apiService);
const filterModel = new FilterModel();


const loadData = async () => {
  const initPresenters = () => {
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

    filterPresenter.init();
    presenter.init();

    window.presenter = presenter;
    window.models = { pointsModel, filterModel };
  };

  try {
    await Promise.all([
      destinationsModel.init(),
      offersModel.init(),
      pointsModel.init()
    ]);

    initPresenters();

  } catch (error) {
    initPresenters();
  }
};


const showLoadingMessage = () => {
  const eventsSection = document.querySelector('.trip-events');
  if (eventsSection) {
    eventsSection.innerHTML = `
      <p class="trip-events__msg">Loading...</p>
    `;
  }
};

const init = async () => {
  showLoadingMessage();
  await loadData();
};

init();
