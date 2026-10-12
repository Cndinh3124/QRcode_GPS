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

import { useSự kiện } from '../hooks/useSự kiện';

import { useCurrentLocation } from '../../checkin/hooks/useCurrentLocation';

import type {
  CreateSự kiệnDto,
  Sự kiện,
  UpdateSự kiệnDto,
} from '../types/events.types';

interface Sự kiệnFormProps {
  mode: 'create' | 'edit';
  event?: Sự kiện;
  onSuccess: () => void;
}

interface Sự kiệnFormValues {
  title: string;
  description?: string;
  locationName: string;
  latitude: number;
  longitude: number;
  radius: number;
  startTime: Dayjs;
  endTime: Dayjs;
}

export default function Sự kiệnForm({
  mode,
  event,
  onSuccess,
}: Sự kiệnFormProps) {
  const [form] =
    Form.useForm<Sự kiệnFormValues>();

  const {
    createSự kiện,
    updateSự kiện,
  } = useSự kiện();

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
    values: Sự kiệnFormValues,
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

    const payload: CreateSự kiệnDto = {
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
        await createSự kiện.mutateAsync(
          payload,
        );
      } else if (event) {
        await updateSự kiện.mutateAsync({
          id: event.id,
          data: payload as UpdateSự kiệnDto,
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
    createSự kiện.isPending ||
    updateSự kiện.isPending;

  return (
    <Form<Sự kiệnFormValues>
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      disabled={submitting}
    >
      <Form.Item
        label="Title"
        name="title"
        rules={[
          {
            required: true,
            whitespace: true,
            message:
              'Vui lòng nhập tên sự kiện.',
          },
          {
            max: 255,
            message:
              'Tên sự kiện không được vượt quá 255 ký tự.',
          },
        ]}
      >
        <Input
          placeholder="Nhập tên sự kiện"
          maxLength={255}
          showCount
        />
      </Form.Item>

      <Form.Item
        label="Description"
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
        label="Location"
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
        label="Latitude"
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
          placeholder="Latitude"
        />
      </Form.Item>

      <Form.Item
        label="Longitude"
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
          placeholder="Longitude"
        />
      </Form.Item>

      <Form.Item
        label="Radius (m)"
        name="radius"
        rules={[
          {
            required: true,
            message:
              'Please enter check-in radius.',
          },
          {
            type: 'number',
            min: 1,
            max: 1000,
            message:
              'Radius must be between 1 and 1000 meters.',
          },
        ]}
      >
        <InputNumber
          style={{ width: '100%' }}
          min={1}
          max={1000}
          precision={0}
          placeholder="Enter radius"
        />
      </Form.Item>

      <Form.Item
        label="Start Time"
        name="startTime"
        rules={[
          {
            required: true,
            message:
              'Please select start time.',
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
        label="End Time"
        name="endTime"
        rules={[
          {
            required: true,
            message:
              'Please select end time.',
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
          ? 'Create Sự kiện'
          : 'Update Sự kiện'}
      </Button>
    </Form>
  );
}