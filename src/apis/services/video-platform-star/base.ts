import type { AxiosRequestConfig } from "axios";
import { request as baseRequest } from "@/apis/services/base";
import { STAR_SERVICE_PATH } from "@/apis/services/constants";

export const request = <TRes>(path: string, args: AxiosRequestConfig) => {
  return baseRequest<TRes>(`${STAR_SERVICE_PATH}${path}`, args);
};