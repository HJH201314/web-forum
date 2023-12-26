// @ts-ignore
/* eslint-disable */
import { request } from './base';

/** 获取当前登录用户信息 GET /scy/current */
export async function getCurrentUserUsingGet(options?: { [key: string]: any }) {
  return request<API.CommonResultUser_>('/scy/current', {
    method: 'GET',
    ...(options || {}),
  });
}

/** login POST /scy/login */
export async function loginUsingPost(body: API.LoginDto, options?: { [key: string]: any }) {
  return request<API.CommonResultString_>('/scy/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** logout GET /scy/logout */
export async function logoutUsingGet(options?: { [key: string]: any }) {
  return request<API.CommonResultString_>('/scy/logout', {
    method: 'GET',
    ...(options || {}),
  });
}

/** p1 GET /scy/p1 */
export async function p1UsingGet(options?: { [key: string]: any }) {
  return request<API.CommonResultString_>('/scy/p1', {
    method: 'GET',
    ...(options || {}),
  });
}

/** p6 GET /scy/p6 */
export async function p6UsingGet(options?: { [key: string]: any }) {
  return request<API.CommonResultString_>('/scy/p6', {
    method: 'GET',
    ...(options || {}),
  });
}

/** getPin POST /scy/pin */
export async function getPinUsingPost(body: API.AuthDto, options?: { [key: string]: any }) {
  return request<API.CommonResultString_>('/scy/pin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** register POST /scy/register */
export async function registerUsingPost(body: API.RegisterDto, options?: { [key: string]: any }) {
  return request<API.CommonResultString_>('/scy/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
