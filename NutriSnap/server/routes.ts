import type { Express } from "express";
import { createServer } from "http";
import multer from "multer";
import { storage } from "./storage";
import { userSchema, foodEntrySchema } from "@shared/schema";
import { z } from "zod";

const upload = multer({ dest: "uploads/" });

export async function registerRoutes(app: Express) {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = userSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const userData = userSchema.parse(req.body);
      const user = await storage.updateUser(Number(req.params.id), userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // Food entry routes
  app.post("/api/food-entries", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Image required" });
      }

      const entryData = foodEntrySchema.parse({
        ...req.body,
        imageUrl: req.file.path,
        userId: Number(req.body.userId),
        quantity: Number(req.body.quantity),
        calories: Number(req.body.calories),
        protein: Number(req.body.protein),
      });

      const entry = await storage.createFoodEntry(entryData);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ error: "Invalid food entry data" });
    }
  });

  app.get("/api/users/:userId/food-entries", async (req, res) => {
    const since = req.query.since ? new Date(req.query.since as string) : undefined;
    const entries = await storage.getFoodEntriesByUserId(Number(req.params.userId), since);
    res.json(entries);
  });

  return createServer(app);
}
