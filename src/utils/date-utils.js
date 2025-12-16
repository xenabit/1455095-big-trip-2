import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { DateFormat } from '../const.js';

dayjs.extend(duration);

function humanizeTaskDueDate(dueDate, format) {
  return dueDate ? dayjs(dueDate).format(format) : '';
}

const getDurationTime = (dateFrom, dateTo) => {
  const date1 = dayjs(dateFrom);
  const date2 = dayjs(dateTo);
  const datesDifference = date2.diff(date1);
  const durationTime = dayjs.duration(datesDifference);
  const durationHourTime = durationTime.format(DateFormat.DATE_DURATION_HOUR_FORMAT);

  if (durationTime.asHours() < 1) {
    return durationTime.format(DateFormat.DATE_DURATION_MINUTE_FORMAT);
  }

  if (durationTime.asDays() < 1) {
    return durationHourTime;
  }

  return `${Math.trunc(durationTime.asDays()).toString().padStart(2, '0') }D ${durationHourTime}`;
};

const isPointPast = (dueDate) => dayjs().isAfter(dueDate);

const isPointFuture = (dueDate) => dayjs().isBefore(dueDate);

const isPointPresent = (dateFrom, dateTo) => dayjs()
  .isAfter(dateFrom) && dayjs().isBefore(dateTo);

const isDatesEqual = (dateA, dateB) => (dateA === null && dateB === null) || dayjs(dateA).isSame(dateB, 'D');

export {
  humanizeTaskDueDate,
  getDurationTime,
  isPointPast,
  isPointFuture,
  isPointPresent,
  isDatesEqual,
};
