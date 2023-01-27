export const parseProductStatus = (productStatus: string) => {
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

export const stringSanitizer = (str: string) => {
  return str.replace(/<[^>]*>/g, "");
};

export const parseProductInfo = (
  product: any,
  broadcastType?: "new" | "oos" | "promotion" | "archived"
) => {
  let r = "";
  switch (broadcastType) {
    case "new":
      r += "<b>New product found</b>\n\n";
      break;
    case "oos":
      r += "<b>Product out-of-stock!</b>\n\n";
      break;
    case "promotion":
      r += "<b>New promotion found</b>\n\n";
      break;
    case "archived":
      r += "<b>Product removed</b>\n\n";
      break;

    default:
      break;
  }
  r = `<b><a href='${product.images[0]}'>${stringSanitizer(
    product.name
  )}</a></b>\n${parseProductStatus(product.status)}\n<b>Member Price</b>: RM${
    product.dn.price
  }\n<b>Retail Price</b>: RM${product.srp.price}\n<b>UV</b>: ${
    product.dn.uv
  }\n<b>PV</b>: ${product.dn.pv}\n`;

  if (broadcastType) {
    r +=
      "\nIf you do not wish to receive updates, you can /unsubscribe anytime.\n";
  }
  return r;
};

export const randomizeMessage = (messages: Array<string>) => {
  return messages[Math.floor(Math.random() * messages.length)];
};
