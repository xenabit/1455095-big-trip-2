import Presenter from '/src/presenter/presenter.js';
import PointsModel from './model/points-model.js';
import DestinationsModel from './model/destinations-model.js';
import OffersModel from './model/offers-model.js';
import 'flatpickr/dist/flatpickr.min.css';
import 'flatpickr/dist/themes/material_blue.css';

const pointsModel = new PointsModel();
const destinationsModel = new DestinationsModel();
const offersModel = new OffersModel();

const presenter = new Presenter({
  pointsModel: pointsModel,
  destinationsModel: destinationsModel,
  offersModel: offersModel,
});

presenter.init();
