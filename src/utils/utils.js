import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

const EVENT_DAY_FORMAT = 'MMM D';
const EVENT_DAY_DATATIME_ATTR_FORMAT = 'YYYY-MM-DD';
const EVENT_TIME_FORMAT = 'HH:mm';
const EVENT_TIME_DATATIME_ATTR_FORMAT = 'YYYY-MM-DDTHH:mm';
const EDIT_DATE_TIME_FORMAT = 'DD/MM/YY HH:mm';

const Keys = {
  ESC: 'Esc',
  ESCAPE: 'Escape',
};

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

  const diff = endObj.diff(startObj);

  const durationObj = dayjs.duration(diff);

  const days = durationObj.days();
  const hours = durationObj.hours();
  const minutes = durationObj.minutes();

  const formattedDuration = `
    ${days > 0 ? `${days}D ` : ''}
    ${hours > 0 ? `${hours}H ` : ''}
    ${minutes > 0 ? `${minutes}M` : ''}
  `.trim();

  return formattedDuration;
}

const isEscEvent = (evt) =>
  evt.key === Keys.ESC || evt.key === Keys.ESCAPE;

export {
  getFormattedEventDay,
  getFormattedAttrEventDay,
  getFormattedTimeEvent,
  getFormattedAttrDatatimeEvent,
  getTimeDuration,
  getFormattedEditDateTime,
  isEscEvent
};
