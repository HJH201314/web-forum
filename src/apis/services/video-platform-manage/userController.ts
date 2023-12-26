// @ts-ignore
/* eslint-disable */
import { request } from './base';

/** 新增用户，同时新增关联的默认detail、statistics、role信息 POST /mg/user/add */
export async function addUserUsingPost(body: API.User, options?: { [key: string]: any }) {
  return request<API.CommonResultString_>('/mg/user/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 根据用户id、角色id增加角色 POST /mg/user/addrole/${param1}/${param0} */
export async function addRoleByIdUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.addRoleByIdUsingPOSTParams,
  options?: { [key: string]: any },
) {
  const { roleId: param0, userId: param1, ...queryParams } = params;
  return request<API.CommonResultString_>(`/mg/user/addrole/${param1}/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 根据id删除用户，同时删除与之关联的detail、statistics、role信息 DELETE /mg/user/delete/${param0} */
export async function deleteUserByIdUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteUserByIdUsingDELETEParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.CommonResultString_>(`/mg/user/delete/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 根据用户id。权限id删除权限 DELETE /mg/user/deleterole/${param1}/${param0} */
export async function deleteRoleByIdUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteRoleByIdUsingDELETEParams,
  options?: { [key: string]: any },
) {
  const { roleId: param0, userId: param1, ...queryParams } = params;
  return request<API.CommonResultString_>(`/mg/user/deleterole/${param1}/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取所有用户（仅user表） GET /mg/user/list */
export async function getAllUserUsingGet(options?: { [key: string]: any }) {
  return request<API.CommonResultObject_>('/mg/user/list', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 根据用户id修改用户（仅user） PUT /mg/user/update */
export async function updateUserUsingPut(body: API.User, options?: { [key: string]: any }) {
  return request<API.CommonResultString_>('/mg/user/update', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 根据uid更新detail表信息 PUT /mg/user/updatedetail */
export async function updateDetailByIdUsingPut(
  body: API.UserDetail,
  options?: { [key: string]: any },
) {
  return request<API.CommonResultString_>('/mg/user/updatedetail', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 根据uid更新statistics表信息 PUT /mg/user/updatestatistics */
export async function updateStatisticsByIdUsingPut(
  body: API.UserStatistics,
  options?: { [key: string]: any },
) {
  return request<API.CommonResultString_>('/mg/user/updatestatistics', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
