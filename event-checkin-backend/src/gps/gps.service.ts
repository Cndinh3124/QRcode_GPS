import { Injectable } from '@nestjs/common';

@Injectable()
export class GpsService {
  /**
   * Tính khoảng cách giữa 2 tọa độ GPS bằng công thức Haversine
   * Kết quả trả về: mét (m)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const earthRadius = 6371000; // bán kính của trái đất mét
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
  }

  private toRadians(degree: number): number {
    return (degree * Math.PI) / 180;
  }
}
