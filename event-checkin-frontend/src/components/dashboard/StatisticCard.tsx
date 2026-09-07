import {
  Card,
  Statistic,
} from 'antd';

import type {
  ReactNode,
} from 'react';

interface StatisticCardProps {
  title: string;
  value: number;
  icon?: ReactNode;
}

export default function StatisticCard({
  title,
  value,
  icon,
}: StatisticCardProps) {
  return (
    <Card
      hoverable
      style={{
        width: '100%',
        minHeight: 124,
        borderRadius: 12,
        border: '1px solid #f0f0f0',
        boxShadow:
          '0 2px 8px rgba(0, 0, 0, 0.05)',
      }}
      styles={{
        body: {
          padding: '22px 24px',
        },
      }}
    >
      <Statistic
        title={
          <span
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: '#595959',
            }}
          >
            {title}
          </span>
        }
        value={value}
        prefix={
          <span
            style={{
              fontSize: 30,
              marginRight: 4,
              color: '#1677ff',
            }}
          >
            {icon}
          </span>
        }
        valueStyle={{
          fontSize: 32,
          lineHeight: 1.2,
          fontWeight: 700,
          color: '#1f1f1f',
        }}
      />
    </Card>
  );
}