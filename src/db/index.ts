import * as mongodb from "mongodb";

let db: mongodb.Db;

if (process.env.MONGODB_URI === undefined) {
  throw Error("MONGODB_URI is missing");
}
if (process.env.MONGODB_NAME === undefined) {
  throw Error("MONGODB_NAME is missing");
}

export const mongoClient = new mongodb.MongoClient(process.env.MONGODB_URI);

export const connectToDB = async () => {
  if (!db) {
    console.log("Connected to db");
    await mongoClient.connect();
    db = mongoClient.db(process.env.MONGODB_NAME);
    await createInitialIndex(db);
    return db;
  }
  console.log("Reusing db connection");
  return db;
};

const createInitialIndex = async (db: mongodb.Db) => {
  db.collection("products").createIndex({
    tags: "text",
    name: "text",
    pcat: "text",
  });
};
