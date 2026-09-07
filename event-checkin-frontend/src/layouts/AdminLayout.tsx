import { useState } from 'react';

import {
  Avatar,
  Dropdown,
  Layout,
  Menu,
  Space,
  Typography,
} from 'antd';

import type { MenuProps } from 'antd';

import {
  CalendarOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';

import {
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { useAuth } from '../features/auth/hooks/useAuth';

import { ROUTES } from '../constants/routes';

const {
  Header,
  Sider,
  Content,
} = Layout;

const { Text } = Typography;

export default function AdminLayout() {
  const navigate = useNavigate();

  const location = useLocation();

  const { logout } = useAuth();

  const [collapsed, setCollapsed] =
    useState(false);

  // =========================================================
  // CURRENT MENU
  // =========================================================

  function getSelectedMenuKey(): string {
    const pathname =
      location.pathname;

    // -------------------------------------------------------
    // DASHBOARD
    // -------------------------------------------------------

    if (
      pathname === '/' ||
      pathname === '/dashboard'
    ) {
      return 'dashboard';
    }

    // -------------------------------------------------------
    // USERS
    // -------------------------------------------------------

    if (
      pathname === ROUTES.USERS ||
      pathname.startsWith('/users/')
    ) {
      return 'users';
    }

    // -------------------------------------------------------
    // EVENTS
    // -------------------------------------------------------

    if (
      pathname === ROUTES.EVENTS ||
      pathname.startsWith('/events/')
    ) {
      return 'events';
    }

    // -------------------------------------------------------
    // ATTENDANCE
    // -------------------------------------------------------

    if (
      pathname === ROUTES.ATTENDANCE ||
      pathname.startsWith('/attendance/')
    ) {
      return 'attendance';
    }

    // -------------------------------------------------------
    // REPORTS
    // -------------------------------------------------------

    if (
      pathname === '/reports' ||
      pathname.startsWith('/reports/')
    ) {
      return 'reports';
    }

    // -------------------------------------------------------
    // SETTINGS
    // -------------------------------------------------------

    if (
      pathname === ROUTES.SETTINGS ||
      pathname.startsWith('/settings/')
    ) {
      return 'settings';
    }

    // -------------------------------------------------------
    // DEFAULT
    // -------------------------------------------------------

    return 'dashboard';
  }

  // =========================================================
  // NAVIGATION
  // =========================================================

  function handleMenuClick(
    key: string,
  ) {
    switch (key) {
      case 'dashboard':
        navigate('/dashboard');
        break;

      case 'users':
        navigate(ROUTES.USERS);
        break;

      case 'events':
        navigate(ROUTES.EVENTS);
        break;

      case 'attendance':
        navigate(ROUTES.ATTENDANCE);
        break;

      case 'reports':
        navigate('/reports');
        break;

      case 'settings':
        navigate(ROUTES.SETTINGS);
        break;

      default:
        break;
    }
  }

  // =========================================================
  // USER MENU
  // =========================================================

  const userMenu: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'My Profile',
    },

    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },

    {
      type: 'divider',
    },

    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Logout',
    },
  ];

  function handleUserMenuClick({
    key,
  }: {
    key: string;
  }) {
    switch (key) {
      case 'profile':
        navigate(ROUTES.SETTINGS);
        break;

      case 'settings':
        navigate(ROUTES.SETTINGS);
        break;

      case 'logout':
        logout();
        break;

      default:
        break;
    }
  }

  // =========================================================
  // SIDEBAR MENU
  // =========================================================

  const menuItems: MenuProps['items'] = [
    // -------------------------------------------------------
    // DASHBOARD
    // -------------------------------------------------------

    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },

    // -------------------------------------------------------
    // MANAGEMENT
    // -------------------------------------------------------

    {
      type: 'group',
      label: 'Management',

      children: [
        {
          key: 'users',
          icon: <UserOutlined />,
          label: 'Users',
        },

        {
          key: 'events',
          icon: <CalendarOutlined />,
          label: 'Events',
        },

        {
          key: 'attendance',
          icon: <CheckCircleOutlined />,
          label: 'Attendance',
        },

        {
          key: 'reports',
          icon: <FileTextOutlined />,
          label: 'Reports',
        },
      ],
    },

    // -------------------------------------------------------
    // SYSTEM
    // -------------------------------------------------------

    {
      type: 'group',
      label: 'System',

      children: [
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: 'Settings',
        },
      ],
    },
  ];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: '#f5f7fa',
      }}
    >
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sider
        theme="light"
        width={248}
        collapsedWidth={72}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        style={{
          background: '#ffffff',
          borderRight:
            '1px solid #e8eaed',
        }}
      >
        {/* ===================================================
            BRAND
        =================================================== */}

        <div
          style={{
            height: 72,

            padding: collapsed
              ? '0 12px'
              : '0 22px',

            display: 'flex',
            alignItems: 'center',

            borderBottom:
              '1px solid #f0f0f0',
          }}
        >
          {/* QR LOGO */}

          <div
            style={{
              width: 36,
              height: 36,

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',

              borderRadius: 8,

              background: '#1677ff',

              color: '#ffffff',

              fontSize: 17,
              fontWeight: 700,

              flexShrink: 0,
            }}
          >
            QR
          </div>

          {/* BRAND NAME */}

          {!collapsed && (
            <div
              style={{
                marginLeft: 12,
                lineHeight: 1.2,
              }}
            >
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: '#1f1f1f',
                }}
              >
                QR Event
              </div>

              <div
                style={{
                  marginTop: 3,
                  fontSize: 12,
                  color: '#8c8c8c',
                }}
              >
                Check-in Management
              </div>
            </div>
          )}
        </div>

        {/* ===================================================
            SIDEBAR MENU
        =================================================== */}

        <Menu
          mode="inline"
          theme="light"
          selectedKeys={[
            getSelectedMenuKey(),
          ]}
          items={menuItems}
          onClick={({ key }) =>
            handleMenuClick(key)
          }
          style={{
            borderInlineEnd: 'none',

            padding: collapsed
              ? '12px 8px'
              : '12px 10px',

            fontSize: 15,
          }}
        />
      </Sider>

      {/* =====================================================
          MAIN LAYOUT
      ===================================================== */}

      <Layout
        style={{
          minWidth: 0,
          background: '#f5f7fa',
        }}
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <Header
          style={{
            height: 72,

            padding: '0 28px',

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',

            background: '#ffffff',

            borderBottom:
              '1px solid #e8eaed',

            lineHeight: 'normal',
          }}
        >
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            menu={{
              items: userMenu,

              onClick:
                handleUserMenuClick,
            }}
            styles={{
              root: {
                minWidth: 210,
              },
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',

                gap: 12,

                padding:
                  '7px 8px 7px 12px',

                borderRadius: 8,

                cursor: 'pointer',

                transition:
                  'background 0.2s',
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background =
                  '#f5f5f5';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background =
                  'transparent';
              }}
            >
              {/* USER INFORMATION */}

              <div
                style={{
                  textAlign: 'right',
                  lineHeight: 1.25,
                }}
              >
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#262626',
                  }}
                >
                  Nguyen Cong Dinh
                </div>

                <Text
                  type="secondary"
                  style={{
                    fontSize: 13,
                  }}
                >
                  Administrator
                </Text>
              </div>

              {/* USER AVATAR */}

              <Avatar
                size={40}
                icon={
                  <UserOutlined />
                }
                style={{
                  background: '#e6f4ff',

                  color: '#1677ff',

                  border:
                    '1px solid #bae0ff',
                }}
              />
            </div>
          </Dropdown>
        </Header>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <Content
          style={{
            minHeight:
              'calc(100vh - 72px)',

            padding: 28,

            background: '#f5f7fa',
          }}
        >
          <div
            style={{
              width: '100%',

              maxWidth: 1600,

              margin: '0 auto',
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}