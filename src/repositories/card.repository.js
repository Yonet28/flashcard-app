import { getDb } from "../db/mongo.js";
import { ObjectId } from "mongodb";

export async function getAllCards(userId) {
  const db = getDb();
  return await db.collection("flashcards").find({ userId: userId }).toArray();
}

export async function getCardById(id) {
  const db = getDb();
  return await db.collection("flashcards").findOne({ _id: new ObjectId(id) });
}

export async function createCard(cardData) {
  const db = getDb();
  const result = await db.collection("flashcards").insertOne(cardData);
  return result;
}

export async function deleteCard(id) {
    const db = getDb();
    return await db.collection("flashcards").deleteOne({ _id: new ObjectId(id) });
}

export async function updateCard(id, cardData) {
  const db = getDb();
  return await db.collection("flashcards").updateOne(
    { _id: new ObjectId(id) },
    { $set: cardData }
  );
}