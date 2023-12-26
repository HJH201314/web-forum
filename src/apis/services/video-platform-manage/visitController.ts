// @ts-ignore
/* eslint-disable */
import { request } from './base';

/** 查找某一天的访问量 GET /visit/day/${param0} */
export async function getVisByDayUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getVisByDayUsingGETParams,
  options?: { [key: string]: any },
) {
  const { timeId: param0, ...queryParams } = params;
  return request<API.CommonResultListVisit_>(`/visit/day/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取今日的访问量 GET /visit/today */
export async function getTodayVisUsingGet(options?: { [key: string]: any }) {
  return request<API.CommonResultMapObjectObject_>('/visit/today', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 根据特定的年月查询总的访问量 GET /visit/year/${param1}/mon/${param0} */
export async function getVisByMonUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getVisByMonUsingGETParams,
  options?: { [key: string]: any },
) {
  const { mon: param0, year: param1, ...queryParams } = params;
  return request<API.CommonResultListVisitMonTotal_>(`/visit/year/${param1}/mon/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}
