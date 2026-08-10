import { z } from "zod";

// Shared pagination contract for every list endpoint (architecture §2).
// Default page=1, pageSize=20, max pageSize=100.
export const paginationQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export type Pagination = z.infer<typeof paginationQuerySchema>;

export type Paginated<T> = {
  data: T[];
  meta: { page: number; pageSize: number; total: number };
};

export function paginate<T>(rows: T[], total: number, p: Pagination): Paginated<T> {
  return {
    data: rows,
    meta: { page: p.page, pageSize: p.pageSize, total },
  };
}
