import type { AxiosRequestConfig } from "axios";
import { request as baseRequest } from "@/apis/services/base";
import { RECOMMEND_SERVICE_PATH } from "@/apis/services/constants";

export const request = <TRes>(path: string, args: AxiosRequestConfig) => {
  return baseRequest<TRes>(`${RECOMMEND_SERVICE_PATH}${path}`, args);
};