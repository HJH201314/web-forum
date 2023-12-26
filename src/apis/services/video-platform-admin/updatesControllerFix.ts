/**
 * @desc 修复swagger生成的UpdatesController的bug
 */

import { request } from "@/apis/services/video-platform-admin/base";

/** 发布图文动态 POST /updates/essay */
export async function publishUsingPost(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.publishUsingPOSTParams,
    body: FormData,
    options?: { [key: string]: any },
) {
  return request<API.CommonResultString_>('/updates/essay', {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: {
      ...params,
    },
    data: body,
    ...(options),
  });
}