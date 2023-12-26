// @ts-ignore
/* eslint-disable */
import { request } from './base';

/** 添加收藏夹 POST /star/addStar/${param1}/${param0} */
export async function addStarUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.addStarUsingPOSTParams,
  options?: { [key: string]: any },
) {
  const { starName: param0, uid: param1, ...queryParams } = params;
  return request<API.CommonResultString_>(`/star/addStar/${param1}/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 根据用户uid获取收藏夹列表 GET /star/listStar/${param0} */
export async function listStarByUidUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listStarByUidUsingGETParams,
  options?: { [key: string]: any },
) {
  const { uid: param0, ...queryParams } = params;
  return request<API.CommonResultListResultStar_>(`/star/listStar/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 根据收藏夹id分页获取收藏夹内容 GET /star/listStarContent/${param1}/${param0}/${param2} */
export async function listStarContentBySidByPageUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listStarContentBySidByPageUsingGETParams,
  options?: { [key: string]: any },
) {
  const { page: param0, sid: param1, size: param2, ...queryParams } = params;
  return request<API.CommonResultListResultStarVo_>(
    `/star/listStarContent/${param1}/${param0}/${param2}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** 获取当前观看的视频被当前用户收藏在哪个收藏夹下 GET /star/listStared/${param0}/${param1} */
export async function listStaredUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listStaredUsingGETParams,
  options?: { [key: string]: any },
) {
  const { uid: param0, updateId: param1, ...queryParams } = params;
  return request<API.CommonResultListResultString_>(`/star/listStared/${param0}/${param1}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除收藏夹 DELETE /star/removeStar/${param0} */
export async function removeStarUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.removeStarUsingDELETEParams,
  options?: { [key: string]: any },
) {
  const { sid: param0, ...queryParams } = params;
  return request<API.CommonResultString_>(`/star/removeStar/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除收藏的视频 DELETE /star/removeStarVideo/${param0}/${param1} */
export async function removeStarVideoUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.removeStarVideoUsingDELETEParams,
  options?: { [key: string]: any },
) {
  const { sid: param0, updateId: param1, ...queryParams } = params;
  return request<API.CommonResultString_>(`/star/removeStarVideo/${param0}/${param1}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 收藏视频 POST /star/starVideo/${param0} */
export async function starVideoUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.starVideoUsingPOSTParams,
  body: string[],
  options?: { [key: string]: any },
) {
  const { updateId: param0, ...queryParams } = params;
  return request<API.CommonResultString_>(`/star/starVideo/${param0}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
