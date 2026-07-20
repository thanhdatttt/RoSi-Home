import { z } from "zod";

const expoPushTokenSchema = z
  .string()
  .trim()
  .min(1, "pushToken is required.")
  .regex(
    /^(ExponentPushToken|ExpoPushToken)\[.+\]$/,
    "Must be a valid Expo push token, e.g. ExponentPushToken[xxxxxxxx].",
  );

export const registerDeviceTokenSchema = z
  .object({
    pushToken: expoPushTokenSchema,
    platform: z.enum(["ios", "android"]),
  })
  .strict();

export const unregisterDeviceTokenSchema = z
  .object({
    pushToken: z.string().trim().min(1, "pushToken is required."),
  })
  .strict();

export type RegisterDeviceTokenInput = z.infer<typeof registerDeviceTokenSchema>;
export type UnregisterDeviceTokenInput = z.infer<typeof unregisterDeviceTokenSchema>;
