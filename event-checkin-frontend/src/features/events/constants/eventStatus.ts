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
  [EventStatus.DRAFT]: 'Draft',
  [EventStatus.PUBLISHED]: 'Published',
  [EventStatus.CHECKING_IN]: 'Checking In',
  [EventStatus.FINISHED]: 'Finished',
  [EventStatus.CANCELLED]: 'Cancelled',
};