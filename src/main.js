import Presenter from '/src/presenter/presenter.js';
import PointsModel from './model/points-model.js';
import DestinationsModel from './model/destinations-model.js';
import OffersModel from './model/offers-model.js';

const siteBodySection = document.querySelector('.page-body');
const siteContentSection = siteBodySection.querySelector('.trip-events');

const pointsModel = new PointsModel();
const destinationsModel = new DestinationsModel();
const offersModel = new OffersModel();

const presenter = new Presenter({
  pointsContainer: siteContentSection,
  pointsModel: pointsModel,
  destinationsModel: destinationsModel,
  offersModel: offersModel,
});

presenter.init();
