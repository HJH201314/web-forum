import type { AxiosRequestConfig } from "axios";
import { request as baseRequest } from "@/apis/services/base";
import { MANAGE_SERVICE_PATH } from "@/apis/services/constants";

export const request = <TRes>(path: string, args: AxiosRequestConfig) => {
  return baseRequest<TRes>(`${MANAGE_SERVICE_PATH}${path}`, args);
};