import axios from "axios";

type ClientState = "None" | "Search" | "Promotion" | "Product";
type ParseMode = "MarkdownV2" | "HTML";
type BotMethod = "sendMessage";

const baseUrl = "https://api.telegram.org/bot";

export class TelegramBot {
  private apiKey: string;
  private productCache: Map<string, any>;
  private clientStore: Map<number, ClientState>;
  constructor(apiKey: string) {
    if (!apiKey) {
      throw Error("Telegram Bot Token is missing");
    }
    this.apiKey = apiKey;
    this.productCache = new Map<string, any>();
    this.clientStore = new Map<number, ClientState>();
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

  async sendMessage(
    chatId: number,
    text: string,
    option?: any
  ) {
    // Remove keyboard by default
    const reply_markup = {
      remove_keyboard: true,
      selective: true
    };
    //console.log("Sending message");
    return axios.get(this.getUrl("sendMessage"), {
      params: {chat_id: chatId, text, parse_mode: "HTML", reply_markup, ...option},
    });
  }

  async sendButtons(
    chatId: number,
    text: string,
    buttons: Array<string>,
  ) {
    const reply_markup = {
      keyboard: buttons.map((text) => [{text}]),
      resize_keyboard: true,
      one_time_keyboard: true,
      selective: true,
    };
    //console.log("Sending buttons");
    return this.sendMessage(chatId, text, {parse_mode: "HTML", reply_markup});
  }
}
