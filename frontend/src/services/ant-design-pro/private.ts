// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** Create User Create a new user. POST /api/v1/private/users/ */
export async function privateCreateUser(
  body: API.PrivateUserCreate,
  options?: { [key: string]: any },
) {
  return request<API.UserPublic>('/api/v1/private/users/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
