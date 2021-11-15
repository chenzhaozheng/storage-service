const net = require("net");

process.on("message", function (m, handle) {
  // start(handle);
  start2(handle);
});

var buf = "hello nodejs";
var res =
  ["HTTP/1.1 200 OK", "content-length:" + buf.length].join("\r\n") +
  "\r\n\r\n" +
  buf; //嵌套字

function start(server) {
  server.listen();
  var num = 0;
  server.onconnection = function (err, handle) {
    num++;
    console.log(`worker[${process.pid}]:${num}`);
    var socket = new net.Socket({
      handle: handle,
    });
    socket.readable = socket.writable = true;
    socket.end(res);
  };
}

function start2(handle) {
  // fork创建子进程解决cpu计算密集程序阻塞
  console.info("计算开始");
  console.time("计算耗时");
  let sum = 0;
  for (let i = 0; i < 1e9; i++) {
    sum += i;
  }
  console.info("计算结束");
  console.timeEnd("计算耗时");
  console.log("got a connection on worker, pid = %d", process.pid);
  var socket = new net.Socket({
    handle: handle,
  });
  socket.readable = socket.writable = true;
  socket.end(res);
}
