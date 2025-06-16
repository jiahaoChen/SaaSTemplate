import { request } from '@umijs/max';
import type { ActivitiesType, AnalysisData, NoticeType } from './data';

export async function queryProjectNotice(): Promise<{ data: NoticeType[] }> {
  return request('/api/v1/project/notice');
}

export async function queryActivities(): Promise<{ data: ActivitiesType[] }> {
  return request('/api/v1/activities');
}

export async function fakeChartData(): Promise<{ data: AnalysisData }> {
  return request('/api/v1/chart_data');
}
