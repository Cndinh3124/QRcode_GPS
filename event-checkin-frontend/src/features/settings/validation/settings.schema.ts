import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(
        6,
        'Current password must be at least 6 characters.',
      )
      .max(
        100,
        'Current password cannot exceed 100 characters.',
      ),

    newPassword: z
      .string()
      .min(
        6,
        'New password must be at least 6 characters.',
      )
      .max(
        100,
        'New password cannot exceed 100 characters.',
      ),

    confirmPassword: z
      .string()
      .min(
        6,
        'Please confirm your new password.',
      ),
  })
  .refine(
    (data) =>
      data.newPassword ===
      data.confirmPassword,
    {
      message:
        'The two passwords do not match.',
      path: ['confirmPassword'],
    },
  );