import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig, isAxiosError } from 'axios';
import queryString from 'query-string';

// let isRefreshingToken = false;

const apiInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 5 * 60 * 1000, // 5 minutes
  paramsSerializer: {
    serialize: (params) => {
      return queryString.stringify(params);
    },
  },
});

// const waitForTokenRefresh = (retry: number = 10) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       if (isRefreshingToken && retry > 0) {
//         resolve(waitForTokenRefresh(retry - 1));
//       } else {
//         resolve(true);
//       }
//     }, 1000);
//   });
// };

// You should create a new axios instance to request for refreshing token:
// const refreshToken = async (token: string) => {};

const handleRequestFulfilled = async (config: InternalAxiosRequestConfig) => {
  // if (!isRefreshingToken) await waitForTokenRefresh();
  // if (token) {
  //   config.headers.Authorization = token;
  // } else {
  //   delete config.headers.Authorization;
  // }
  return config;
};

const handleResponseFulfilled = (res: AxiosResponse) => res;

const handleResponseRejected = async (error: AxiosError) => {
  const originalConfig = error.config;
  // NOTE: Add condition to check if token is refreshing:

  // Handle error for CRM connection, skip 401 error check here
  if (originalConfig?.url?.includes('/crm')) {
    return Promise.reject(error);
  }

  if (originalConfig && error.response?.status === 401) {
  }
  if (originalConfig && error.response?.status === 403) {
    if (isAxiosError(error) && error.response) {
    }
  }
  return Promise.reject(error);
};

apiInstance.interceptors.request.use(handleRequestFulfilled);
apiInstance.interceptors.response.use(handleResponseFulfilled, handleResponseRejected);

export default apiInstance;
