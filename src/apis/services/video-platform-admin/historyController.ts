// @ts-ignore
/* eslint-disable */
import { request } from './base';

/** 添加历史记录 POST /his/add */
export async function addHistoryUsingPost(body: API.HistoryDto, options?: { [key: string]: any }) {
  return request<API.CommonResultString_>('/his/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取最近历史记录,用于历史记录列表 GET /his/list */
export async function getRecentHistoryListUsingGet(
    body: API.HisQueryDto,
    options?: { [key: string]: any },
) {
  return request<API.CommonResultListHistoryVo_>('/his/list', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取最从cntStart到cntEnd条历史记录 GET /his/recent */
export async function getRecentHistoryUsingGet(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.getRecentHistoryUsingGETParams,
    body: API.HisQueryDto,
    options?: { [key: string]: any },
) {
  return request<API.CommonResultListHistory_>('/his/recent', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      ...params,
    },
    data: body,
    ...(options || {}),
  });
}

/** updateHistory PUT /his/update */
export async function updateHistoryUsingPut(
    body: API.HistoryDto,
    options?: { [key: string]: any },
) {
  return request<API.CommonResultString_>('/his/update', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
