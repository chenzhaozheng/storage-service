const path = require("path");
const tinify = require("tinify");
const queryString = require("query-string");
const fs = require("fs");
const multer = require("@koa/multer");

const filePathHandle = (req, file, cb) => {
  try {
    let filePath = process.cwd() + "/upload/";
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
    }
    let type = path.extname(file.originalname);
    const query = req._parsedUrl.query;
    let appVal = "";
    appVal = queryString.parse(query).app;
    if (appVal) {
      let temp = Number(appVal) === 1 ? "finance/" : "shan-m/";
      filePath += temp;
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath);
      }
    }
    if ([".jpg", ".png", ".gif", ".jpeg", ".jfif"].includes(type)) {
      filePath += `images/`;
    } else if ([".pdf", ".doc", ".docx", ".xslx", ".xsl", ".html"].includes(type)) {
      filePath += `others/`;
    } else {
      cb(new Error("ext is wrong"));
    }
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
    }
    cb(null, filePath);
  } catch (error) {
    cb(new Error(error));
  }
};

const  compressingImage = (fromFile) => {
  try {
    tinify.key = "dY3G5R3NKty6M9blhdBBj1gKxHk220hs";
    if (fromFile) {
      const source = tinify.fromFile(fromFile);
      source.toFile(fromFile);
    }
  } catch (error) {
    console.error(error);
  }
};

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

const upload  = multer({ storage, limits });

exports.upload = upload;
exports.filePathHandle = filePathHandle;
exports.compressingImage = compressingImage;
