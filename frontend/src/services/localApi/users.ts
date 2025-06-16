// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** Read Users Retrieve users. GET /api/v1/users/ */
export async function usersReadUsers(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.usersReadUsersParams,
  options?: { [key: string]: any },
) {
  return request<API.UsersPublic>('/api/v1/users/', {
    method: 'GET',
    params: {
      // limit has a default value: 100
      limit: '100',
      ...params,
    },
    ...(options || {}),
  });
}

/** Create User Create new user. POST /api/v1/users/ */
export async function usersCreateUser(body: API.UserCreate, options?: { [key: string]: any }) {
  return request<API.UserPublic>('/api/v1/users/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Read User By Id Get a specific user by id. GET /api/v1/users/${param0} */
export async function usersReadUserById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.usersReadUserByIdParams,
  options?: { [key: string]: any },
) {
  const { user_id: param0, ...queryParams } = params;
  return request<API.UserPublic>(`/api/v1/users/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Delete User Delete a user. DELETE /api/v1/users/${param0} */
export async function usersDeleteUser(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.usersDeleteUserParams,
  options?: { [key: string]: any },
) {
  const { user_id: param0, ...queryParams } = params;
  return request<API.Message>(`/api/v1/users/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Update User Update a user. PATCH /api/v1/users/${param0} */
export async function usersUpdateUser(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.usersUpdateUserParams,
  body: API.UserUpdate,
  options?: { [key: string]: any },
) {
  const { user_id: param0, ...queryParams } = params;
  return request<API.UserPublic>(`/api/v1/users/${param0}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** Read User Me Get current user. GET /api/v1/users/me */
export async function usersReadUserMe(options?: { [key: string]: any }) {
  return request<API.UserPublic>('/api/v1/users/me', {
    method: 'GET',
    ...(options || {}),
  });
}

/** Delete User Me Delete own user. DELETE /api/v1/users/me */
export async function usersDeleteUserMe(options?: { [key: string]: any }) {
  return request<API.Message>('/api/v1/users/me', {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** Update User Me Update own user. PATCH /api/v1/users/me */
export async function usersUpdateUserMe(body: API.UserUpdateMe, options?: { [key: string]: any }) {
  return request<API.UserPublic>('/api/v1/users/me', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Update Password Me Update own password. PATCH /api/v1/users/me/password */
export async function usersUpdatePasswordMe(
  body: API.UpdatePassword,
  options?: { [key: string]: any },
) {
  return request<API.Message>('/api/v1/users/me/password', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Register User Create new user without the need to be logged in. POST /api/v1/users/signup */
export async function usersRegisterUser(body: API.UserRegister, options?: { [key: string]: any }) {
  return request<API.UserPublic>('/api/v1/users/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
