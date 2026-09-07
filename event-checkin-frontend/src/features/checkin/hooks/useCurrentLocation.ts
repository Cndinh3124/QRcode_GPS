import { useState } from 'react';
import { message } from 'antd';

import { CHECKIN_MESSAGES } from '../constants/checkin.messages';

export function useCurrentLocation() {
  const [loading, setLoading] =
    useState(false);

  async function getCurrentLocation(): Promise<GeolocationPosition> {
    if (!navigator.geolocation) {
      message.error(
        CHECKIN_MESSAGES.GEOLOCATION_NOT_SUPPORTED,
      );

      throw new Error(
        CHECKIN_MESSAGES.GEOLOCATION_NOT_SUPPORTED,
      );
    }

    setLoading(true);

    try {
      return await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            },
          );
        },
      );
    } catch (error) {
      const geoError =
        error as GeolocationPositionError;

      switch (geoError.code) {
        case GeolocationPositionError.PERMISSION_DENIED:
          message.error(
            CHECKIN_MESSAGES.LOCATION_DENIED,
          );
          break;

        case GeolocationPositionError.POSITION_UNAVAILABLE:
          message.error(
            CHECKIN_MESSAGES.LOCATION_UNAVAILABLE,
          );
          break;

        case GeolocationPositionError.TIMEOUT:
          message.error(
            CHECKIN_MESSAGES.LOCATION_TIMEOUT,
          );
          break;

        default:
          message.error(
            CHECKIN_MESSAGES.LOCATION_UNKNOWN,
          );
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    getCurrentLocation,
  };
}