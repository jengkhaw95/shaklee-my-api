// Entry point for worker
// Job: update data to database

import "dotenv/config";
import {AnyBulkWriteOperation} from "mongodb";
import {connectToDB} from "../db";
import {parseProductInfo} from "../router/telegram";
import {tbot} from "../telegram";
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

  //console.log(
  //  "VITA C 2",
  //  products.find((p) => p.product_no === "00P729")
  //);

  const db = await connectToDB();
  const productCollection = await db.collection("products");

  // Handle products
  const productsToInsert = products.map((d) => ({...d, _id: d.product_no}));

  const allProductsFromDatabase = await productCollection.find().toArray();

  const toAdd = productsToInsert.filter((p) => {
    const isPass = !allProductsFromDatabase.some((pr) => pr._id === p._id);
    //console.log(p.name, p._id, isPass);
    return isPass;
  });

  const {newProducts, changedProducts} = productsToInsert.reduce<{
    newProducts: any[];
    changedProducts: any[];
    remainingProducts: any[];
  }>(
    (a, b) => {
      const existingProduct = allProductsFromDatabase.find(
        (pr) => pr._id === b._id
      );
      if (!existingProduct) {
        a.newProducts.push(b);
      } else if (
        existingProduct.status !== b.status ||
        JSON.stringify(existingProduct.dn) !== JSON.stringify(b.dn)
      ) {
        a.changedProducts.push(b);
      } else {
        a.remainingProducts.push(b);
      }
      return a;
    },
    {newProducts: [], changedProducts: [], remainingProducts: []}
  );

  const {oosProducts, promotionProducts} = changedProducts.reduce<{
    oosProducts: any[];
    promotionProducts: any[];
  }>(
    (a, b) => {
      if (b.status === "promotion") {
        a.promotionProducts.push(b);
      }

      if (b.status === "oos") {
        a.promotionProducts.push(b);
      }
      return a;
    },
    {
      oosProducts: [],
      promotionProducts: [],
    }
  );

  const toArchive_ = allProductsFromDatabase.filter(
    (p) =>
      !productsToInsert.some(
        (r) => r.status !== "archived" && r._id == p._id
      ) && p.status !== "archived"
  );

  const updateMany_ = {
    filter: {_id: {$in: toArchive_.map((d) => d._id)}},
    update: {$set: {status: "archived", lastUpdateAt: Date.now()}},
  };

  const replaceMany_ = [...oosProducts, ...promotionProducts].map((up) => ({
    replaceOne: {
      filter: {_id: up._id},
      replacement: up,
    },
  }));

  const insertMany_ = newProducts.map((ad) => ({
    insertOne: {
      document: ad,
    },
  }));

  let bulkWriteOps: any[] = [];

  if (toArchive_.length) {
    console.log("Archive", toArchive_.length);
    bulkWriteOps.push({updateMany: updateMany_});
  }
  if (replaceMany_.length) {
    console.log("Replace", replaceMany_.length);
    bulkWriteOps = bulkWriteOps.concat(replaceMany_);
  }
  if (newProducts.length) {
    console.log("New", newProducts.length);
    bulkWriteOps = bulkWriteOps.concat(insertMany_);
  }

  if (!bulkWriteOps.length) {
    console.log("No changes in products found!");
    return;
  }

  const res = await productCollection.bulkWrite(bulkWriteOps, {
    ordered: false,
  });
  console.log(res);

  //const {toArchive, toUpdate} = allProductsFromDatabase.reduce<{
  //  toArchive: any[];
  //  toUpdate: any[];
  //}>(
  //  (a, b) => {
  //    let isLogging = (b._id as unknown as string) === "00P729";
  //    // The true item is in database already
  //    const matchedItem = productsToInsert.find((bn) => bn._id === b._id);
  //    //if (isLogging) {
  //    //  console.log({matchedItem});
  //    //}
  //    if (!matchedItem) {
  //      if (b.status !== "archived") {
  //        a.toArchive.push(b);
  //      }
  //      return a;
  //    }
  //    //if (isLogging) {
  //    //  console.log(b.status, matchedItem.status);
  //    //  console.log(b);
  //    //  console.log(matchedItem);
  //    //}
  //    if (matchedItem.status !== b.status) {
  //      a.toUpdate.push(matchedItem);
  //      return a;
  //    }
  //    return a;
  //    let isToBeModify = false;

  //    if (isLogging) {
  //      console.log(Object.keys(b));
  //    }
  //    for (let k of Object.keys(b)) {
  //      const v1 = b[k];
  //      const v2 = matchedItem[k];
  //      if (isLogging) {
  //        console.log({v1, v2});
  //      }
  //      if (typeof v1 == "object") {
  //        if (JSON.stringify(v1) !== JSON.stringify(v2)) {
  //          isToBeModify = true;
  //          break;
  //        }
  //      } else {
  //        if (v1 !== v2) {
  //          isToBeModify = true;
  //          break;
  //        }
  //      }
  //    }

  //    if (isLogging) {
  //      console.log({isToBeModify});
  //    }
  //    if (isToBeModify) {
  //      a.toUpdate.push(b);
  //    }
  //    return a;
  //  },
  //  {toArchive: [], toUpdate: []}
  //);

  //const updateMany = {
  //  filter: {_id: {$nin: toArchive.map((d) => d._id)}},
  //  update: {$set: {status: "archived", lastUpdateAt: Date.now()}},
  //};

  //const replaceMany = toUpdate.map((up) => ({
  //  replaceOne: {
  //    filter: {_id: up._id},
  //    replacement: up,
  //  },
  //}));

  //const insertMany = toAdd.map((ad) => ({
  //  insertOne: {
  //    document: ad,
  //  },
  //}));

  //const bulkWriteOperations: any[] = [...replaceMany, ...insertMany];
  //if (toArchive.length) {
  //  bulkWriteOperations.push({updateMany});
  //}

  //if (!bulkWriteOperations.length) {
  //  console.log("No changes in products found!");
  //  return;
  //}
  //const res = await productCollection.bulkWrite(bulkWriteOperations, {
  //  ordered: false,
  //});
  //console.log(res);

  //const outdatedProducts = await productCollection
  //  .find({
  //    _id: {$nin: productsToInsert.map((d) => d._id)},
  //    status: {$ne: "archived"},
  //  })
  //  .toArray();

  //if (outdatedProducts.length) {
  //  console.log(`Found ${outdatedProducts.length} outdated product(s)`);
  //  await productCollection.updateMany(
  //    {_id: {$in: outdatedProducts.map((d) => d._id)}},
  //    {$set: {status: "archived", lastUpdateAt: Date.now()}}
  //  );
  //}

  //const bulkWriteActions = productsToInsert.map((p) => ({
  //  replaceOne: {filter: {_id: p._id}, replacement: p, upsert: true},
  //}));

  //const res = await productCollection.bulkWrite(bulkWriteActions, {
  //  ordered: false,
  //});

  if (res.result.ok) {
    const {nInserted, nMatched, nModified, nRemoved, nUpserted} = res.result;

    await logUpdatesToDb({
      ...res.result,
      ts: Date.now(),
    });

    const subscriptionIds = await db
      .collection("subscriptions")
      .find({})
      .toArray();

    if (newProducts.length) {
      const promises = newProducts.map((product) =>
        tbot.broadcast(
          subscriptionIds.map((d) => d.chatId),
          parseProductInfo(product, "new")
        )
      );
      await Promise.all(promises);
    }

    if (oosProducts.length) {
      const promises = oosProducts.map((product) =>
        tbot.broadcast(
          subscriptionIds.map((d) => d.chatId),
          parseProductInfo(product, "oos")
        )
      );
      await Promise.all(promises);
    }

    if (promotionProducts.length) {
      const promises = promotionProducts.map((product) =>
        tbot.broadcast(
          subscriptionIds.map((d) => d.chatId),
          parseProductInfo(product, "promotion")
        )
      );
      await Promise.all(promises);
    }

    if (toArchive_.length) {
      const promises = toArchive_.map((product) =>
        tbot.broadcast(
          subscriptionIds.map((d) => d.chatId),
          parseProductInfo(product, "archived")
        )
      );
      await Promise.all(promises);
    }

    await tbot.broadcast(
      subscriptionIds.map((d) => d.chatId),
      `<code>${JSON.stringify(res.result)}</code>`
    );
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
      ...res.result,
      ts: Date.now(),
    });

    //const subscriptionIds = await db
    //  .collection("subscriptions")
    //  .find({})
    //  .toArray();

    //await tbot.broadcast(
    //  subscriptionIds.map((d) => d.chatId),
    //  `<code>${JSON.stringify(res.result)}</code>`
    //);
  }
};
