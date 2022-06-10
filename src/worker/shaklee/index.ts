import axios, {AxiosResponseHeaders} from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://www.shaklee.com.my";
const LOGIN_URL = "https://www.shaklee.com.my/login/submit";

axios.defaults.withCredentials = true;

interface LoginCredential {
  username: string;
  password: string;
}

export default class Shaklee {
  private cookie: string | undefined;
  private token: string | undefined;
  private loginCredential: LoginCredential;
  private isAuth: boolean;
  constructor(loginCredential: LoginCredential) {
    if (!loginCredential.username || !loginCredential.password) {
      throw Error("Invalid credential");
    }

    this.loginCredential = loginCredential;
    this.isAuth = false;
  }

  private async init() {
    await this.getCSRFToken();
    await this.getCookies();
  }

  private reset() {
    this.isAuth = false;
    this.cookie = undefined;
    this.token = undefined;
  }

  private async getCSRFToken() {
    const res = await axios.get(BASE_URL);
    this.setCookieFromResponseHeaders(res.headers);

    const $ = cheerio.load(res.data);
    const token = $("meta[name=csrf-token]").attr("content");
    if (!token) {
      throw Error("Couldn't get csrf-token");
    }
    this.token = token!;
  }

  private async getCookies() {
    if (!this.token) {
      this.reset();
      throw Error("Csrf-token is missing");
    }
    if (!this.cookie) {
      this.reset();
      throw Error("Cookie is missing");
    }
    const params = {
      ...this.loginCredential,
      _token: this.token,
      action: "login",
    };
    const qs = this.objectToQueryString(params);

    const res = await axios.post(LOGIN_URL, qs, {
      headers: {
        "x-csrf-token": this.token,
        "Content-Type": "application/x-www-form-urlencoded",
        cookie: this.cookie,
      },
    });
    if (res.request._redirectable._currentUrl.indexOf("/bcboard") === -1) {
      this.reset();
      throw Error("Invalid credential/Login failed");
    }
    // Login redirect success
    this.setCookieFromResponseHeaders(res.headers);
    this.isAuth = true;
    console.log("Success!");
  }

  private setCookieFromResponseHeaders = (headers: AxiosResponseHeaders) => {
    this.cookie = headers["set-cookie"]?.map((c) => c.split(";")[0]).join("; ");
  };

  private objectToQueryString(obj: {[key: string]: any}) {
    const res: string[] = [];
    for (let i in obj) {
      let k = encodeURIComponent(i);
      let v = encodeURIComponent(obj[i]);
      res.push(k + "=" + v);
    }
    return res.join("&");
  }

  async getProducts() {
    if (!this.isAuth) {
      await this.init();
    }
    try {
      const param = {
        page: 1,
        sortby: "",
        limit: "all",
        prodcat_id: "all",
        subprodcat_id: "all",
        search_text: "",
        pcat: "all",
        lang: "en",
        hideoos: 0,
        action: "list",
      };
      const qs = this.objectToQueryString(param);
      const res = await axios.post(
        "https://www.shaklee.com.my/products/ajax",
        qs,
        {
          headers: {
            "x-csrf-token": this.token!,
            "Content-Type": "application/x-www-form-urlencoded",
            cookie: this.cookie!,
          },
        }
      );
      const payload: {
        status: string;
        msg: string;
        data: any[];
        pagination: any;
      } = res.data;
      return payload.data.map((d: any) => ({
        product_no: d.prodno,
        name: d["prod_disp_name"],
        status: d["status_label"].toLowerCase() || "available",
        tags: d.tags.split(",").map((t: string) => t.replace(".", "").trim()),
        images: d.images.map(
          (i: any) =>
            `https://www.shaklee.com.my/front/images/products/${i["img_name"]}`
        ),
        pcat: d.pcat,
        ...d.price.reduce((a: any, b: any) => {
          a[b.price_type.toLowerCase()] = {
            uv: b.uv,
            pv: b.pv,
            price: b.price_sell,
            start_date: b.start_date,
            end_date: b.end_date,
          };
          return a;
        }, {}),
      }));
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}
