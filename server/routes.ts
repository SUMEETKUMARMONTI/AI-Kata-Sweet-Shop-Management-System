import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { authenticate, requireAdmin, generateToken, type AuthRequest } from "./middleware/auth";
import { insertUserSchema, loginSchema, insertSweetSchema, searchSweetsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }

      const { username, password, role } = parsed.data;

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        role: role || "user",
      });

      const { password: _, ...userWithoutPassword } = user;
      const token = generateToken(userWithoutPassword);

      res.status(201).json({ token, user: userWithoutPassword });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }

      const { username, password } = parsed.data;

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const { password: _, ...userWithoutPassword } = user;
      const token = generateToken(userWithoutPassword);

      res.json({ token, user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/sweets", authenticate, async (req: AuthRequest, res) => {
    try {
      const parsed = insertSweetSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }

      const sweet = await storage.createSweet(parsed.data);
      res.status(201).json(sweet);
    } catch (error) {
      console.error("Create sweet error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/sweets", authenticate, async (req: AuthRequest, res) => {
    try {
      const sweets = await storage.getAllSweets();
      res.json(sweets);
    } catch (error) {
      console.error("Get sweets error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/sweets/search", authenticate, async (req: AuthRequest, res) => {
    try {
      const queryParams = {
        name: req.query.name as string | undefined,
        category: req.query.category as string | undefined,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      };

      const parsed = searchSweetsSchema.safeParse(queryParams);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid search parameters",
          errors: parsed.error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }

      const sweets = await storage.searchSweets(parsed.data);
      res.json(sweets);
    } catch (error) {
      console.error("Search sweets error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/sweets/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      const existing = await storage.getSweet(id);
      if (!existing) {
        return res.status(404).json({ message: "Sweet not found" });
      }

      const parsed = insertSweetSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }

      const updated = await storage.updateSweet(id, parsed.data);
      res.json(updated);
    } catch (error) {
      console.error("Update sweet error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/sweets/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      const existing = await storage.getSweet(id);
      if (!existing) {
        return res.status(404).json({ message: "Sweet not found" });
      }

      await storage.deleteSweet(id);
      res.json({ message: "Sweet deleted successfully" });
    } catch (error) {
      console.error("Delete sweet error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/sweets/:id/purchase", authenticate, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      const existing = await storage.getSweet(id);
      if (!existing) {
        return res.status(404).json({ message: "Sweet not found" });
      }

      if (existing.quantity <= 0) {
        return res.status(400).json({ message: "Item is out of stock" });
      }

      const updated = await storage.purchaseSweet(id);
      res.json(updated);
    } catch (error) {
      console.error("Purchase error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/sweets/:id/restock", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      const amountSchema = z.object({
        amount: z.number().int().min(1, "Amount must be at least 1"),
      });

      const parsed = amountSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }

      const existing = await storage.getSweet(id);
      if (!existing) {
        return res.status(404).json({ message: "Sweet not found" });
      }

      const updated = await storage.restockSweet(id, parsed.data.amount);
      res.json(updated);
    } catch (error) {
      console.error("Restock error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
