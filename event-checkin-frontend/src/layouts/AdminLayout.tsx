import { useState } from 'react';

import {
  Avatar,
  Button,
  Drawer,
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
  MenuOutlined,
  SettingOutlined,
  SafetyOutlined,
  UserOutlined,
} from '@ant-design/icons';

import {
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { useAuth } from '../features/auth/hooks/useAuth';
import { getUser } from '../features/auth/utils/auth.storage';

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
  const user = getUser();

  const [collapsed, setCollapsed] =
    useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] =
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

    if (pathname === '/ai-fraud' || pathname.startsWith('/ai-fraud/')) {
      return 'ai-fraud';
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
    // Dong menu sau khi chon muc tren dien thoai.
    setMobileMenuOpen(false);
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

      case 'ai-fraud':
        navigate('/ai-fraud');
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
      label: 'Hồ sơ của tôi',
    },

    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },

    {
      type: 'divider',
    },

    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Đăng xuất',
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
      label: 'Tổng quan',
    },

    // -------------------------------------------------------
    // MANAGEMENT
    // -------------------------------------------------------

    {
      type: 'group',
      label: 'Quản lý',

      children: [
        {
          key: 'users',
          icon: <UserOutlined />,
          label: 'Người dùng',
        },

        {
          key: 'events',
          icon: <CalendarOutlined />,
          label: 'Sự kiện',
        },

        {
          key: 'attendance',
          icon: <CheckCircleOutlined />,
          label: 'Điểm danh',
        },

        {
          key: 'reports',
          icon: <FileTextOutlined />,
          label: 'Báo cáo',
        },

        {
          key: 'ai-fraud',
          icon: <SafetyOutlined />,
          label: 'AI điểm danh',
        },
      ],
    },

    // -------------------------------------------------------
    // SYSTEM
    // -------------------------------------------------------

    {
      type: 'group',
      label: 'Hệ thống',

      children: [
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: 'Cài đặt',
        },
      ],
    },
  ];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Layout
      className="admin-main-layout"
      style={{
        minHeight: '100vh',
        background: 'var(--color-page)',
      }}
    >
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sider
        className="admin-desktop-sider"
        theme="light"
        width={248}
        collapsedWidth={72}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        style={{
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
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
              '1px solid var(--color-border)',
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

              background: 'var(--color-primary)',

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
                Quản lý điểm danh
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

      {/* Menu truot danh cho man hinh nho. */}
      <Drawer
        className="admin-drawer"
        title="QR Event - Quản lý điểm danh"
        placement="left"
        width={280}
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        styles={{ body: { padding: 0 } }}
      >
        <Menu
          mode="inline"
          theme="light"
          selectedKeys={[getSelectedMenuKey()]}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
        />
      </Drawer>

      {/* =====================================================
          MAIN LAYOUT
      ===================================================== */}

      <Layout
        style={{
          minWidth: 0,
          background: 'var(--color-page)',
        }}
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <Header
          className="admin-header"
          style={{
            height: 72,

            padding: '0 28px',

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',

            background: 'var(--color-surface)',

            borderBottom:
              '1px solid var(--color-border)',

            lineHeight: 'normal',
          }}
        >
          <Button
            className="admin-mobile-menu-button"
            aria-label="Mở menu điều hướng"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuOpen(true)}
          />
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
              className="admin-user-trigger"
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
                  '#F0F7FF';
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
                  className="admin-header-user-name"
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: 'var(--color-text)',
                  }}
                >
                  {user?.fullName || 'Người dùng'}
                </div>

                <Text
                  className="admin-header-user-role"
                  type="secondary"
                  style={{
                    fontSize: 13,
                  }}
                >
                  {user?.role === 'ADMIN'
                    ? 'Quản trị viên'
                    : user?.role === 'ORGANIZER'
                      ? 'Ban tổ chức'
                      : 'Người tham gia'}
                </Text>
              </div>

              {/* USER AVATAR */}

              <Avatar
                size={40}
                icon={
                  <UserOutlined />
                }
                style={{
                  background: '#DDF6FC',

                  color: 'var(--color-primary)',

                  border:
                    '1px solid #B7EAF6',
                }}
              />
            </div>
          </Dropdown>
        </Header>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <Content
          className="admin-content"
          style={{
            minHeight:
              'calc(100vh - 72px)',

            padding: 'clamp(16px, 2.2vw, 28px)',

            background: 'var(--color-page)',
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
