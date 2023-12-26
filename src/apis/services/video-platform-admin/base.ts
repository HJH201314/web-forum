import type { AxiosRequestConfig } from "axios";
import { request as baseRequest } from "@/apis/services/base";
import { ADMIN_SERVICE_PATH } from "@/apis/services/constants";

export const request = <TRes>(path: string, args: AxiosRequestConfig) => {
  return baseRequest<TRes>(`${ADMIN_SERVICE_PATH}${path}`, args);
};