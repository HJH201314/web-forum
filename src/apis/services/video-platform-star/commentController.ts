// @ts-ignore
/* eslint-disable */
import { request } from './base';

/** 添加评论 POST /comment/add */
export async function addCommentUsingPost(body: API.Comment, options?: { [key: string]: any }) {
  return request<API.CommonResultString_>('/comment/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 根据foreignId获取评论总数 GET /comment/count/${param0} */
export async function countCommentsByForeignIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.countCommentsByForeignIdUsingGETParams,
  options?: { [key: string]: any },
) {
  const { foreignId: param0, ...queryParams } = params;
  return request<API.CommonResultLong_>(`/comment/count/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 根据pid获取子评论总数 GET /comment/countChildrenComments/${param0} */
export async function countChildrenCommentsByPidUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.countChildrenCommentsByPidUsingGETParams,
  options?: { [key: string]: any },
) {
  const { pid: param0, ...queryParams } = params;
  return request<API.CommonResultInt_>(`/comment/countChildrenComments/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除子评论 DELETE /comment/deleteChild/${param1}/${param0} */
export async function deleteChildCommentUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteChildCommentUsingDELETEParams,
  options?: { [key: string]: any },
) {
  const { cid: param0, pid: param1, ...queryParams } = params;
  return request<API.CommonResultString_>(`/comment/deleteChild/${param1}/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除根评论 DELETE /comment/deleteRoot/${param0} */
export async function deleteRootCommentUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteRootCommentUsingDELETEParams,
  options?: { [key: string]: any },
) {
  const { pid: param0, ...queryParams } = params;
  return request<API.CommonResultString_>(`/comment/deleteRoot/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 点赞子评论 POST /comment/likeChildren/${param1}/${param2}/${param0}/${param4}/${param3} */
export async function likeChildrenCommentUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.likeChildrenCommentUsingPOSTParams,
  options?: { [key: string]: any },
) {
  const {
    cid: param0,
    flag: param1,
    pid: param2,
    pUid: param3,
    uid: param4,
    ...queryParams
  } = params;
  return request<API.CommonResultString_>(
    `/comment/likeChildren/${param1}/${param2}/${param0}/${param4}/${param3}`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** 点赞根评论 POST /comment/likeRoot/${param0}/${param1}/${param3}/${param2} */
export async function likeRootCommentUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.likeRootCommentUsingPOSTParams,
  options?: { [key: string]: any },
) {
  const { flag: param0, pid: param1, pUid: param2, uid: param3, ...queryParams } = params;
  return request<API.CommonResultString_>(
    `/comment/likeRoot/${param0}/${param1}/${param3}/${param2}`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** 分页获取对应根评论下的子评论 GET /comment/listChildrenComment/${param1}/${param0}/${param2}/${param3} */
export async function listChildrenCommentByPagesUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listChildrenCommentByPagesUsingGETParams,
  options?: { [key: string]: any },
) {
  const { page: param0, pid: param1, size: param2, uid: param3, ...queryParams } = params;
  return request<API.CommonResultListResultCommentVo_>(
    `/comment/listChildrenComment/${param1}/${param0}/${param2}/${param3}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** 分页获取评论 GET /comment/listRootComment/${param0}/${param1}/${param2}/${param3} */
export async function listCommentByPagesUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listCommentByPagesUsingGETParams,
  options?: { [key: string]: any },
) {
  const { foreignId: param0, page: param1, size: param2, uid: param3, ...queryParams } = params;
  return request<API.CommonResultListResultCommentVo_>(
    `/comment/listRootComment/${param0}/${param1}/${param2}/${param3}`,
    {
      method: 'GET',
      params: {
        ...queryParams,
      },
      ...(options || {}),
    },
  );
}

/** 回复评论 POST /comment/reply/${param0} */
export async function replyCommentUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.replyCommentUsingPOSTParams,
  body: API.Comment,
  options?: { [key: string]: any },
) {
  const { pid: param0, ...queryParams } = params;
  return request<API.CommonResultString_>(`/comment/reply/${param0}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 置顶评论:1：置顶 0：取消置顶 POST /comment/toTopComment/${param1}/${param0} */
export async function toTopCommentUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.toTopCommentUsingPOSTParams,
  options?: { [key: string]: any },
) {
  const { flag: param0, pid: param1, ...queryParams } = params;
  return request<API.CommonResultString_>(`/comment/toTopComment/${param1}/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}
