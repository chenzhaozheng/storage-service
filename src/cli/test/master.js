const net = require('net');
const fork = require('child_process').fork;

// 非round-robin 轮转方法
// var handle = net._createServerHandle('0.0.0.0', 4003);
// for  (var i = 0; i < 4; i++) {
//   fork('./worker').send({}, handle);
// }

// round-robin 轮转方法
var workers = [];
for (var i = 0; i < 4; i++) {
  workers.push(fork('./worker'));
}
var handle2 = net._createServerHandle('0.0.0.0', 4001);
handle2.listen();
handle2.onconnection = function (err, handle2) {
  // console.log('fffff');
  // console.info('计算开始');
  // console.time('计算耗时');
  // let sum = 0;
  // for (let i = 0; i < 1e9; i++) {
  //   sum += i;
  // }
  // console.info('计算结束');
  // console.timeEnd('计算耗时');
  var worker = workers.pop();
  worker.send({}, handle2);
  workers.unshift(worker);
}
