import { useEffect } from 'react';

import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Space,
  message,
} from 'antd';

import { useEvents } from '../hooks/useEvents';

import { useCurrentLocation } from '../../checkin/hooks/useCurrentLocation';

import type {
  CreateEventDto,
  Event,
  UpdateEventDto,
} from '../types/events.types';

interface EventFormProps {
  mode: 'create' | 'edit';
  event?: Event;
  onSuccess: () => void;
}

interface EventFormValues {
  title: string;
  description?: string;
  locationName: string;
  latitude: number;
  longitude: number;
  radius: number;
  startTime: Dayjs;
  endTime: Dayjs;
}

export default function EventForm({
  mode,
  event,
  onSuccess,
}: EventFormProps) {
  const [form] =
    Form.useForm<EventFormValues>();

  const {
    createEvent,
    updateEvent,
  } = useEvents();

  const {
    loading: loadingLocation,
    getCurrentLocation,
  } = useCurrentLocation();

  useEffect(() => {
    if (mode === 'edit' && event) {
      form.setFieldsValue({
        title: event.title,
        description: event.description,
        locationName: event.locationName,
        latitude: event.latitude,
        longitude: event.longitude,
        radius: event.radius,
        startTime: dayjs(event.startTime),
        endTime: dayjs(event.endTime),
      });

      return;
    }

    form.resetFields();
  }, [form, mode, event]);

  async function handleGetLocation() {
    try {
      const position =
        await getCurrentLocation();

      form.setFieldsValue({
        latitude: Number(
          position.coords.latitude.toFixed(6),
        ),
        longitude: Number(
          position.coords.longitude.toFixed(6),
        ),
      });

      message.success(
        'Đã lấy vị trí hiện tại.',
      );
    } catch {
      // Error đã được xử lý bởi
      // useCurrentLocation.
    }
  }

  async function handleFinish(
    values: EventFormValues,
  ) {
    if (
      values.endTime.isBefore(
        values.startTime,
      )
    ) {
      message.error(
        'Thời gian kết thúc phải sau thời gian bắt đầu.',
      );

      return;
    }

    const payload: CreateEventDto = {
      title: values.title.trim(),

      description:
        values.description?.trim() ||
        undefined,

      locationName:
        values.locationName.trim(),

      latitude: values.latitude,

      longitude: values.longitude,

      radius: values.radius,

      startTime:
        values.startTime.toISOString(),

      endTime:
        values.endTime.toISOString(),
    };

    try {
      if (mode === 'create') {
        await createEvent.mutateAsync(
          payload,
        );
      } else if (event) {
        await updateEvent.mutateAsync({
          id: event.id,
          data: payload as UpdateEventDto,
        });
      }

      form.resetFields();

      onSuccess();
    } catch {
      message.error(
        mode === 'create'
          ? 'Không thể tạo sự kiện.'
          : 'Không thể cập nhật sự kiện.',
      );
    }
  }

  const submitting =
    createEvent.isPending ||
    updateEvent.isPending;

  return (
    <Form<EventFormValues>
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      disabled={submitting}
    >
      <Form.Item
        label="Tên sự kiện"
        name="title"
        rules={[
          {
            required: true,
            whitespace: true,
            message:
              'Vui lòng nhập tên sự kiện.',
          },
          {
            max: 200,
            message:
              'Ten su kien khong duoc vuot qua 200 ky tu.',
          },
        ]}
      >
        <Input
          placeholder="Nhập tên sự kiện"
          maxLength={200}
          showCount
        />
      </Form.Item>

      <Form.Item
        label="Mô tả"
        name="description"
      >
        <Input.TextArea
          rows={3}
          placeholder="Nhập mô tả sự kiện"
          maxLength={1000}
          showCount
        />
      </Form.Item>

      <Form.Item
        label="Địa điểm"
        name="locationName"
        rules={[
          {
            required: true,
            whitespace: true,
            message:
              'Vui lòng nhập địa điểm.',
          },
          {
            max: 255,
            message:
              'Địa điểm không được vượt quá 255 ký tự.',
          },
        ]}
      >
        <Input
          placeholder="Nhập địa điểm tổ chức"
          maxLength={255}
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button
            onClick={handleGetLocation}
            loading={loadingLocation}
            disabled={submitting}
          >
            📍 Lấy vị trí hiện tại
          </Button>
        </Space>
      </Form.Item>

      <Form.Item
        label="Vĩ độ"
        name="latitude"
        rules={[
          {
            required: true,
            message:
              'Vui lòng lấy hoặc nhập vĩ độ.',
          },
        ]}
      >
        <InputNumber
          style={{ width: '100%' }}
          precision={6}
          min={-90}
          max={90}
          readOnly
          placeholder="Vĩ độ"
        />
      </Form.Item>

      <Form.Item
        label="Kinh độ"
        name="longitude"
        rules={[
          {
            required: true,
            message:
              'Vui lòng lấy hoặc nhập kinh độ.',
          },
        ]}
      >
        <InputNumber
          style={{ width: '100%' }}
          precision={6}
          min={-180}
          max={180}
          readOnly
          placeholder="Kinh độ"
        />
      </Form.Item>

      <Form.Item
        label="Bán kính điểm danh (m)"
        name="radius"
        rules={[
          {
            required: true,
            message:
              'Vui lòng nhập bán kính điểm danh.',
          },
          {
            type: 'number',
            min: 1,
            max: 100000,
            message:
              'Ban kinh diem danh phai tu 1 den 100000 met.',
          },
        ]}
      >
        <InputNumber
          style={{ width: '100%' }}
          min={1}
          max={100000}
          precision={0}
          placeholder="Nhập bán kính điểm danh (m)"
        />
      </Form.Item>

      <Form.Item
        label="Thời gian bắt đầu"
        name="startTime"
        rules={[
          {
            required: true,
            message:
              'Vui lòng chọn thời gian bắt đầu.',
          },
        ]}
      >
        <DatePicker
          showTime
          style={{ width: '100%' }}
          format="DD/MM/YYYY HH:mm"
        />
      </Form.Item>

      <Form.Item
        label="Thời gian kết thúc"
        name="endTime"
        rules={[
          {
            required: true,
            message:
              'Vui lòng chọn thời gian kết thúc.',
          },
        ]}
      >
        <DatePicker
          showTime
          style={{ width: '100%' }}
          format="DD/MM/YYYY HH:mm"
        />
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        block
        loading={submitting}
      >
        {mode === 'create'
          ? 'Tạo sự kiện'
          : 'Cập nhật sự kiện'}
      </Button>
    </Form>
  );
}