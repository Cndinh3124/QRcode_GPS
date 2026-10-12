import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import App from './App';
import { AuthProvider } from './features/auth/context/AuthContext';

import './styles/global.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1769D2',
            colorInfo: '#079AC7',
            colorSuccess: '#21865B',
            colorText: '#24364B',
            colorTextSecondary: '#71849A',
            colorBgLayout: '#F4F8FC',
            colorBorder: '#E1EAF3',
            borderRadius: 10,
            fontFamily: 'Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            controlHeight: 42,
            controlHeightLG: 48,
          },
          components: {
            Layout: {
              bodyBg: '#F4F8FC',
              headerBg: '#FFFFFF',
              siderBg: '#FFFFFF',
            },
            Menu: {
              itemSelectedBg: '#E2EEFF',
              itemSelectedColor: '#1769D2',
              itemHoverBg: '#F0F7FF',
              itemBorderRadius: 10,
            },
            Card: {
              colorBorderSecondary: '#E1EAF3',
            },
            Button: {
              primaryShadow: '0 5px 14px rgba(23, 105, 210, 0.18)',
            },
          },
        }}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);