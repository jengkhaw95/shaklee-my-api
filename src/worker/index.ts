// Entry for worker
// Job: to push new data to database

import "dotenv/config";
import {connectToDB} from "../db";
import Shaklee from "./shaklee";

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
      console.log(`Inserted ${insertResponse.insertedCount} product(s)`);
    }
  }
  process.exit();
})();
