// @ts-ignore
/* eslint-disable */
import { request } from './base';

/** 添加角色信息 POST /mg/role/add */
export async function addRoleUsingPost(body: API.Role, options?: { [key: string]: any }) {
  return request<API.CommonResultString_>('/mg/role/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除角色信息 DELETE /mg/role/delete */
export async function deleteRoleUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteRoleUsingDELETEParams,
  options?: { [key: string]: any },
) {
  return request<API.CommonResultString_>('/mg/role/delete', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 查询所有角色信息 GET /mg/role/list */
export async function getRoleListUsingGet(options?: { [key: string]: any }) {
  return request<API.CommonResultListRole_>('/mg/role/list', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 增加权限 POST /mg/role/permission/add */
export async function addPermissionUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.addPermissionUsingPOSTParams,
  options?: { [key: string]: any },
) {
  return request<API.CommonResultString_>('/mg/role/permission/add', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 删除权限 DELETE /mg/role/permission/delete */
export async function deletePermissionUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deletePermissionUsingDELETEParams,
  options?: { [key: string]: any },
) {
  return request<API.CommonResultString_>('/mg/role/permission/delete', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 查询所有权限信息 GET /mg/role/permission/list */
export async function getPermissionListUsingGet(options?: { [key: string]: any }) {
  return request<API.CommonResultListPermission_>('/mg/role/permission/list', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 修改oldRole为newRole POST /mg/role/update */
export async function updateRoleUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateRoleUsingPOSTParams,
  options?: { [key: string]: any },
) {
  return request<API.CommonResultString_>('/mg/role/update', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
