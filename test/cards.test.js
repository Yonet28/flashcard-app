import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectToDb } from '../src/db/mongo.js';

const TEST_USER_ID = "user_test_123";
let createdCardId = "";

describe("Flashcards API", () => {

  beforeAll(async () => {
    await connectToDb();
  });

  afterAll(async () => {
     
    await mongoose.connection.close();
  });

  it("POST /api/cards - Doit créer une nouvelle carte", async () => {
    const newCard = {
      question: "Test Question Vitest",
      answer: "Test Réponse Vitest",
      userId: TEST_USER_ID
    };

    const res = await request(app)
      .post("/api/cards")
      .send(newCard);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    
    createdCardId = res.body.id;
  });

  it("GET /api/cards - Doit récupérer les cartes de l'utilisateur", async () => {
    const res = await request(app)
      .get(`/api/cards?userId=${TEST_USER_ID}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    
    const found = res.body.find(card => card._id.toString() === createdCardId.toString());
    expect(found).toBeTruthy();
    expect(found.question).toBe("Test Question Vitest");
  });

  it("PUT /api/cards/:id", async () => {
    const updatedData = {
      question: "Question Modifiée",
      answer: "Réponse Modifiée"
    };

    const res = await request(app)
      .put(`/api/cards/${createdCardId}`)
      .send(updatedData);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Carte mise à jour");
  });

  it("DELETE /api/cards/:id", async () => {
    const res = await request(app)
      .delete(`/api/cards/${createdCardId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Carte supprimée");
  });

});