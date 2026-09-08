import moment from 'moment';

export const handlebarsHelpers = {
  formatDate: (date, formatStr) => moment(date).format(
    formatStr && typeof formatStr === 'string' ? formatStr : 'DD/MM/YYYY HH:mm'
  ),
  eq: (a, b) => a === b,
  gt: (a, b) => Number(a) > Number(b),
  sum: (a, b) => Number(a) + Number(b),
  json: (obj) => JSON.stringify(obj),
  includes: (arr, val) => Array.isArray(arr) && arr.includes(val),
  slice: (str, start, end) => (typeof str === 'string' ? str.slice(start, end) : '')
};
