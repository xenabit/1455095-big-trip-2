// /src/presenter/presenter.js
import PointsListView from '/src/view/points-list-view.js';
import LoadingView from '/src/view/loading-view.js';
import SortView from '/src/view/sort-view.js';
import PointPresenter from './point-presenter.js';
import NewPointPresenter from './new-point-presenter.js';
import { render, remove } from '../framework/render.js';

import { SortType, UpdateType, FilterType, UserAction } from '/src/const.js';
import { filterPoints } from '/src/utils/filter.js';
import NoPointView from '/src/view/no-point-view.js';
import { DataAdapter } from '/src/utils/data-adapter.js';

export default class Presenter {
  #pointsListComponent = new PointsListView();
  #sortComponent = null;
  #newEventButtonComponent = null;

  #pointPresenters = new Map();
  #pointsModel = null;
  #destinationsModel = null;
  #offersModel = null;
  #filterModel = null;

  #currentSortType = SortType.DAY;
  #renderedPoints = [];
  #noPointComponent = null;
  #newPointPresenter = null;
  #newEventButtonElement = null;

  #loadingComponent = null;

  constructor({
    pointsModel,
    destinationsModel,
    offersModel,
    filterModel
  }) {
    this.#pointsModel = pointsModel;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#filterModel = filterModel;

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  async init() {
    console.log('🎬 Presenter init started');
    // Инициализируем кнопку New Event из существующей разметки
    this.#initExistingNewEventButton();
    this.#showLoading();

    // Инициализируем кнопку New Event
    this.#initExistingNewEventButton();

    this.#sortComponent = new SortView({
      onSortTypeChange: this.#handleSortTypeChange
    });
    const eventsSection = document.querySelector('.trip-events');
    if (!eventsSection) {
      console.error('Could not find .trip-events container');
      return;
    }

    // Ждем загрузки данных
    try {
      // В реальном проекте здесь можно добавить Promise.all для ожидания загрузки
      // или использовать события моделей

      // Скрываем заглушку и показываем контент
      this.#hideLoading();
      render(this.#sortComponent, eventsSection);
      render(this.#pointsListComponent, eventsSection);
      this.#renderAllPoints();

    } catch (error) {
      console.error('Failed to load data:', error);
      this.#hideLoading();
      this.#renderNoPoints();
    }
  }


  #showLoading() {
    if (this.#loadingComponent) {
      remove(this.#loadingComponent);
    }

    this.#loadingComponent = new LoadingView();
    const eventsSection = document.querySelector('.trip-events');
    render(this.#loadingComponent, eventsSection);
  }

  // /src/presenter/presenter.js
  // /src/presenter/presenter.js

  #hideLoading() {
    console.log('🔄 Hiding loading...');

    // Просто удаляем элемент из DOM
    const loadingElement = document.querySelector('.trip-events__msg');
    if (loadingElement && loadingElement.textContent === 'Loading...') {
      console.log('✅ Found loading element, removing...');
      loadingElement.remove();
    }

    // И удаляем компонент
    if (this.#loadingComponent) {
      remove(this.#loadingComponent);
      this.#loadingComponent = null;
    }
  }

  #initExistingNewEventButton() {
    // Находим существующую кнопку в DOM
    const newEventButton = document.querySelector('.trip-main__event-add-btn');

    if (!newEventButton) {
      console.error('Could not find .trip-main__event-add-btn in HTML');
      return;
    }

    console.log('✅ Found existing New Event button');

    // Сохраняем ссылку на кнопку
    this.#newEventButtonElement = newEventButton;

    // Добавляем обработчик
    newEventButton.addEventListener('click', this.#handleNewEventButtonClick);
  }

  #handleNewEventButtonClick = () => {
    console.log('🖱️ Existing New Event button clicked');

    // Сбрасываем фильтр на "Everything" при создании новой точки
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);

    // Сбрасываем сортировку на DAY
    this.#currentSortType = SortType.DAY;
    if (this.#sortComponent) {
      this.#sortComponent.setSortType(SortType.DAY);
    }

    // Закрываем все открытые формы редактирования
    this.#handleModeChange();

    // Создаем презентер для новой точки
    this.createPoint();
  };

