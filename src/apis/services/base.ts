/**
 * 本文件为axios的浅层封装
 * 关于接口调用：
 * 1. 为解决不同模块的接口调用问题，由各模块的base中的request再做一层处理，并调用此处的request
 * 2. 接口控制代码（如LoginController）在dili-manage中使用@umijs/max的openAPI插件生成标准格式的代码，并分模块复制到此项目
 * 3. 每个模块的base.ts需手写，指定正确的SERVICE_PATH；其余文件保持生成的默认值即可
 *
 * @author HJH201314
 * */

import axios from "axios";
import type { AxiosResponse, AxiosRequestConfig } from "axios";
import { SERVER_API_URL } from "@/apis/services/constants";

const defaultConfig: AxiosRequestConfig = {
  timeout: 10000,
  baseURL: SERVER_API_URL,
};

const axiosInstance = axios.create(defaultConfig);


axiosInstance.interceptors.request.use(
(config) => {
  // console.log(config);
  if (config.params) {
    Object.keys(config.params).forEach(key => {
      config.params[key] = encodeURIComponent(config.params[key]);
    });
  }
  // config.url = config.url?.split('?')[0] + '?' + Object.keys(config.params).map(key => `${key}=${encodeURIComponent(config.params[key])}`).join('&');
  return config;
},
(error) => {
  console.log(error);
  return Promise.reject(error);
},
);

axiosInstance.interceptors.response.use(
(response) => {
  // 处理登录失效
  if (response.data.code === 500 && response.data.message === "user not login") {
    localStorage.removeItem("token");
    return response;
  }
  // 对结果url解码
  if (response.data.data && typeof response.data.data === "object") {
    // console.log(response.data.data)
    // Object.keys(response.data.data).forEach(key => {
    //   response.data.data[key] = decodeURIComponent(response.data.data[key]);
    // });
  }
  return response;
},
(error) => {
  console.log(error);
  return Promise.reject(error);
});

export const request = <TRes>(path: string, args: AxiosRequestConfig) => {
  console.log(localStorage.getItem("token") ?? "");
  const config: AxiosRequestConfig<any> = {
    url: path,
    ...args,
  };
  if (!config.headers) config.headers = {};
  config.headers['token'] = localStorage.getItem("token") ?? '';
  config.headers['Authorization'] = localStorage.getItem("token") ?? '';
  return axiosInstance.request<any, AxiosResponse<TRes>>(config);
};
