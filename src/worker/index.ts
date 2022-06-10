// Entry for worker
// Job: to push new data to database

import "dotenv/config";
import {connectToDB} from "../db";
import Shaklee from "./shaklee";

const logUpdatesToDb = async (document: any[]) => {
  const formattedDoc = document.map((d) => ({
    ...d,
    ts: Date.now(),
    product_no: d.product_no,
  }));

  const db = await connectToDB();
  return await db.collection("update_logs").insertMany(formattedDoc);
};

(async () => {
  const shaklee = new Shaklee({
    username: process.env.SHAKLEE_ID!,
    password: process.env.SHAKLEE_PW!,
  });

  const products = await shaklee.getProducts();
  const productCollection = await (await connectToDB()).collection("products");
  const productsFromDB = await productCollection.find().toArray();
  const productIdsFromDB = productsFromDB.map((p) => p._id);
  const productsToInsert = products
    .filter((p) => p.product_no && !productIdsFromDB.includes(p.product_no))
    .map((d) => ({...d, _id: d.product_no}));

  if (productsToInsert.length > 0) {
    const insertResponse = await productCollection.insertMany(productsToInsert);
    if (insertResponse.acknowledged) {
      await logUpdatesToDb(productsToInsert);
      console.log(`Inserted ${insertResponse.insertedCount} product(s)`);
    }
  }
  process.exit();
})();
