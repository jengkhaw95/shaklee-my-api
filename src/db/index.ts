import * as mongodb from "mongodb";

let db: mongodb.Db;

export const connectToDB = async () => {
  if (process.env.MONGODB_URI === undefined) {
    throw Error("MONGODB_URI is missing");
  }
  if (process.env.MONGODB_NAME === undefined) {
    throw Error("MONGODB_NAME is missing");
  }
  if (!db) {
    console.log("Connected to db");
    const client = new mongodb.MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db(process.env.MONGODB_NAME);
    return db;
  }
  return db;
};
