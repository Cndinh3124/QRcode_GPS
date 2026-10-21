export const ATTENDANCE_STATUS = {
  PRESENT: {
    color: 'green',
    label: 'Có mặt',
  },

  LATE: {
    color: 'orange',
    label: 'Đi muộn',
  },

  REJECTED: {
    color: 'red',
    label: 'Bị từ chối',
  },
} as const;