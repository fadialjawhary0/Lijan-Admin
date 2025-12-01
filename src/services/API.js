import axios from 'axios';
import { IISPATH, HTTP_STATUS } from '../constants';

const API = axios.create({
  // baseURL: 'http://localhost:5000/api',
  // baseURL: 'http://dme-devepm1.emea.devoteam.com:5000/api',
  baseURL: 'https://dme-devepm1.devoteam.com/api',

  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

API.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const isGetAllRequest =
      config.method === 'get' && config.params && !config.url.includes('/create') && !config.url.includes('/update') && !config.url.includes('/delete');

    if (isGetAllRequest && config.params) {
      const dateFilter = JSON.parse(localStorage.getItem('dateFilter') || '{}');
      const { periodType, periodNumber, year, isRecent } = dateFilter;

      if (periodType) config.params.periodType = periodType;
      if (periodNumber) config.params.periodNumber = periodNumber;
      if (year) config.params.year = year;
      if (typeof isRecent === 'boolean') config.params.isRecent = true;
    }

    return config;
  },

  error => Promise.reject(error)
);

API.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case HTTP_STATUS.BAD_REQUEST:
          console.error('Bad request - Invalid input or parameters');
          break;
        case HTTP_STATUS.UNAUTHORIZED:
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userId');
          window.location.href = `${IISPATH}/login`;

          break;
        case HTTP_STATUS.FORBIDDEN:
          console.error('Access forbidden');
          break;
        case HTTP_STATUS.NOT_FOUND:
          console.error('Resource not found');
          break;
        case HTTP_STATUS.METHOD_NOT_ALLOWED:
          console.error('Method not allowed');
          break;
        case HTTP_STATUS.CONFLICT:
          console.error('Conflict - Resource already exists');
          break;
        case HTTP_STATUS.UNPROCESSABLE_ENTITY:
          console.error('Unprocessable entity - Validation failed');
          break;
        case HTTP_STATUS.TOO_MANY_REQUESTS:
          console.error('Too many requests - Rate limit exceeded');
          break;
        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
          console.error('Server error');
          break;
        case HTTP_STATUS.BAD_GATEWAY:
          console.error('Bad gateway - Server received invalid response');
          break;
        case HTTP_STATUS.SERVICE_UNAVAILABLE:
          console.error('Service unavailable - Server temporarily unavailable');
          break;
        case HTTP_STATUS.GATEWAY_TIMEOUT:
          console.error('Gateway timeout - Server did not respond in time');
          break;
        default:
          console.error('An error occurred');
      }

      return Promise.reject(data);
    } else if (error.request) {
      console.error('No response received from server');
      return Promise.reject({ message: 'No response from server' });
    } else {
      console.error('Error setting up request:', error.message);
      return Promise.reject({ message: 'Error setting up request' });
    }
  }
);

export { API };
