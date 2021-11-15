// test 里利用计算密集型计算来 测试fork解决计算时间太长的情况
// 1.普通操作 index.js
// 2.请求http服务，再进行操作 everything.js
// 3.round-robin 轮转方法，计算时间长度
const { longComputation } = require("./compute");
const sum = longComputation();
console.log(sum);
