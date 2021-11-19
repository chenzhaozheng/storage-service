const path = require("path");
const tinify = require("tinify");
const queryString = require("query-string");
const fs = require("fs");

exports.filePathHandle = (req, file, cb) => {
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
    } else if ([".pdf", ".doc", ".docx", ".xslx", ".xsl"].includes(type)) {
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

exports.compressingImage = (fromFile) => {
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
