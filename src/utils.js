import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
// Эта строка добавляет плагин duration к основной библиотеке dayjs, расширяя её возможности.
dayjs.extend(duration);

const EVENT_DAY_FORMAT = 'MMM D';
const EVENT_DAY_DATATIME_ATTR_FORMAT = 'YYYY-MM-DD';
const EVENT_TIME_FORMAT = 'HH:mm';
const EVENT_TIME_DATATIME_ATTR_FORMAT = 'YYYY-MM-DDTHH:mm';
const EDIT_DATE_TIME_FORMAT = 'DD/MM/YY HH:mm';

function getFormattedEventDay(dueDate) {
  return dueDate ? dayjs(dueDate).format(EVENT_DAY_FORMAT) : '';
}

function getFormattedAttrEventDay(dueDate) {
  return dueDate ? dayjs(dueDate).format(EVENT_DAY_DATATIME_ATTR_FORMAT) : '';
}

function getFormattedTimeEvent(dueDate) {
  return dueDate ? dayjs(dueDate).format(EVENT_TIME_FORMAT) : '';
}

function getFormattedAttrDatatimeEvent(dueDate) {
  return dueDate ? dayjs(dueDate).format(EVENT_TIME_DATATIME_ATTR_FORMAT) : '';
}

function getFormattedEditDateTime(dueDate) {
  return dueDate ? dayjs(dueDate).format(EDIT_DATE_TIME_FORMAT) : '';
}

function getTimeDuration(start, end) {
  const startObj = dayjs(start);
  const endObj = dayjs(end);

  // Вычисляем разницу в миллисекундах
  const diff = endObj.diff(startObj);

  // Преобразуем разницу в объект длительности
  const durationObj = dayjs.duration(diff);

  // Извлекаем значения дней, часов и минут
  const days = durationObj.days();
  const hours = durationObj.hours();
  const minutes = durationObj.minutes();

  // Формируем строку результата
  const formattedDuration = `
    ${days > 0 ? `${days}D ` : ''}
    ${hours > 0 ? `${hours}H ` : ''}
    ${minutes > 0 ? `${minutes}M` : ''}
  `.trim();

  return formattedDuration;
}


export { getFormattedEventDay,
  getFormattedAttrEventDay,
  getFormattedTimeEvent,
  getFormattedAttrDatatimeEvent,
  getTimeDuration,
  getFormattedEditDateTime
};
