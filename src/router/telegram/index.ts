import e from "express";
import express from "express";
import {connectToDB} from "../../db";
import {TelegramBot} from "../../telegram";

const availableOptions = [
  "Search Product",
  "Promotion",
  "Announcement",
  "/search",
  "/promotion",
  "/announcement",
  "/subscribe",
  "/unsubscribe",
];

const parseProductStatus = (productStatus: string) => {
  switch (productStatus) {
    case "available":
      return "\n<b>Available now!</b>\n";
    case "oos":
      return "\n<b>Currently Out-of-stock!</b>\n";
    case "promotion":
      return "\n<b>This is a Promotion!</b>\n";
    case "archived":
      return "\n<b>This is no longer available!</b>\n";
    default:
      return "";
  }
};

const stringSanitizer = (str: string) => {
  return str.replace(/<[^>]*>/g, "");
};

const parseProductInfo = (product: any) => {
  const r = `<b><a href='${product.images[0]}'>${stringSanitizer(
    product.name
  )}</a></b>\n${parseProductStatus(product.status)}\n<b>Member Price</b>: RM${
    product.dn.price
  }\n<b>Retail Price</b>: RM${product.srp.price}\n<b>UV</b>: ${
    product.dn.uv
  }\n<b>PV</b>: ${product.dn.pv}\n`;
  //  console.log(r);
  return r;
};

const randomizeMessage = (messages: Array<string>) => {
  return messages[Math.floor(Math.random() * messages.length)];
};

const telegram = async (app: express.Application) => {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn("TELEGRAM BOT TOKEN is missing, webhook DID NOT register");
    return;
  }

  const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!);

  const db = await connectToDB();
  const subscriptionIds = await db
    .collection("subscriptions")
    .find({})
    .toArray();
  bot.setSubscriber(subscriptionIds.map((d) => d.chatId));

  if (process.env.NODE_ENV === "development") {
    console.log("Start polling");
    bot.polls();
  }

  app.use(`/telegram/${process.env.TELEGRAM_BOT_TOKEN}`, async (req, res) => {
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
      if (bot.isSubscriber(id)) {
        bot.sendMessage(
          id,
          "You've already subscribed.\n/unsubscribe to unsubscribe."
        );
      } else {
        const {acknowledged} = await db
          .collection("subscriptions")
          .insertOne({chatId: id, createdAt: Date.now()});
        if (acknowledged) {
          bot.addSubscriber(id);
          bot.sendMessage(
            id,
            "Successfully subscribed!\nYou will start receiving latest changes!"
          );
        } else {
          bot.sendMessage(id, "Something went wrong. Please try again later.");
        }
      }
      return res.status(200).send("ok");
    }

    if (text === "/unsubscribe") {
      if (bot.isSubscriber(id)) {
        const {acknowledged} = await db
          .collection("subscriptions")
          .deleteOne({chatId: id});
        if (acknowledged) {
          bot.removeSubscriber(id);
          bot.sendMessage(id, "You have unsubscribed.");
        } else {
          bot.sendMessage(id, "Something went wrong. Please try again later.");
        }
      } else {
        bot.sendMessage(
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
            //bot.setClientState(id, "None");
            //await bot.sendMessage(
            //  id,
            //  randomizeMessage(["This feature is in development.", "This is not available at the moment."])
            //)

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
  });
};

export default telegram;
