import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  dailyCalorieTarget: integer("daily_calorie_target").notNull(),
  dailyProteinTarget: integer("daily_protein_target").notNull(),
});

export const foodEntries = pgTable("food_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  imageUrl: text("image_url").notNull(),
  foodName: text("food_name").notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(),
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userSchema = createInsertSchema(users).pick({
  age: true,
  gender: true,
  dailyCalorieTarget: true,
  dailyProteinTarget: true,
});

export const foodEntrySchema = createInsertSchema(foodEntries).pick({
  userId: true,
  imageUrl: true,
  foodName: true,
  quantity: true,
  unit: true,
  calories: true,
  protein: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof userSchema>;
export type FoodEntry = typeof foodEntries.$inferSelect;
export type InsertFoodEntry = z.infer<typeof foodEntrySchema>;
