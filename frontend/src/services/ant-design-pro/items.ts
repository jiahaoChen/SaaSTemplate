// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** Read Items Retrieve items. GET /api/v1/items/ */
export async function itemsReadItems(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.itemsReadItemsParams,
  options?: { [key: string]: any },
) {
  return request<API.ItemsPublic>('/api/v1/items/', {
    method: 'GET',
    params: {
      // limit has a default value: 100
      limit: '100',
      ...params,
    },
    ...(options || {}),
  });
}

/** Create Item Create new item. POST /api/v1/items/ */
export async function itemsCreateItem(body: API.ItemCreate, options?: { [key: string]: any }) {
  return request<API.ItemPublic>('/api/v1/items/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Read Item Get item by ID. GET /api/v1/items/${param0} */
export async function itemsReadItem(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.itemsReadItemParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ItemPublic>(`/api/v1/items/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Update Item Update an item. PUT /api/v1/items/${param0} */
export async function itemsUpdateItem(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.itemsUpdateItemParams,
  body: API.ItemUpdate,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ItemPublic>(`/api/v1/items/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** Delete Item Delete an item. DELETE /api/v1/items/${param0} */
export async function itemsDeleteItem(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.itemsDeleteItemParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Message>(`/api/v1/items/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
