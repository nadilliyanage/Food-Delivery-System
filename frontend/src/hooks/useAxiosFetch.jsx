import { useEffect } from "react";
import axios from "axios";

const useAxiosFetch = () => {
  const axiosInstance = axios.create({
    baseURL: "http://localhost:3000/",
  });

  //  intercepters
  useEffect(() => {
    // request Interceptor
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        // Do something before request is sent
        return config;
      },
      function (error) {
        // Do something with request error
        return Promise.reject(error);
      }
    );

    //  response Interceptor
    const responseInterceptor = axios.interceptors.response.use(
      function (response) {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        return response;
      },
      function (error) {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.request.eject(responseInterceptor);
    };
  }, [axiosInstance]);
  
  return axiosInstance;
};

export default useAxiosFetch;
