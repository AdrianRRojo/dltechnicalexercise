import { MongoClient } from "mongodb";


const uri = process.env.REACT_APP_DB_URI;
const client = new MongoClient(uri);

export async function connectDB() {
  await client.connect();
  return client.db("bridgeline");
}
