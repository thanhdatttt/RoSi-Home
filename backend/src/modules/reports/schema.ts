import { z } from "zod";

export const generateReportSchema = z.object({
  periodType: z.enum(["month", "custom"]),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Invalid month format. Use YYYY-MM").optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD").optional(),
}).refine(data => {
  if (data.periodType === "month" && !data.month) return false;
  if (data.periodType === "custom" && (!data.startDate || !data.endDate)) return false;
  return true;
}, {
  message: "Month is required for 'month' periodType, and startDate/endDate for 'custom'",
  path: ["periodType"],
}).refine(data => {
  if (data.periodType === "custom" && data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: "startDate cannot be after endDate",
  path: ["startDate"],
});

export type GenerateReportInput = z.infer<typeof generateReportSchema>;
