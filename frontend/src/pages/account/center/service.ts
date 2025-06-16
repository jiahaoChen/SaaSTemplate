import { request } from '@umijs/max';
import type { CurrentUser, ListItemDataType } from './data.d';
import { usersReadUserMe } from '@/services/ant-design-pro/users';

export async function queryCurrent(): Promise<{ data: CurrentUser }> {
  const userPublic = await usersReadUserMe();

  // Map API.UserPublic to CurrentUser
  const currentUser: CurrentUser = {
    name: userPublic.full_name || userPublic.email, // Use full_name or fallback to email
    avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png', // Default avatar
    userid: userPublic.id,
    email: userPublic.email,
    signature: '', // Not available in API.UserPublic
    title: '', // Not available in API.UserPublic
    group: '', // Not available in API.UserPublic
    tags: [], // Not available in API.UserPublic
    notifyCount: 0, // Not available in API.UserPublic
    unreadCount: 0, // Not available in API.UserPublic
    country: '', // Not available in API.UserPublic
    geographic: { // Not available in API.UserPublic, providing default structure
      province: { label: '', key: '' },
      city: { label: '', key: '' },
    },
    address: '', // Not available in API.UserPublic
    phone: '', // Not available in API.UserPublic
    notice: [], // Add default empty array for notice
  };

  return { data: currentUser };
}

export async function queryFakeList(params: {
  count: number;
}): Promise<{ data: { list: ListItemDataType[] } }> {
  return request('/api/fake_list_Detail', {
    params,
  });
}
