import type { AxiosRequestConfig } from "axios";
import { request as baseRequest } from "@/apis/services/base";
import { COMMENT_SERVICE_PATH } from "@/apis/services/constants";

export const request = <TRes>(path: string, args: AxiosRequestConfig) => {
  return baseRequest<TRes>(`${COMMENT_SERVICE_PATH}${path}`, args);
};