import {brotliDecompress} from "zlib";
import {connectToDB} from "../../../../lib/db";
import {redis} from "../../../../lib/redis";
import {availableOptions, tbot as bot} from "../../../../lib/telegram";
import {
  parseProductInfo,
  randomizeMessage,
  stringSanitizer,
} from "../../../../lib/util";

//async function setClientState(clientId: string, clientState: ClientState) {
//  return await redis.set(`clientState:${clientId}`, clientState);
//}
//async function getClientState(clientId: string) {
//  return await redis.get(`clientState:${clientId}`);
//}

const handler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(404).send("Not found");
  }
  const {
    message: {
      from: {is_bot},
      text,
      chat: {id},
    },
  } = req.body;

  if (is_bot) {
    return res.status(200).send("ok");
  }

  const db = await connectToDB();

  if (text === "/start") {
    bot.setClientState(id, "None");
    bot.sendButtons(
      id,
      randomizeMessage([
        "Hi, how may I help?",
        "Do you need any help?",
        "Aww, I was about to take a nap! What's your request?",
      ]),
      availableOptions.filter((text) => !text.startsWith("/"))
    );
    return res.status(200).send("ok");
  }

  if (text === "/subscribe") {
    const isExists = await db.collection("subscriptions").findOne({chatId: id});
    if (isExists) {
      await bot.sendMessage(
        id,
        "You've already subscribed.\n/unsubscribe to unsubscribe."
      );
    } else {
      try {
        const {acknowledged} = await db
          .collection("subscriptions")
          .insertOne({chatId: id, createdAt: Date.now()});
        if (acknowledged) {
          bot.addSubscriber(id);
          await bot.sendMessage(
            id,
            "Successfully subscribed!\nYou will start receiving latest updates!"
          );
        } else {
          await bot.sendMessage(
            id,
            "Something went wrong. Please try again later."
          );
        }
      } catch (error) {
        console.log({error});
        await bot.sendMessage(
          id,
          "Something went wrong. Please try again later."
        );
      }
    }
    return res.status(200).send("ok");
  }

  if (text === "/unsubscribe") {
    const isExists = await db.collection("subscriptions").findOne({chatId: id});

    if (isExists) {
      try {
        const {acknowledged} = await db
          .collection("subscriptions")
          .deleteOne({chatId: id});
        if (acknowledged) {
          bot.removeSubscriber(id);
          await bot.sendMessage(id, "You have unsubscribed.");
        } else {
          await bot.sendMessage(
            id,
            "Something went wrong. Please try again later."
          );
        }
      } catch (error) {
        console.log({error});
        await bot.sendMessage(
          id,
          "Something went wrong. Please try again later."
        );
      }
    } else {
      await bot.sendMessage(
        id,
        "You are not subscribed.\n/subscribe to subscribe."
      );
    }
    return res.status(200).send("ok");
  }

  if (availableOptions.includes(text)) {
    switch (text) {
      case "/search":
      case "Search Product":
        {
          bot.setClientState(id, "Search");
          await bot.sendMessage(
            id,
            randomizeMessage([
              "What are you looking for?",
              "Send me something to search for.",
              "Tell me about it.",
            ])
          );
        }

        break;
      case "/promotion":
      case "Promotion":
        {
          const products = await db
            .collection("products")
            .find({status: "promotion"})
            .toArray();

          if (products.length) {
            // Set cache
            products.map((prod) =>
              bot.setProductCache(stringSanitizer(prod.name), prod)
            );
            await bot.sendButtons(
              id,
              `${products.length} Promotion(s) found.`,
              products.map((prod) => stringSanitizer(prod.name))
            );
            bot.setClientState(id, "Product");
          } else {
            await bot.sendMessage(id, `No Promotion(s) found at the moment.`);
          }
        }

        break;

      case "/announcement":
      case "Announcement":
        {
          const banners = await db
            .collection("banners")
            .find({status: {$exists: false}})
            .toArray();
          //const promises = banners.map((b) =>
          //  bot.sendImage(id, b.images_url[0])
          //);
          //await Promise.all(promises);
          await bot.sendGroupImages(
            id,
            banners.map((b) => b.images_url[0])
          );
          bot.setClientState(id, "None");
        }
        break;

      default:
        break;
    }

    return res.status(200).send("ok");
  }

  const clientState = bot.getClientState(id);
  if (!clientState) {
    return res.status(200).send("ok");
  }
  switch (clientState) {
    case "Search":
      {
        const products = await db
          .collection("products")
          .find({$text: {$search: text}})
          .toArray();

        if (products.length) {
          // Set cache
          products.map((prod) =>
            bot.setProductCache(stringSanitizer(prod.name), prod)
          );
          await bot.sendButtons(
            id,
            `Found <b>${products.length}</b> result(s) for:\n${text}`,
            products.map((prod) => stringSanitizer(prod.name))
          );
          bot.setClientState(id, "Product");
        } else {
          await bot.sendMessage(
            id,
            `No product found for:\n${text}\nPlease try another word.`
          );
        }
      }
      break;
    case "Product": {
      const product = bot.getProductFromCache(text);
      await bot.sendMessage(id, parseProductInfo(product), {
        disable_web_page_preview: false,
      });
      bot.setClientState(id, "None");
      break;
    }

    default:
      {
        await bot.sendMessage(
          id,
          randomizeMessage([
            "Seems like it's your first time here. Try /start to play with me.",
            "Hi, please use /start to chat with me.",
          ])
        );
        bot.setClientState(id, "None");
      }
      break;
  }

  return res.status(200).send("ok");
};

export default handler;
