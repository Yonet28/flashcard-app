import { getDb } from "../db/mongo.js";

export async function createUser(userData) {
  const db = getDb();
  const result = await db.collection("users").insertOne(userData);
  return result;
}

export async function findUserByUsername(username) {
  const db = getDb();
  return await db.collection("users").findOne({ username: username });
}