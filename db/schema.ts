import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

// Example table - replace with your own schema
export const users = pgTable("_user", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v7()),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Export type for TypeScript inference
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
