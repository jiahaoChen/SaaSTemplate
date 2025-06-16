import { UploadOutlined } from '@ant-design/icons';
import {
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useModel, useRequest } from '@umijs/max';
import { Button, message, Upload } from 'antd';
import React from 'react';
import { queryCurrent } from '../service';
import useStyles from './index.style';
import { usersUpdateUserMe } from '@/services/ant-design-pro/users';
import type { UploadFile } from 'antd/lib/upload/interface';

const BaseView: React.FC = () => {
  const { styles } = useStyles();
  const { initialState, setInitialState } = useModel('@@initialState');

  // 头像组件 方便以后独立，增加裁剪之类的功能
  const AvatarView = ({ avatar }: { avatar: string }) => (
    <>
      <div className={styles.avatar_title}>头像</div>
      <div className={styles.avatar}>
        <img src={avatar} alt="avatar" />
      </div>
      <Upload
        name="file"
        action="/api/v1/users/me/avatar" // Backend API endpoint for avatar upload
        headers={{
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }}
        showUploadList={false}
        beforeUpload={(file) => {
          console.log('File size (bytes):', file.size);
          const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
          if (!isJpgOrPng) {
            message.error('您只能上傳 JPG/PNG 文件!');
          }
          const isLt2M = file.size / 1024 / 1024 < 2;
          console.log('isLt2M result:', isLt2M);
          if (!isLt2M) {
            message.error('[DEV] 圖片大小超過限制！'); // Modified error message for debugging
          }
          return isJpgOrPng && isLt2M;
        }}
        onChange={(info) => {
          if (info.file.status === 'done') {
            const uploadedUser = info.file.response; // Correctly access the user object directly from response
            if (initialState?.currentUser && uploadedUser) {
              setInitialState({
                ...initialState,
                currentUser: {
                  ...initialState.currentUser,
                  avatar: uploadedUser.avatar || initialState.currentUser.avatar,
                },
              });
            }
            message.success(`${info.file.name} 文件上傳成功`);
            refresh(); // Re-fetch user data to ensure UI is updated
          } else if (info.file.status === 'error') {
            message.error(`${info.file.name} 文件上傳失敗.`);
            console.error('上傳失敗:', info.file.response); // Log backend error response for debugging
          }
        }}
      >
        <div className={styles.button_view}>
          <Button>
            <UploadOutlined />
            更换头像
          </Button>
        </div>
      </Upload>
    </>
  );
  const { data: currentUser, loading, refresh } = useRequest(() => {
    return queryCurrent();
  });
  const getAvatarURL = () => {
    if (currentUser) {
      if (currentUser.avatar) {
        return currentUser.avatar;
      }
      const url = 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png';
      return url;
    }
    return '';
  };
  const handleFinish = async (values: { email: string; name: string; profile: string }) => {
    try {
      const updatedUser = await usersUpdateUserMe({
        email: values.email,
        full_name: values.name,
        signature: values.profile,
      });

      if (initialState?.currentUser) {
        setInitialState({
          ...initialState,
          currentUser: {
            ...initialState.currentUser,
            email: updatedUser.email,
            full_name: updatedUser.full_name,
            signature: updatedUser.signature,
            avatar: updatedUser.avatar || initialState.currentUser.avatar,
          },
        });
      }
      refresh(); // Re-fetch user data to ensure UI is updated
      message.success('更新基本信息成功');
    } catch (error) {
      message.error('更新基本信息失敗，請重試！');
      console.error('更新失敗:', error);
    }
  };
  return (
    <div className={styles.baseView}>
      {loading ? null : (
        <>
          <div className={styles.left}>
            <ProForm
              layout="vertical"
              onFinish={handleFinish}
              submitter={{
                searchConfig: {
                  submitText: '更新基本信息',
                },
                render: (_, dom) => dom[1],
              }}
              initialValues={{
                ...currentUser,
                name: currentUser?.name || currentUser?.full_name, // Ensure 'name' field is populated
                profile: currentUser?.signature, // Map signature to profile for display
              }}
              hideRequiredMark
            >
              <ProFormText
                width="md"
                name="email"
                label="邮箱"
                rules={[
                  {
                    required: true,
                    message: '请输入您的邮箱!',
                  },
                ]}
              />
              <ProFormText
                width="md"
                name="name"
                label="昵称"
                rules={[
                  {
                    required: true,
                    message: '请输入您的昵称!',
                  },
                ]}
              />
              <ProFormTextArea
                name="profile"
                label="个人简介"
                rules={[
                  {
                    required: true,
                    message: '请输入个人简介!',
                  },
                ]}
                placeholder="个人简介"
              />
            </ProForm>
          </div>
          <div className={styles.right}>
            <AvatarView avatar={getAvatarURL()} />
          </div>
        </>
      )}
    </div>
  );
};

export default BaseView;
