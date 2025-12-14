import request from "supertest";
import express from "express";
import { createServer } from "http";
import { registerRoutes } from "../server/routes";
import "dotenv/config";
import { connectDB } from "../server/db";

jest.setTimeout(20000);
const uniqueUsername = `testuser_${Date.now()}`;

describe("API Integration Tests", () => {
  let app: express.Express;
  let token: string;
  let sweetId: string;

  beforeAll(async () => {
  await connectDB(); // ✅ THIS WAS MISSING

  app = express();
  app.use(express.json());

  const server = createServer(app);
  await registerRoutes(server, app);
});


  it("should register a user and return token", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
  username: uniqueUsername,
  password: "password123",
});


    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();

    token = res.body.token;
  });

  it("should create a sweet and purchase it", async () => {
    expect(token).toBeDefined();

    const sweetRes = await request(app)
      .post("/api/sweets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "API Sweet",
        category: "Candy",
        price: 10,
        quantity: 1,
      });

    expect(sweetRes.status).toBe(201);
   const createdSweetId = sweetRes.body.id || sweetRes.body._id;

expect(createdSweetId).toBeDefined();
sweetId = createdSweetId;


    const purchaseRes = await request(app)
      .post(`/api/sweets/${sweetId}/purchase`)
      .set("Authorization", `Bearer ${token}`);

    expect(purchaseRes.status).toBe(200);
    expect(purchaseRes.body.quantity).toBe(0);
  });
});
afterAll(async () => {
  const mongoose = (await import("mongoose")).default;
  await mongoose.connection.close();
});
