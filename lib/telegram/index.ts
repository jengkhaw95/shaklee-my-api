import axios from "axios";

type ClientState = "None" | "Search" | "Promotion" | "Product";
type ParseMode = "MarkdownV2" | "HTML";
type BotMethod = "sendMessage" | "sendPhoto" | "getUpdates" | "sendMediaGroup";
type SubscriptionTopic = "product" | "promotion";
type SubscriptionTopics = SubscriptionTopic[];

interface From {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name: string;
  username: string;
  language_code: string;
}

interface Chat {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  type: string;
}

interface Message {
  message_id: number;
  from: From;
  chat: Chat;
  date: number;
  text: string;
}

interface TelegramMessage {
  update_id: number;
  message: Message;
}

const baseUrl = "https://api.telegram.org/bot";
const MAX_PHOTO_GROUP_COUNT = 10;

export const availableOptions = [
  "Search Product",
  "Promotion",
  "Announcement",
  "/search",
  "/promotion",
  "/announcement",
  "/subscribe",
  "/unsubscribe",
];

class TelegramBot {
  private apiKey: string;
  private productCache: Map<string, any>;
  private chatIdSet: Set<number>;
  private clientStore: Map<number, ClientState>;
  private pollingInterval?: NodeJS.Timer;
  private lastUpdatedId?: number;
  constructor(apiKey: string) {
    if (!apiKey) {
      throw Error("Telegram Bot Token is missing");
    }
    this.pollingInterval = undefined;
    this.lastUpdatedId = 195540592;
    this.apiKey = apiKey;
    this.productCache = new Map<string, any>();
    this.clientStore = new Map<number, ClientState>();
    this.chatIdSet = new Set();

    console.log("Telegram bot instantiated");
  }

  setSubscriber(chatIds: number[] = []) {
    this.chatIdSet = new Set(chatIds);
  }

  addSubscriber(chatId: number) {
    this.chatIdSet.add(chatId);
  }

  removeSubscriber(chatId: number) {
    this.chatIdSet.delete(chatId);
  }

  isSubscriber(chatId: number) {
    return this.chatIdSet.has(chatId);
  }

  getProductFromCache(id: string) {
    return this.productCache.get(id);
  }

  setProductCache(id: string, product: any) {
    this.productCache.set(id, product);
  }

  getClientState(id: number) {
    return this.clientStore.get(id);
  }

  setClientState(id: number, state: ClientState) {
    this.clientStore.set(id, state);
  }

  getUrl(method: BotMethod) {
    return `${baseUrl}${this.apiKey}/${method}`;
  }

  async broadcast(audienceIds: number[], textHTML: string) {
    const reply_markup = {
      remove_keyboard: true,
      selective: true,
    };
    const promises = audienceIds.map((chat_id) =>
      axios.get(this.getUrl("sendMessage"), {
        params: {
          chat_id,
          text: textHTML,
          parse_mode: "HTML",
          reply_markup,
        },
      })
    );
    return Promise.all(promises);
  }

  private getUpdates() {
    return axios.get(this.getUrl("getUpdates"));
  }

  async sendMessage(chatId: number, text: string, option?: any) {
    // Remove keyboard by default
    const reply_markup = {
      remove_keyboard: true,
      selective: true,
    };
    return axios.get(this.getUrl("sendMessage"), {
      params: {
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        reply_markup,
        ...option,
      },
    });
  }

  async sendButtons(chatId: number, text: string, buttons: Array<string>) {
    const reply_markup = {
      keyboard: buttons.map((text) => [{text}]),
      resize_keyboard: true,
      one_time_keyboard: true,
      selective: true,
    };
    return this.sendMessage(chatId, text, {parse_mode: "HTML", reply_markup});
  }

  async sendImage(chatId: number, photo: string, option?: any) {
    // Remove keyboard by default
    const reply_markup = {
      remove_keyboard: true,
      selective: true,
    };
    return axios.get(this.getUrl("sendPhoto"), {
      params: {
        chat_id: chatId,
        photo,
        parse_mode: "HTML",
        reply_markup,
        ...option,
      },
    });
  }

  async sendGroupImages(chatId: number, photoUrls: string[]) {
    const media = photoUrls
      .map((photo) => ({type: "photo", media: photo}))
      .slice(-MAX_PHOTO_GROUP_COUNT);
    return axios.get(this.getUrl("sendMediaGroup"), {
      params: {
        chat_id: chatId,
        media: JSON.stringify(media),
        protect_content: true,
      },
    });
  }

  private async pollingTask() {
    const {data} = await this.getUpdates();
    const {ok, result} = data;
    if (!ok) {
      this.killPolling();
      return;
    }
    for (let i of result) {
      if (this.lastUpdatedId && i.update_id <= this.lastUpdatedId) {
        continue;
      }
      console.log(i);
      this.lastUpdatedId = i.update_id;
      await axios.post(
        `http://localhost:${process.env.PORT || 5000}/telegram/${
          process.env.TELEGRAM_BOT_TOKEN
        }`,
        i
      );
    }
  }

  polls() {
    //if (!this.pollingInterval) {
    //  this.pollingInterval = setInterval(this.pollingTask.bind(this), 2000);
    //}
  }

  private killPolling() {
    console.log("Kill polling");
    clearInterval(this.pollingInterval);
  }
}

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw "TELEGRAM BOT TOKEN is missing";
}
export const tbot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
