import { UserModel } from "./models/User.model";
import { SweetModel } from "./models/Sweet.model";
import {
  type User,
  type InsertUser,
  type Sweet,
  type InsertSweet,
  type UpdateSweet,
  type SearchSweetsInput,
} from "@shared/schema";

export class MongoStorage {
  async getUser(id: string): Promise<User | undefined> {
    return (await UserModel.findById(id).lean()) as User | undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return (await UserModel.findOne({ username }).lean()) as User | undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const created = await UserModel.create(user);
    return created.toObject() as User;
  }

  async getSweet(id: string): Promise<Sweet | undefined> {
    return (await SweetModel.findById(id).lean()) as Sweet | undefined;
  }

  async getAllSweets(): Promise<Sweet[]> {
    return (await SweetModel.find().lean()) as Sweet[];
  }

  async searchSweets(query: SearchSweetsInput): Promise<Sweet[]> {
    const filter: any = {};

    if (query.name) filter.name = { $regex: query.name, $options: "i" };
    if (query.category) filter.category = query.category;

    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = query.minPrice;
      if (query.maxPrice) filter.price.$lte = query.maxPrice;
    }

    return (await SweetModel.find(filter).lean()) as Sweet[];
  }

  async createSweet(sweet: InsertSweet): Promise<Sweet> {
    const created = await SweetModel.create(sweet);
    return created.toObject() as Sweet;
  }

  async updateSweet(id: string, sweet: UpdateSweet): Promise<Sweet | undefined> {
    return (await SweetModel.findByIdAndUpdate(id, sweet, {
      new: true,
    }).lean()) as Sweet | undefined;
  }

  async deleteSweet(id: string): Promise<boolean> {
    return !!(await SweetModel.findByIdAndDelete(id));
  }

  async purchaseSweet(id: string): Promise<Sweet | undefined> {
    return (await SweetModel.findOneAndUpdate(
      { _id: id, quantity: { $gt: 0 } },
      { $inc: { quantity: -1 } },
      { new: true }
    ).lean()) as Sweet | undefined;
  }

  async restockSweet(id: string, amount: number): Promise<Sweet | undefined> {
    return (await SweetModel.findByIdAndUpdate(
      id,
      { $inc: { quantity: amount } },
      { new: true }
    ).lean()) as Sweet | undefined;
  }
}

export const storage = new MongoStorage();
