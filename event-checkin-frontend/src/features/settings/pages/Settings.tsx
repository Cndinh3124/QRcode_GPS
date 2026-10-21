import {
  Alert,
  Col,
  Row,
  Spin,
  Typography,
  message,
} from 'antd';

import ProfileCard from '../components/ProfileCard';

import ChangePasswordForm, {
  type ChangePasswordFormValues,
} from '../components/ChangePasswordForm';

import { useProfile } from '../hooks/useProfile';

import { useChangePassword } from '../hooks/useChangePassword';

import type {
  ChangePasswordRequest,
} from '../types/settings.types';

import {
  changePasswordSchema,
} from '../validation/settings.schema';

const { Title, Text } = Typography;

export default function Settings() {
  const profileQuery = useProfile();

  const changePasswordMutation =
    useChangePassword();

  async function handleChangePassword(
    values: ChangePasswordFormValues,
  ): Promise<boolean> {
    const result =
      changePasswordSchema.safeParse(values);

    if (!result.success) {
      message.error(
        result.error.issues[0]?.message ??
          'Thông tin mật khẩu không hợp lệ.',
      );

      return false;
    }

    try {
      const payload: ChangePasswordRequest = {
        currentPassword:
          result.data.currentPassword,

        newPassword:
          result.data.newPassword,
      };

      await changePasswordMutation.mutateAsync(
        payload,
      );

      return true;
    } catch {
      return false;
    }
  }

  if (profileQuery.isLoading) {
    return (
      <div
        style={{
          minHeight: 400,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (
    profileQuery.isError ||
    !profileQuery.data
  ) {
    return (
      <Alert
        type="error"
        showIcon
        message="Không thể tải hồ sơ."
        description="Vui lòng thử lại sau."
      />
    );
  }

  return (
    <div>
      <div
        style={{
          marginBottom: 24,
        }}
      >
        <Title
          level={2}
          style={{
            marginBottom: 4,
          }}
        >
          Cài đặt
        </Title>

        <Text type="secondary">
          Quản lý hồ sơ và bảo mật tài khoản.
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <ProfileCard
            profile={profileQuery.data}
          />
        </Col>

        <Col xs={24} lg={12}>
          <ChangePasswordForm
            loading={
              changePasswordMutation.isPending
            }
            onSubmit={handleChangePassword}
          />
        </Col>
      </Row>
    </div>
  );
}