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
        'Current location loaded successfully.',
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
        'End time must be after start time.',
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
          ? 'Unable to create event.'
          : 'Unable to update event.',
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
        label="Title"
        name="title"
        rules={[
          {
            required: true,
            whitespace: true,
            message:
              'Please enter title.',
          },
          {
            max: 255,
            message:
              'Title cannot exceed 255 characters.',
          },
        ]}
      >
        <Input
          placeholder="Enter event title"
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
          placeholder="Enter event description"
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
              'Please enter location.',
          },
          {
            max: 255,
            message:
              'Location cannot exceed 255 characters.',
          },
        ]}
      >
        <Input
          placeholder="Enter event location"
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
            📍 Get Current Location
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
              'Please get or enter latitude.',
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
              'Please get or enter longitude.',
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
          ? 'Create Event'
          : 'Update Event'}
      </Button>
    </Form>
  );
}