const Koa = require("koa");
const fs = require("fs");
const KoaLogger = require("koa-logger");
const static = require("koa-static");
const app = new Koa();
const path = require("path");
const Router = require("@koa/router");
const router = new Router();
const multer = require("@koa/multer");
const dirTree = require("directory-tree");
const { compressingImage } = require('./util/file-util');
const { filePathHandle } = require('./util/file-util');
// 不支持复杂的场景，例如form-data
// const bodyParser = require("koa-bodyparser");

app.use(KoaLogger());

let port = 8086;
const limits = {
  fields: 5, //非文件字段的数量
  fileSize: 1000 * 10 * 1024, //文件大小 单位 b
  files: 10, //文件数量
};

const storage = multer.diskStorage({
  //文件保存路径
  destination: function (req, file, cb) {
    console.log(file);
    filePathHandle(req, file, cb);
  },
  //修改文件名称
  filename: function (req, file, cb) {
    // let type = file.originalname.split('.')[1]
    let type = path.extname(file.originalname);
    cb(null, `${Date.now().toString(16)}${type}`);
  },
});

const upload = multer({ storage, limits });

router.post("/upload-single-file", async (ctx, next) => {
  let err = await upload
    .single("file")(ctx, next)
    .then((res) => res)
    .catch((err) => err);
  if (err) {
    ctx.body = {
      code: 0,
      msg: err.message,
      dirname: __dirname,
      process: process.env,
    };
  } else {
    if (!ctx.file) {
      ctx.body = {
        code: 0,
        msg: '没有检测到文件'
      }
      return;
    }
    // 获取url这步通过切割文件名出来显示
    let url = ctx.origin + '/' + ctx.file.path.split("/upload/")[1];
    let path = "/" + ctx.file.destination.split("/upload/")[1];
    let { fieldname, originalname, mimetype, filename, size } = ctx.file;
    compressingImage(ctx.file.path);
    ctx.body = {
      code: 1,
      data: {
        fieldname,
        originalname,
        mimetype,
        filename,
        size,
        url,
        path,
      },
    };
  }
});

router.post("/upload-multi-file", async (ctx, next) => {
  let err = await upload
    .fields([
      {
        name: "files",
        maxCount: 10,
      },
    ])(ctx, next)
    .then((res) => res)
    .catch((err) => err);
  if (err) {
    ctx.body = {
      code: 0,
      msg: err.message,
    };
  } else {
    if (!ctx.files) {
      ctx.body = {
        code: 0,
        msg: '没有检测到文件'
      }
      return;
    }
    let newFiles = {
      files: [],
    };
    const files = ctx.files;
    if (files && files.files) {
      files.files.forEach((file) => {
        let url = ctx.origin + '/' + file.path.split("/upload/")[1];
        let path = "/" + file.destination.split("/upload/")[1];
        let { fieldname, originalname, mimetype, filename, size } = file;
        newFiles.files.push({
          fieldname,
          originalname,
          mimetype,
          filename,
          size,
          url,
          path,
        });
      });
    }
    ctx.body = {
      code: 1,
      data: newFiles,
    };
  }
});

// 存储对象 未实现
router.get("/buckets", async (ctx, next) => {
  ctx.body = {
    data: [
      {
        name: "finance",
      },
    ],
  };
});

// 文件管理 未实现
router.get("/buckets/:a", async (ctx, next) => {
  ctx.body = {
    code: "200",
    data: {
      bucketName: "finance",
      delimiter: "/",
      maxKeys: 100,
      objectList: [
        {
          dir: true,
          name: "egg-multipart-test/",
          path: "egg-multipart-test/",
          size: 0,
        },
        {
          dir: true,
          name: "scm/",
          path: "scm/",
          size: 0,
        },
      ],
    },
  };
});

// 文件列表查询
router.get("/files-tree", async (ctx, next) => {
  const filteredTree = dirTree("./upload", {
    extensions: /\.(jpg|jpeg|png|gif)$/,
    attributes: ['size', 'type', 'extension']
  });
  ctx.body = filteredTree;
})

app.use(static(path.join(__dirname, "/../upload")));
app.use(router.routes()).use(router.allowedMethods());
app.on("error", (err) => {
  console.error("server error", err);
});
// process.send({ type: 'port', port});
app.listen(port);
