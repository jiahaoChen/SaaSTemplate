import { request } from '@umijs/max';
import type { ActivitiesType, AnalysisData, NoticeType } from './data.d';

export async function queryProjectNotice(options?: { [key: string]: any }) {
  return request<{
    data: NoticeType[];
  }>('/api/v1/notices', options || {});
}

export async function queryActivities(options?: { [key: string]: any }) {
  return request<{
    data: ActivitiesType[];
  }>('/api/v1/activities', options || {});
}

export async function fakeChartData(): Promise<{ data: AnalysisData }> {
  return request('/api/v1/chart_data');
}
