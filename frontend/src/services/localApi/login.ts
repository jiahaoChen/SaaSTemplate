// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** Login Access Token OAuth2 compatible token login, get an access token for future requests POST /api/v1/login/access-token */
export async function loginLoginAccessToken(
  body: API.BodyLoginLoginAccessToken,
  options?: { [key: string]: any },
) {
  return request<API.Token>('/api/v1/login/access-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: body,
    ...(options || {}),
  });
}

/** Test Token Test access token POST /api/v1/login/test-token */
export async function loginTestToken(options?: { [key: string]: any }) {
  return request<API.UserPublic>('/api/v1/login/test-token', {
    method: 'POST',
    ...(options || {}),
  });
}

/** Recover Password Html Content HTML Content for Password Recovery POST /api/v1/password-recovery-html-content/${param0} */
export async function loginRecoverPasswordHtmlContent(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.loginRecoverPasswordHtmlContentParams,
  options?: { [key: string]: any },
) {
  const { email: param0, ...queryParams } = params;
  return request<string>(`/api/v1/password-recovery-html-content/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Recover Password Password Recovery POST /api/v1/password-recovery/${param0} */
export async function loginRecoverPassword(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.loginRecoverPasswordParams,
  options?: { [key: string]: any },
) {
  const { email: param0, ...queryParams } = params;
  return request<API.Message>(`/api/v1/password-recovery/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Reset Password Reset password POST /api/v1/reset-password/ */
export async function loginResetPassword(body: API.NewPassword, options?: { [key: string]: any }) {
  return request<API.Message>('/api/v1/reset-password/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
