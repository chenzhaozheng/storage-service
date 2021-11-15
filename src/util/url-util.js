exports.getQueryString = (url, name) => {
  var reg = new RegExp("(?|&)" + name + "=([^&?]*)", "i");
  var arr = url.match(reg);
  if (arr) {
    return arr[2];
  }
  return null;
};
