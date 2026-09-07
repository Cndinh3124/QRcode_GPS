import { Modal } from 'antd';

import EventForm from './EventForm';

import type { Event } from '../types/events.types';

interface EventModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  event?: Event;
  onClose: () => void;
}

export default function EventModal({
  open,
  mode,
  event,
  onClose,
}: EventModalProps) {
  return (
    <Modal
      open={open}
      title={
        mode === 'create'
          ? 'Create Event'
          : 'Update Event'
      }
      footer={null}
      onCancel={onClose}
      destroyOnHidden
      centered
      width={700}
      maskClosable={false}
    >
      <EventForm
        mode={mode}
        event={event}
        onSuccess={onClose}
      />
    </Modal>
  );
}