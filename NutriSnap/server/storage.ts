import { type User, type InsertUser, type FoodEntry, type InsertFoodEntry } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: InsertUser): Promise<User>;

  // Food entry operations  
  createFoodEntry(entry: InsertFoodEntry): Promise<FoodEntry>;
  getFoodEntriesByUserId(userId: number, since?: Date): Promise<FoodEntry[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private foodEntries: Map<number, FoodEntry>;
  private userId: number = 1;
  private entryId: number = 1;

  constructor() {
    this.users = new Map();
    this.foodEntries = new Map();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateUser: InsertUser): Promise<User> {
    const user = { ...updateUser, id };
    this.users.set(id, user);
    return user;
  }

  async createFoodEntry(insertEntry: InsertFoodEntry): Promise<FoodEntry> {
    const id = this.entryId++;
    const entry = {
      ...insertEntry,
      id,
      createdAt: new Date(),
    };
    this.foodEntries.set(id, entry);
    return entry;
  }

  async getFoodEntriesByUserId(userId: number, since?: Date): Promise<FoodEntry[]> {
    const entries = Array.from(this.foodEntries.values())
      .filter(entry => entry.userId === userId);
    
    if (since) {
      return entries.filter(entry => entry.createdAt >= since);
    }
    return entries;
  }
}

export const storage = new MemStorage();
