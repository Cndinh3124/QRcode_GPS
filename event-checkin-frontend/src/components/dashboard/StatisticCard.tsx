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
        borderRadius: 18,
        border: '1px solid var(--color-border)',
        boxShadow:
          '0 10px 30px rgba(28, 78, 130, 0.08)',
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
              color: '#71849A',
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
              color: '#1769D2',
            }}
          >
            {icon}
          </span>
        }
        valueStyle={{
          fontSize: 32,
          lineHeight: 1.2,
          fontWeight: 700,
          color: '#24364B',
        }}
      />
    </Card>
  );
}