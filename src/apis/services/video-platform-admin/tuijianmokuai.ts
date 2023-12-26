// @ts-ignore
/* eslint-disable */
import { request } from './base';

/** 获取推荐的动态id（如果历史数据不足，返回的第一个元素是-1，然后后面跟着的就是得分前五的分区id） GET /recommend/getRecommend/${param0} */
export async function getRecommendUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getRecommendUsingGETParams,
  options?: { [key: string]: any },
) {
  const { uid: param0, ...queryParams } = params;
  return request<API.CommonResultListInt_>(`/recommend/getRecommend/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 根据当前观看的视频动态id获取推荐的动态id（如果历史数据不足，返回的第一个元素是-1，然后后面跟着的就是得分前五的分区id） GET /recommend/getRecommend/${param0}/${param1} */
export async function getRecommendByUpdateIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getRecommendByUpdateIdUsingGETParams,
  options?: { [key: string]: any },
) {
  const { uid: param0, updateId: param1, ...queryParams } = params;
  return request<API.CommonResultListInt_>(`/recommend/getRecommend/${param0}/${param1}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 增加得分 POST /recommend/plusScore/${param1}/${param2}/${param0} */
export async function plusScoreUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.plusScoreUsingPOSTParams,
  options?: { [key: string]: any },
) {
  const { score: param0, uid: param1, updateId: param2, ...queryParams } = params;
  return request<API.CommonResultString_>(`/recommend/plusScore/${param1}/${param2}/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}
