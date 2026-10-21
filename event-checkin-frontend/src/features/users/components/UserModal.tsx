import { Modal } from 'antd';

import UserForm from './UserForm';

import type {
  CreateUserDto,
  UpdateUserDto,
  User,
  Role,
} from '../types/user.types';

interface UserModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  user?: User;
  roles: Role[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (
    values: CreateUserDto | UpdateUserDto,
  ) => Promise<void>;
}

export default function UserModal({
  open,
  mode,
  user,
  roles,
  loading,
  onClose,
  onSubmit,
}: UserModalProps) {
  return (
    <Modal
      open={open}
      title={
        mode === 'create'
          ? 'Tạo người dùng'
          : 'Chỉnh sửa người dùng'
      }
      footer={null}
      onCancel={onClose}
      destroyOnHidden
      centered
      maskClosable={false}
    >
      <UserForm
        mode={mode}
        user={user}
        roles={roles}
        loading={loading}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}