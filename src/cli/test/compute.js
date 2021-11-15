const longComputation = () => {
  console.info('计算开始');
  console.time('计算耗时');
  let sum = 0;
  for (let i = 0; i < 1e9; i++) {
    sum += i;
  }
  console.info('计算结束');
  console.timeEnd('计算耗时');
  return sum;
}

process.on('message', (msg) => {
  const sum = longComputation();
  console.log(sum);
  process.send(sum);
})

exports.longComputation = longComputation;
