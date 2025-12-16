// /src/utils/utils.js (исправляем parseFlatpickrDate)
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
    console.warn('⚠️ Empty date passed to getFormattedEventDay');
    return '';
  }

  try {
    const formatted = dayjs(date).format(EVENT_DAY_FORMAT);
    console.log('📅 Formatted event day:', date, '->', formatted);
    return formatted;
  } catch (error) {
    console.error('❌ Error formatting event day:', error, 'date:', date);
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

// ИСПРАВЛЕННАЯ ФУНКЦИЯ ПАРСИНГА ДАТЫ
function parseFlatpickrDate(flatpickrDate) {
  if (!flatpickrDate) {
    return new Date().toISOString();
  }

  try {
    // Пытаемся распарсить дату в формате DD/MM/YY HH:mm
    const parsedDate = dayjs(flatpickrDate, EDIT_DATE_TIME_FORMAT);

    if (parsedDate.isValid()) {
      return parsedDate.toISOString();
    }

    // Если не удалось, пробуем стандартный парсинг
    const fallbackDate = new Date(flatpickrDate);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate.toISOString();
    }

    // Если ничего не работает, возвращаем текущую дату
    return new Date().toISOString();
  } catch (error) {
    console.error('Error parsing date:', error, 'Input:', flatpickrDate);
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
