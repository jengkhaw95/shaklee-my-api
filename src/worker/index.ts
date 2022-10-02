// Entry point for worker
// Job: update data to database

import "dotenv/config";
import {connectToDB} from "../db";
import Shaklee from "./shaklee";

const logUpdatesToDb = async (document: any) => {
  const db = await connectToDB();

  return await db.collection("update_logs").insertOne(document);
};

export const workerUpdateProducts = async () => {
  const shaklee = new Shaklee({
    username: process.env.SHAKLEE_ID!,
    password: process.env.SHAKLEE_PW!,
  });

  const products = await shaklee.getProducts();

  const db = await connectToDB();
  const productCollection = await db.collection("products");

  // Handle products
  const productsToInsert = products.map((d) => ({...d, _id: d.product_no}));

  const outdatedProducts = await productCollection
    .find({
      _id: {$nin: productsToInsert.map((d) => d._id)},
      status: {$ne: "archived"},
    })
    .toArray();

  if (outdatedProducts.length) {
    console.log(`Found ${outdatedProducts.length} outdated product(s)`);
    await productCollection.updateMany(
      {_id: {$in: outdatedProducts.map((d) => d._id)}},
      {$set: {status: "archived", lastUpdateAt: Date.now()}}
    );
  }

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
};

export const workerUpdateBanner = async () => {
  const shaklee = new Shaklee({
    username: process.env.SHAKLEE_ID!,
    password: process.env.SHAKLEE_PW!,
  });

  const banners = await shaklee.getHeroBanners();

  const db = await connectToDB();
  const bannerCollection = await db.collection("banners");

  // Handle banners
  const bannersToInsert = banners.map((d) => ({...d, _id: d.name}));

  const outdatedBanners = await bannerCollection
    .find({
      _id: {$nin: bannersToInsert.map((d) => d._id)},
      status: {$ne: "archived"},
    })
    .toArray();

  if (outdatedBanners.length) {
    console.log(`Found ${outdatedBanners.length} outdated banner(s)`);
    await bannerCollection.updateMany(
      {_id: {$in: outdatedBanners.map((d) => d._id)}},
      {$set: {status: "archived", lastUpdateAt: Date.now()}}
    );
  }

  const bulkWriteActions = bannersToInsert.map((p) => ({
    replaceOne: {filter: {_id: p._id}, replacement: p, upsert: true},
  }));

  const res = await bannerCollection.bulkWrite(bulkWriteActions, {
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
};
