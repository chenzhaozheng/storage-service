const path = require('path');
const tinify = require("tinify");
const urlUtil = require('./url-util')

exports.filePathHandle = (req, file, cb) => {
  let filePath = __dirname + "/upload/";
  let type = path.extname(file.originalname);
  const query = req._parsedUrl.query;
  let appVal = urlUtil.getQueryString("app")
  if (appVal) {
    let temp = Number(appVal) === 1 ? "finance/" : "shan-m/";
    filePath += temp;
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
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
    return filePath;
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
