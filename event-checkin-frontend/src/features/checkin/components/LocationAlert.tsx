import {
  Alert,
} from 'antd';

import {
  EnvironmentOutlined,
} from '@ant-design/icons';

import {
  CHECKIN_MESSAGES,
} from '../constants/checkin.messages';

interface LocationAlertProps {
  message?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export default function LocationAlert({
  message = CHECKIN_MESSAGES.GPS_REQUIRED,
  type = 'info',
}: LocationAlertProps) {
  return (
    <Alert
      type={type}
      showIcon
      icon={<EnvironmentOutlined />}
      message={message}
      style={{
        marginBottom: 20,
      }}
    />
  );
}