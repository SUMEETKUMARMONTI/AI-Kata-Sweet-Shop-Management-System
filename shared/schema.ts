import { z } from "zod";

export const userRoles = ["user", "admin"] as const;
export type UserRole = (typeof userRoles)[number];

export const sweetCategories = [
  "Chocolate",
  "Candy",
  "Pastry",
  "Cookie",
  "Cake",
  "Ice Cream",
  "Traditional",
  "Other"
] as const;
export type SweetCategory = (typeof sweetCategories)[number];

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
}

export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(userRoles).default("user"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export interface Sweet {
  id: string;
  name: string;
  category: SweetCategory;
  price: number;
  quantity: number;
}

export const insertSweetSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  category: z.enum(sweetCategories),
  price: z.number().min(0.01, "Price must be greater than 0"),
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
});

export type InsertSweet = z.infer<typeof insertSweetSchema>;

export const updateSweetSchema = insertSweetSchema.partial();

export type UpdateSweet = z.infer<typeof updateSweetSchema>;

export const searchSweetsSchema = z.object({
  name: z.string().optional(),
  category: z.enum(sweetCategories).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
});

export type SearchSweetsInput = z.infer<typeof searchSweetsSchema>;

export interface AuthResponse {
  token: string;
  user: Omit<User, "password">;
}

export interface ApiError {
  message: string;
  errors?: { field: string; message: string }[];
}
