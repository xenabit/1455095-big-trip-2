import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const Keys = {
  ESC: 'Esc',
  ESCAPE: 'Escape',
};

const EVENT_DAY_FORMAT = 'MMM D';
const EVENT_DAY_DATATIME_ATTR_FORMAT = 'YYYY-MM-DD';
const EVENT_TIME_FORMAT = 'HH:mm';
const EVENT_TIME_DATATIME_ATTR_FORMAT = 'YYYY-MM-DDTHH:mm';
const EDIT_DATE_TIME_FORMAT = 'DD/MM/YY HH:mm';
const FLATPICKR_DATE_FORMAT = 'd/m/y H:i';

function getFormattedEventDay(date) {
  if (!date) {
    return '';
  }

  try {
    const formatted = dayjs(date).format(EVENT_DAY_FORMAT);
    return formatted;
  } catch (error) {
    return '';
  }
}

function getFormattedAttrEventDay(date) {
  return date ? dayjs(date).format(EVENT_DAY_DATATIME_ATTR_FORMAT) : '';
}

function getFormattedTimeEvent(date) {
  return date ? dayjs(date).format(EVENT_TIME_FORMAT) : '';
}

function getFormattedAttrDatatimeEvent(date) {
  return date ? dayjs(date).format(EVENT_TIME_DATATIME_ATTR_FORMAT) : '';
}

function getFormattedEditDateTime(date) {
  return date ? dayjs(date).format(EDIT_DATE_TIME_FORMAT) : '';
}

function getTimeDuration(startDate, endDate) {
  if (!startDate || !endDate) {
    return '';
  }

  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const diff = end.diff(start);

  if (diff <= 0) {
    return '0M';
  }

  const durationObj = dayjs.duration(diff);
  const days = Math.floor(durationObj.asDays());
  const hours = durationObj.hours();
  const minutes = durationObj.minutes();

  const parts = [];

  if (days > 0) {
    parts.push(`${days}D`);
  }

  if (hours > 0) {
    parts.push(`${hours}H`);
  }

  if (minutes > 0 || (days === 0 && hours === 0)) {
    parts.push(`${minutes}M`);
  }

  return parts.join(' ');
}

function parseFlatpickrDate(flatpickrDate) {
  if (!flatpickrDate) {
    return new Date().toISOString();
  }

  try {
    const parsedDate = dayjs(flatpickrDate, EDIT_DATE_TIME_FORMAT);

    if (parsedDate.isValid()) {
      return parsedDate.toISOString();
    }

    const fallbackDate = new Date(flatpickrDate);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate.toISOString();
    }

    return new Date().toISOString();
  } catch (error) {
    return new Date().toISOString();
  }
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
  parseFlatpickrDate,
  isEscEvent,
  EDIT_DATE_TIME_FORMAT,
  FLATPICKR_DATE_FORMAT
};
