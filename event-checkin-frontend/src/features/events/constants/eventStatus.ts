export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CHECKING_IN = 'CHECKING_IN',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}

export const STATUS_COLOR: Record<
  EventStatus,
  string
> = {
  [EventStatus.DRAFT]: 'default',
  [EventStatus.PUBLISHED]: 'blue',
  [EventStatus.CHECKING_IN]: 'green',
  [EventStatus.FINISHED]: 'purple',
  [EventStatus.CANCELLED]: 'red',
};

export const STATUS_LABEL: Record<
  EventStatus,
  string
> = {
  [EventStatus.DRAFT]: 'Bản nháp',
  [EventStatus.PUBLISHED]: 'Đã công bố',
  [EventStatus.CHECKING_IN]: 'Đang điểm danh',
  [EventStatus.FINISHED]: 'Đã kết thúc',
  [EventStatus.CANCELLED]: 'Đã hủy',
};