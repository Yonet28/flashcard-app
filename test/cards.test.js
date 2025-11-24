import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectToDb, client } from '../src/db/mongo.js'; 

const TEST_USER_ID = "user_test_123";
let createdCardId = "";

describe("Flashcards API", () => {

  beforeAll(async () => {
    await connectToDb();
  });

  afterAll(async () => {
    await client.close();
  });

  it("POST /api/cards - Doit créer une nouvelle carte", async () => {
    const newCard = {
      question: "Test Question Vitest",
      answer: "Test Réponse Vitest",
      userId: TEST_USER_ID
    };

    const res = await request(app).post("/api/cards").send(newCard);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    createdCardId = res.body.id;
  });

  it("GET /api/cards - Doit récupérer les cartes de l'utilisateur", async () => {
    const res = await request(app).get(`/api/cards?userId=${TEST_USER_ID}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const found = res.body.find(card => card._id === createdCardId);
    expect(found).toBeTruthy();
  });

  it("PUT /api/cards/:id - Doit modifier la carte", async () => {
    const updatedData = {
      question: "Question Modifiée",
      answer: "Réponse Modifiée"
    };

    const res = await request(app)
      .put(`/api/cards/${createdCardId}`)
      .send(updatedData);

    expect(res.status).toBe(200);
  });

  it("DELETE /api/cards/:id - Doit supprimer la carte", async () => {
    const res = await request(app).delete(`/api/cards/${createdCardId}`);
    expect(res.status).toBe(200);
  });

});