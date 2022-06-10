// Entry for worker
// Job: to push new data to database

import "dotenv/config";
import {connectToDB} from "../db";
import Shaklee from "./shaklee";

const logUpdatesToDb = async (document: any) => {
  const db = await connectToDB();

  return await db.collection("update_logs").insertOne(document);
};

(async () => {
  const shaklee = new Shaklee({
    username: process.env.SHAKLEE_ID!,
    password: process.env.SHAKLEE_PW!,
  });

  const products = await shaklee.getProducts();
  const db = await connectToDB();
  const productCollection = await db.collection("products");

  const productsToInsert = products.map((d) => ({...d, _id: d.product_no}));

  const bulkWriteActions = productsToInsert.map((p) => ({
    replaceOne: {filter: {_id: p._id}, replacement: p, upsert: true},
  }));

  const res = await productCollection.bulkWrite(bulkWriteActions, {
    ordered: false,
  });

  if (res.result.ok) {
    const {nInserted, nMatched, nModified, nRemoved, nUpserted} = res.result;

    await logUpdatesToDb({
      nInserted,
      nMatched,
      nModified,
      nRemoved,
      nUpserted,
      ts: Date.now(),
    });
  }

  // Session error

  //const session = mongoClient.startSession();

  //await session.withTransaction(async () => {
  //  await productCollection.deleteMany({_id: {$in: productIdsToInsert}});
  //  await productCollection.insertMany(productsToInsert);
  //});
  //await session.endSession();

  //if (productsToInsert.length > 0) {
  //  const insertResponse = await productCollection.insertMany(productsToInsert);
  //  if (insertResponse.acknowledged) {
  //    await logUpdatesToDb(productsToInsert);
  //    console.log(`Inserted ${insertResponse.insertedCount} product(s)`);
  //  }
  //}
  process.exit();
})();
