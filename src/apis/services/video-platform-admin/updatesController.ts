// @ts-ignore
/* eslint-disable */
import { request } from './base';

/** 获取所有图文动态 GET /updates/all */
export async function allEssayUsingGet(options?: { [key: string]: any }) {
  return request<API.CommonResultListUpdateVo_>('/updates/all', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 更换视频封面，适用于生成的封面不满意，想自己更换的情况 POST /updates/changeVideoCover */
export async function changeVideoCoverUsingPost(body: string, options?: { [key: string]: any }) {
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

  return request<API.CommonResultString_>('/updates/changeVideoCover', {
    method: 'POST',
    data: formData,
    requestType: 'form',
    ...(options || {}),
  });
}

/** 获取动态数量 GET /updates/count/${param0} */
export async function countUpdatesUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.countUpdatesUsingGETParams,
  options?: { [key: string]: any },
) {
  const { uid: param0, ...queryParams } = params;
  return request<API.CommonResultInt_>(`/updates/count/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除指定图文动态 DELETE /updates/delete */
export async function deleteEssayByIdUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteEssayByIdUsingDELETEParams,
  options?: { [key: string]: any },
) {
  return request<API.CommonResultString_>('/updates/delete', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 修改图文动态 PUT /updates/essay */
export async function updateUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateUsingPUTParams,
  body: string[],
  options?: { [key: string]: any },
) {
  return request<API.CommonResultString_>('/updates/essay', {
    method: 'PUT',
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

/** 发布图文动态 POST /updates/essay */
export async function publishUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.publishUsingPOSTParams,
  body: string[],
  options?: { [key: string]: any },
) {
  return request<API.CommonResultInt_>('/updates/essay', {
    method: 'POST',
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

/** 获取指定图片，暂时也可以用来获取视频资源 GET /updates/getImage */
export async function getImagesUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getImagesUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<string>('/updates/getImage', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取首页视频动态的简略推送，返回拼接好的vo GET /updates/homePage */
export async function getHomePageUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getHomePageUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.CommonResultListVideoVo_>('/updates/homePage', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取单条图文动态 GET /updates/info/${param0} */
export async function getEssayByIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getEssayByIdUsingGETParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.CommonResultUpdate_>(`/updates/info/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 分页获取图文动态 GET /updates/inPage */
export async function getInPageUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getInPageUsingGETParams,
  body: API.UpdateSearchDto,
  options?: { [key: string]: any },
) {
  return request<API.CommonResultListUpdateVo_>('/updates/inPage', {
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

/** 点赞 POST /updates/like/${param0} */
export async function likeUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.likeUsingPOSTParams,
  options?: { [key: string]: any },
) {
  const { updateId: param0, ...queryParams } = params;
  return request<API.CommonResultString_>(`/updates/like/${param0}`, {
    method: 'POST',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}

/** 获取所有视频分区 GET /updates/partition */
export async function allPartitionsUsingGet(options?: { [key: string]: any }) {
  return request<API.CommonResultListPartition_>('/updates/partition', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 修改动态分区 PUT /updates/partition */
export async function updatePartitionUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updatePartitionUsingPUTParams,
  options?: { [key: string]: any },
) {
  return request<API.CommonResultString_>('/updates/partition', {
    method: 'PUT',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 添加动态分区 POST /updates/partition */
export async function addPartitionUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.addPartitionUsingPOSTParams,
  options?: { [key: string]: any },
) {
  return request<API.CommonResultString_>('/updates/partition', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 删除动态分区 DELETE /updates/partition */
export async function deletePartitionUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deletePartitionUsingDELETEParams,
  options?: { [key: string]: any },
) {
  return request<API.CommonResultString_>('/updates/partition', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 预览视频封面 GET /updates/previewVideoCover */
export async function previewVideoCoverUsingGet(options?: { [key: string]: any }) {
  return request<API.Resource>('/updates/previewVideoCover', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 上传视频,返回视频截取封面的url POST /updates/uploadMedia */
export async function uploadVideoUsingPost(body: string, options?: { [key: string]: any }) {
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

  return request<API.CommonResultString_>('/updates/uploadMedia', {
    method: 'POST',
    data: formData,
    requestType: 'form',
    ...(options || {}),
  });
}

/** 发布视频动态,返回msg结果信息 POST /updates/video */
export async function publishVideoUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.publishVideoUsingPOSTParams,
  options?: { [key: string]: any },
) {
  return request<API.CommonResultString_>('/updates/video', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 删除指定视频动态 DELETE /updates/video */
export async function deleteVideoByIdUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteVideoByIdUsingDELETEParams,
  options?: { [key: string]: any },
) {
  return request<API.CommonResultString_>('/updates/video', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
