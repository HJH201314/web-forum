// @ts-ignore
/* eslint-disable */
import { request } from './base';

/** 文件上传，上传时固定key=file，返回值为文件存储的路径 POST /file/upload */
export async function uploadUsingPost(body: string, options?: { [key: string]: any }) {
  const formData = new FormData();

  Object.keys(body).forEach((ele) => {
    const item = (body as any)[ele];

    if (item !== undefined && item !== null) {
      if (typeof item === 'object' && !(item instanceof File)) {
        if (item instanceof Array) {
          item.forEach((f) => formData.append(ele, f || ''));
        } else {
          formData.append(ele, JSON.stringify(item));
        }
      } else {
        formData.append(ele, item);
      }
    }
  });

  return request<API.CommonResultString_>('/file/upload', {
    method: 'POST',
    data: formData,
    requestType: 'form',
    ...(options || {}),
  });
}
