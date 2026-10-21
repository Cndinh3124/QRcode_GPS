import {
  Card,
  Descriptions,
  Tag,
  Typography,
} from 'antd';

import {
  MailOutlined,
  IdcardOutlined,
  UserOutlined,
  SafetyOutlined,
} from '@ant-design/icons';

import type {
  UserProfile,
} from '../types/settings.types';

const { Title } = Typography;

interface ProfileCardProps {
  profile: UserProfile;
}

export default function ProfileCard({
  profile,
}: ProfileCardProps) {
  return (
    <Card>
      <Title
        level={4}
        style={{
          marginTop: 0,
        }}
      >
        Profile
      </Title>

      <Descriptions
        bordered
        column={1}
        size="middle"
      >
        <Descriptions.Item
          label={
            <>
              <UserOutlined /> Họ và tên
            </>
          }
        >
          {profile.fullName}
        </Descriptions.Item>

        <Descriptions.Item
          label={
            <>
              <MailOutlined /> Email
            </>
          }
        >
          {profile.email}
        </Descriptions.Item>

        <Descriptions.Item
          label={
            <>
              <IdcardOutlined /> Mã sinh viên
            </>
          }
        >
          {profile.studentCode}
        </Descriptions.Item>

        <Descriptions.Item
          label={
            <>
              <SafetyOutlined /> Vai trò
            </>
          }
        >
          <Tag color="blue">
            {profile.role?.name ?? 'USER'}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Trạng thái tài khoản">
          {profile.isActive ? (
            <Tag color="green">
              Active
            </Tag>
          ) : (
            <Tag color="red">
              Inactive
            </Tag>
          )}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}