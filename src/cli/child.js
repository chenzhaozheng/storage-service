process.on('exit', async () => {
  console.log('exit child process');
});
(async () => {
  try {
    const app = require('../app');
  } catch (e) {
    process.send({
      type: 'error',
      message: `start error: ${e}`
    })
  }
  process.send({ type: 'started', startSuccess: true });
})();
