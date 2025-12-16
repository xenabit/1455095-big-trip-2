import BoardPresenter from './presenter/board-presenter.js';
import PointsModel from './model/points-model.js';
import FilterModel from './model/filter-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import TripInfoPresenter from './presenter/trip-info-presenter.js';
import NewPointButtonPresenter from './presenter/new-point-button-presenter.js';
import PointsApiService from './points-api-service.js';

const AUTHORIZATION = 'Basic er989jdzbVv';
const END_POINT = 'https://22.objects.htmlacademy.pro/big-trip';

class App {
  #pointsModel = null;
  #filterModel = null;
  #boardPresenter = null;
  #filterPresenter = null;
  #tripInfoPresenter = null;
  #newEventButtonPresenter = null;
  #pointsApiService = null;

  constructor() {
    this.#pointsApiService = new PointsApiService(END_POINT, AUTHORIZATION);
    this.#pointsModel = new PointsModel({
      pointsApiService: this.#pointsApiService
    });
    this.#filterModel = new FilterModel();
  }

  async init() {
    this.#initComponents();

    try {
      await this.#pointsModel.init();
      this.#newEventButtonPresenter.init();
    } catch (error) {
      document.querySelector('.trip-events__msg').textContent = error.message;
    }
  }

  #initComponents() {
    const siteHeaderElement = document.querySelector('.page-header');
    const tripHeaderElement = siteHeaderElement.querySelector('.trip-main');
    const pageMainElement = document.querySelector('.page-main');
    const mainContainer = pageMainElement.querySelector('.page-body__container');

    this.#tripInfoPresenter = new TripInfoPresenter({
      infoContainer: tripHeaderElement,
      pointsModel: this.#pointsModel,
      filterModel: this.#filterModel,
    });

    this.#filterPresenter = new FilterPresenter({
      filterContainer: tripHeaderElement,
      filterModel: this.#filterModel,
      pointsModel: this.#pointsModel
    });

    this.#boardPresenter = new BoardPresenter({
      boardContainer: mainContainer,
      pointsModel: this.#pointsModel,
      filterModel: this.#filterModel,
    });

    this.#newEventButtonPresenter = new NewPointButtonPresenter({
      boardPresenter: this.#boardPresenter,
      containerElement: tripHeaderElement
    });

    this.#tripInfoPresenter.init();
    this.#filterPresenter.init();
    this.#boardPresenter.init();
  }
}

const app = new App();
app.init();
