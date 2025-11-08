import { z } from 'zod';

export const settingEntitySchema = z.object({
  key: z.string(),
  value: z.unknown().nullable(),
  updatedAt: z.string(),
});

export const settingUpsertSchema = z.object({
  value: z.unknown(),
});

export type SettingEntity = z.infer<typeof settingEntitySchema>;
