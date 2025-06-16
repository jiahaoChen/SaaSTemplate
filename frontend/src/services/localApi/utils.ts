// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** Health Check GET /api/v1/utils/health-check/ */
export async function utilsHealthCheck(options?: { [key: string]: any }) {
  return request<boolean>('/api/v1/utils/health-check/', {
    method: 'GET',
    ...(options || {}),
  });
}

/** Test Email Test emails. POST /api/v1/utils/test-email/ */
export async function utilsTestEmail(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.utilsTestEmailParams,
  options?: { [key: string]: any },
) {
  return request<API.Message>('/api/v1/utils/test-email/', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
