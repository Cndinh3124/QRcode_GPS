import { useState } from 'react';

import {
  Button,
  Card,
  Typography,
  message,
} from 'antd';

import { PlusOutlined } from '@ant-design/icons';

import { useNgười dùng } from '../hooks/useNgười dùng';

import UserModal from '../components/UserModal';
import UserTable from '../components/UserTable';

import type {
  CreateUserDto,
  UpdateUserDto,
  User,
} from '../types/user.types';

const { Title } = Typography;

export default function Người dùng() {
  const {
    users,
    createUser,
    updateUser,
    deleteUser,
  } = useNgười dùng();

  /**
   * TODO:
   * Thay bằng useVai tròs() khi hoàn thành module Vai tròs.
   */
  const roles = [
    {
      id: 1,
      name: 'ADMIN',
      description: '',
    },
    {
      id: 2,
      name: 'USER',
      description: '',
    },
  ];

  const [open, setOpen] =
    useState(false);

  const [mode, setMode] =
    useState<'create' | 'edit'>(
      'create',
    );

  const [
    selectedUser,
    setSelectedUser,
  ] = useState<User | undefined>(
    undefined,
  );

  function handleCreate() {
    setMode('create');
    setSelectedUser(undefined);
    setOpen(true);
  }

  function handleEdit(user: User) {
    setMode('edit');
    setSelectedUser(user);
    setOpen(true);
  }

  function handleDelete(id: number) {
    deleteUser.mutate(id);
  }

  function handleClose() {
    setOpen(false);
    setSelectedUser(undefined);
    setMode('create');
  }

  async function handleSubmit(
    values:
      | CreateUserDto
      | UpdateUserDto,
  ) {
    try {
      if (mode === 'create') {
        await createUser.mutateAsync(
          values as CreateUserDto,
        );
      } else if (selectedUser) {
        await updateUser.mutateAsync({
          id: selectedUser.id,
          data:
            values as UpdateUserDto,
        });
      }

      handleClose();
    } catch (error) {
      console.error(error);

      message.error(
        'Unable to save user.',
      );
    }
  }

  return (
    <>
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <Title
            level={3}
            style={{
              margin: 0,
            }}
          >
            Người dùng Quản lý
          </Title>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Add User
          </Button>
        </div>

        <UserTable
          data={users.data ?? []}
          loading={
            users.isLoading ||
            users.isFetching
          }
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <UserModal
        open={open}
        mode={mode}
        user={selectedUser}
        roles={roles}
        loading={
          createUser.isPending ||
          updateUser.isPending
        }
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </>
  );
}