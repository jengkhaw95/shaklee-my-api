import express from "express";
import {connectToDB} from "../../db";
import {TelegramBot} from "../../telegram";

const availableOptions = ["Search Product", "Promotion"];

const telegram = (app: express.Application) => {
  const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!);

  app.use("/telegram", async (req, res) => {
    if (req.method !== "POST") {
      return res.status(404);
    }
    const {
      message: {
        text,
        chat: {id},
      },
    } = req.body;

    const db = await connectToDB();

    if (text === "/start") {
      bot.setClientState(id, "None");
      bot.sendButtons(id, "How can I help", availableOptions);
      return res.status(200).send("ok");
    }

    if (availableOptions.includes(text)) {
      switch (text) {
        case "Search Product":
          {
            bot.setClientState(id, "Search");
            await bot.sendMessage(id, "What are you looking for?");
          }

          break;
        case "Promotion":
          {
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
            products.map((prod) => bot.setProductCache(prod.name, prod));
            await bot.sendButtons(
              id,
              `Found <b>${products.length}</b> result(s)`,
              products.map((prod) => prod.name)
            );
            bot.setClientState(id, "Product");
          } else {
            await bot.sendMessage(id, `No product found (search: ${text})`);
          }
        }
        break;
      case "Product": {
        const product = bot.getProductFromCache(text);
        await bot.sendMessage(id, JSON.stringify(product));
        bot.setClientState(id, "None");
        break;
      }

      default:
        break;
    }

    return res.status(200);
  });
};

export default telegram;
