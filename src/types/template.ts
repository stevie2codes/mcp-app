import { z } from "zod";

export const TemplateHeaderSchema = z.object({
  agencyName: z.string(),
  logoUrl: z.string().optional(),
  subtitle: z.string().optional(),
  showDate: z.boolean().optional().default(true),
  showReportPeriod: z.boolean().optional().default(false),
});

export const TemplateStyleSchema = z.object({
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
});

export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  header: TemplateHeaderSchema,
  style: TemplateStyleSchema.optional(),
});

export type Template = z.infer<typeof TemplateSchema>;
export type TemplateHeader = z.infer<typeof TemplateHeaderSchema>;
export type TemplateStyle = z.infer<typeof TemplateStyleSchema>;