  createPoint() {
  // Если уже есть активная форма создания - не создаем новую
    if (this.#newPointPresenter) {
      return;
    }

    console.log('🎯 Creating new point presenter...');

    this.#newPointPresenter = new NewPointPresenter({
      container: this.#pointsListComponent.element,
      destinationsModel: this.#destinationsModel,
      offersModel: this.#offersModel,
      pointsModel: this.#pointsModel, // <-- ДОБАВЬТЕ ЭТОТ ПАРАМЕТР!
      onDataChange: this.#handleViewAction,
      onDestroy: this.#handleNewPointDestroy
    });

    this.#newPointPresenter.init();

    // Блокируем кнопку New Event
    this.#disableNewEventButton();
  }

  // /src/presenter/presenter.js
  #handleNewPointDestroy = () => {
  // Очищаем ссылку на презентер
    this.#newPointPresenter = null;

    // Разблокируем кнопку New Event
    this.#enableNewEventButton();

    // ЯВНО ЗАКРЫВАЕМ ФОРМУ принудительно
    if (this.#newPointPresenter) {
      this.#newPointPresenter.destroy();
    }

    console.log('🔓 New Point Presenter destroyed');
  };

  #disableNewEventButton() {
    if (this.#newEventButtonElement) {
      this.#newEventButtonElement.disabled = true;
      console.log('🔒 New Event button disabled');
    }
  }

  #enableNewEventButton() {
    if (this.#newEventButtonElement) {
      this.#newEventButtonElement.disabled = false;
      console.log('🔓 New Event button enabled');
    }
  }

  #handleViewAction = async (actionType, payload) => {
    console.log(`🎯 View action: ${actionType}`, payload);

    switch (actionType) {
      case UserAction.UPDATE_POINT:
        console.log('🔄 Presenter: Updating point...');
        try {
          await this.#pointsModel.updatePoint(UpdateType.MINOR, payload);
          console.log('✅ Presenter: Point updated successfully');
        } catch (error) {
          console.error('❌ Presenter: Update failed:', error);
          // Нужно уведомить PointPresenter об ошибке
          this.#handleUpdateError(payload.id, error);
        }
        break;
      case UserAction.ADD_POINT:
        console.log('➕ Adding point:', payload);
        // Устанавливаем состояние "сохранение" для формы
        if (this.#newPointPresenter) {
          console.log('💾 Setting saving state...');
          this.#newPointPresenter.setSaving();
        }

        console.log('📤 Calling model.addPoint...');
        this.#pointsModel.addPoint(UpdateType.MINOR, payload);
        break;
      case UserAction.DELETE_POINT:
        console.log('🗑️ Deleting point:', payload);
        this.#pointsModel.deletePoint(UpdateType.MINOR, payload.id || payload);
        break;
      default:
        throw new Error(`Unknown action type: ${actionType}`);
    }
  };

  #handleUpdateError = (pointId, error) => {
  // Находим презентер точки и уведомляем об ошибке
    const pointPresenter = this.#pointPresenters.get(pointId);
    if (pointPresenter) {
    // Нужно добавить метод в PointPresenter для обработки ошибок
      pointPresenter.setAborting();
    }
  };

  // /src/presenter/presenter.js (исправляем #handleModelEvent)

  // /src/presenter/presenter.js

  #handleModelEvent = (updateType, payload) => {
    console.log(`🎯 Model event: ${updateType}`, payload);

    switch (updateType) {
      case UpdateType.PATCH:
        this.#updatePoint(payload);
        break;

      case UpdateType.MINOR:
        this.#clearPoints();
        this.#renderAllPoints();
        break;

      case UpdateType.MAJOR:
        this.#currentSortType = SortType.DAY;
        if (this.#sortComponent) {
          this.#sortComponent.setSortType(SortType.DAY);
        }
        this.#clearPoints();
        this.#renderAllPoints();
        break;

      case UpdateType.INIT:
        console.log('🚀 INIT event received!');
        console.log('📊 Points available:', this.#pointsModel.getPoints().length);

        // ВАЖНО: Сначала скрываем loading
        this.#hideLoading();

        // Проверяем, есть ли точки
        if (this.#pointsModel.getPoints().length === 0) {
          console.log('📭 No points, showing empty state');
          this.#renderNoPoints();
        } else {
          console.log('🎨 Rendering all points');
          this.#renderAllPoints();
        }
        break;
    }
  };

  #getFilteredPoints() {
    const points = this.#pointsModel.getPoints();
    const filterType = this.#filterModel.filter;

    return filterPoints(points, filterType);
  }

  // /src/presenter/presenter.js

  #getSortedPoints(sortType = this.#currentSortType) {
    const filteredPoints = this.#getFilteredPoints();

    if (filteredPoints.length === 0) {
      return [];
    }

    // ПРИВОДИМ ВСЕ ТОЧКИ К ЕДИНОМУ ФОРМАТУ
    const normalizedPoints = filteredPoints.map((point) => DataAdapter.forSorting(point));

    switch (sortType) {
      case SortType.DAY:
        return normalizedPoints.sort((a, b) => {
          const dateA = new Date(a.dateFrom);
          const dateB = new Date(b.dateFrom);
          return dateA - dateB;
        });

      case SortType.TIME:
        return normalizedPoints.sort((a, b) => {
          const durationA = new Date(a.dateTo) - new Date(a.dateFrom);
          const durationB = new Date(b.dateTo) - new Date(b.dateFrom);
          return durationB - durationA; // Сначала самые длинные
        });

      case SortType.PRICE:
        return normalizedPoints.sort((a, b) => b.basePrice - a.basePrice);

      default:
        return normalizedPoints;
    }
  }

  // /src/presenter/presenter.js (обновляем #renderNoPoints)

  #renderNoPoints(error = null) {
    const filterType = this.#filterModel.filter;

    let message = '';

    if (error) {
      message = 'Failed to load latest route information';
    } else {
      const messages = {
        [FilterType.EVERYTHING]: 'Click New Event to create your first point',
        [FilterType.FUTURE]: 'There are no future events now',
        [FilterType.PRESENT]: 'There are no present events now',
        [FilterType.PAST]: 'There are no past events now'
      };
      message = messages[filterType] || messages[FilterType.EVERYTHING];
    }

    this.#noPointComponent = new NoPointView({
      message
    });

    const eventsSection = document.querySelector('.trip-events');
    render(this.#noPointComponent, eventsSection);
  }

  #handlePointChange = (actionType, updatedPoint) => {
    this.#handleViewAction(actionType, updatedPoint);
  };

  #updatePoint = (updatedPoint) => {
    const pointPresenter = this.#pointPresenters.get(updatedPoint.id);

    if (pointPresenter) {
      pointPresenter.init(updatedPoint);
    }
  };

  #needToRerender(sortedPoints) {
    if (this.#renderedPoints.length !== sortedPoints.length) {
      return true;
    }

    for (let i = 0; i < sortedPoints.length; i++) {
      if (this.#renderedPoints[i]?.id !== sortedPoints[i]?.id) {
        return true;
      }
    }

    return false;
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    const sortedPoints = this.#getSortedPoints(sortType);

    if (this.#needToRerender(sortedPoints)) {
      this.#currentSortType = sortType;
      this.#clearPoints();
      this.#renderAllPoints();
    } else {
      this.#currentSortType = sortType;
    }
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #renderAllPoints() {
    console.group('🔄 renderAllPoints');

    // Проверяем, какие данные приходят
    const sortedPoints = this.#getSortedPoints();
    console.log('📊 Total points to render:', sortedPoints.length);

    if (sortedPoints.length > 0) {
      console.log('🔍 First point for sorting check:', {
        id: sortedPoints[0].id,
        dateFrom: sortedPoints[0].dateFrom,
        dateTo: sortedPoints[0].dateTo,
        basePrice: sortedPoints[0].basePrice,
        has_date_from: 'date_from' in sortedPoints[0],
        has_dateFrom: 'dateFrom' in sortedPoints[0]
      });
    }

    console.groupEnd();

    if (this.#noPointComponent) {
      remove(this.#noPointComponent);
      this.#noPointComponent = null;
    }


    if (sortedPoints.length === 0) {
      this.#renderNoPoints();
      return;
    }

    this.#renderedPoints = sortedPoints;

    sortedPoints.forEach((point) => {
      const pointPresenter = new PointPresenter({
        container: this.#pointsListComponent.element,
        destinationsModel: this.#destinationsModel,
        offersModel: this.#offersModel,
        handlePointChange: this.#handlePointChange,
        handleModeChange: this.#handleModeChange
      });

      pointPresenter.init(point);
      this.#pointPresenters.set(point.id, pointPresenter);
    });
  }

  #clearPoints() {
    if (this.#noPointComponent) {
      remove(this.#noPointComponent);
      this.#noPointComponent = null;
    }

    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }
}
