const path = require("path");
const { getClientIP } = require("../util/ip");
const static_ip = [
  {
    ip: "120.76.134.200",
    remark: "pro",
  },
];

exports.IpIntercept = async (ctx, next) => {
  if (process.env.STORAGE_ENV === "pro" && !path.extname(ctx.request.url)) {
    let clientIp = getClientIP(ctx.req);
    console.info(clientIp);
    // ctx.res.writeHead(400, {
    //   // "Content-Type": "text/plain;charset=utf-8",
    // });
    // const ip = "::ffff" + static_ip[i].ip;
    // ctx.res.writeHead(200);
    // return ctx.res.use(static_ip[i].remark);
    let isExistWhite = 0;
    for (let i = 0; i < static_ip.length; i++) {
      const ip = static_ip[i].ip;
      if (clientIp === ip) {
        isExistWhite = 1;
      }
    }
    if (isExistWhite) {
      await next();
    } else {
      ctx.body = {
        code: 0,
        data: {
          msg: "not auth",
        },
      };
    }
  } else {
    await next();
  }
};
