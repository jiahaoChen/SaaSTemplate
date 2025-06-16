import { request } from '@umijs/max';
import type { CurrentUser, GeographicItemType } from './data';
import { usersReadUserMe } from '@/services/ant-design-pro/users';

export async function queryCurrent(): Promise<{ data: CurrentUser }> {
  const userPublic = await usersReadUserMe();

  // Map API.UserPublic to CurrentUser
  const currentUser: CurrentUser = {
    name: userPublic.full_name || userPublic.email, // Use full_name or fallback to email
    avatar: userPublic.avatar || 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png', // Default avatar
    userid: userPublic.id,
    email: userPublic.email,
    signature: userPublic.signature || '', // Map signature from userPublic
    title: userPublic.title || '', // Map title from userPublic
    group: userPublic.group || '', // Map group from userPublic
    tags: [], // Not available in API.UserPublic
    notifyCount: userPublic.notify_count || 0, // Map notify_count from userPublic
    unreadCount: userPublic.unread_count || 0, // Map unread_count from userPublic
    country: userPublic.country || '', // Map country from userPublic
    geographic: { // Not available in API.UserPublic, providing default structure
      province: { label: '', key: '', name: '', id: '' }, // Add name and id to GeographicItemType
      city: { label: '', key: '', name: '', id: '' }, // Add name and id to GeographicItemType
    },
    address: userPublic.address || '', // Map address from userPublic
    phone: userPublic.phone || '', // Map phone from userPublic
    full_name: userPublic.full_name || userPublic.email,
    notice: [], // Add default empty array for notice
  };

  return { data: currentUser };
}

export async function queryProvince(): Promise<{ data: GeographicItemType[] }> {
  return request('/api/geographic/province');
}

export async function queryCity(province: string): Promise<{ data: GeographicItemType[] }> {
  return request(`/api/geographic/city/${province}`);
}

export async function query() {
  return request('/api/users');
}
