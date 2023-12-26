// @ts-ignore
/* eslint-disable */
import { request } from './base';

/** 根据uid获取用户基础信息 GET /user-info/get-by-uid */
export async function getUserInfoByUidUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserInfoByUidUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.CommonResultUserInfo_>('/user-info/get-by-uid', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** getUidByName GET /user-info/get-uid-by-name */
export async function getUidByNameUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUidByNameUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<number>('/user-info/get-uid-by-name', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 根据uid获取用户的投稿列表，total表示该用户的所有投稿量 GET /user-info/list-video-by-uid */
export async function getUserVideoUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserVideoUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.CommonResultListResultVideoVo_>('/user-info/list-video-by-uid', {
    method: 'GET',
    params: {
      // page has a default value: 1
      page: '1',
      // size has a default value: 10
      size: '10',

      ...params,
    },
    ...(options || {}),
  });
}
