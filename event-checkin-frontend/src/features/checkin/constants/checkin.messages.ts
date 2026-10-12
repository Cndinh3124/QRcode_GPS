export const CHECKIN_MESSAGES = {
  SUCCESS: 'Điểm danh thành công.',

  FAILED: 'Điểm danh không thành công.',

  INVALID_QR: 'Mã QR không hợp lệ.',

  INVALID_QR_DESCRIPTION:
    'Sự kiện không tồn tại hoặc mã QR không hợp lệ.',

  MISSING_QR: 'Thiếu mã QR.',

  GPS_REQUIRED:
    'Cần cấp quyền vị trí để xác minh điểm danh.',

  GEOLOCATION_NOT_SUPPORTED:
    'Trình duyệt không hỗ trợ định vị.',

  LOCATION_DENIED:
    'Quyền truy cập vị trí đã bị từ chối.',

  LOCATION_UNAVAILABLE:
    'Không thể lấy thông tin vị trí.',

  LOCATION_TIMEOUT:
    'Yêu cầu lấy vị trí đã hết thời gian chờ.',

  LOCATION_UNKNOWN:
    'Không thể xác định vị trí hiện tại.',
} as const;