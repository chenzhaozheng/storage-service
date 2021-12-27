const child_process = require("child_process");
const chalk = require("chalk");
const helper = require("./helper");
const minimist = require("minimist");
class DevPlugin {
  constructor() {
    this.child = "";
    this.arg = arguments;
    this.argv = minimist(process.argv.splice(2));
    this.started = false;
  }

  async start() {
    const isDaemon = this.argv.daemon;

    if (isDaemon) {
      process.env.STORAGE_ENV = 'pro';
      const [ stdout, stderr ] = await [ await helper.getRotatelog('logs/main-stdout'), await helper.getRotatelog('logs/main-stderr')];
      var child = child_process.fork(require.resolve("./child"), [], {
        env: process.env,
        silent: false,
        // silent: true, // true会被pipe到父进程。否则会继承父进程 stdio的
        stdio: ['ignore', stdout, stderr, 'ipc'], // stdio 会覆盖silent
        detached: true
      });
      // let d = child_process.spawn(process.argv[0], ['cli/child.js'], {
      //   detached: true, // 这里要设置成true
      //   stdio: 'ignore'  // 备注：如果不置为 ignore，那么 父进程还是不会退出
      // });
      // d.unref();
      // this.child.disconnect();
      child.on("message", (msg) => {
        if (msg.type === "started") {
          if (msg.startSuccess && !this.started) {
            this.started = true;
            this.log("start service at daemon ...");
            child.unref();
            child.disconnect();
            this.exit(0);
          }
        } else if (msg.type === "error") {
          console.error(chalk.hex("#ff00000")(`[ Storage ] ${msg}`));
        }
      });
    } else {
      // 非后台启动直接设置为local
      process.env.STORAGE_ENV = 'local';
      var child = child_process.fork(require.resolve("./child"), [], {
        env: process.env,
        silent: true,
      });
      // fork 开启一个进程，建立与父进程的信息通道
      child.on("message", (msg) => {
        // this.log(`msg`, msg);
        if (msg.type === "started") {
          if (msg.startSuccess && !this.started) {
            this.started = true;
            this.log(`start service ok`);
          }
        } else if (msg.type === "port") {
          this.log(`[http://127.0.0.1:${msg.port}]`);
        }else if (msg.type === "error") {
          console.error(chalk.hex("#ff00000")(`[ Storage ] ${JSON.stringify(msg)}`));
        }
      });
    }

    // this.child.stdout.on("data", (data) => {
    //   this.log(`接收到数据块${data}`);
    //   process.stdout.write(data);
    // });
    // this.child.stderr.on("data", (data) => {
    //   this.log("stderr", data);
    // });
    child.on("close", (code) => {
      this.log(`close 子进程退出，退出码${code}`);
    });
    child.on("error", (err) => {
      this.log(`error`);
      this.log(err);
    });
    child.on("exit", (err, signal) => {
      this.log(`exit ${signal}`);
      this.log(err);
    });
    child.on("disconnect", (err, signal) => {
      this.log(`disconnect ${signal}`);
      this.log(err);
    });
  }

  async handleClose(isExit, signal) {
    if (this.child) {
      this.child.kill();
      this.child = null;
    }
    if (isExit) {
      process.exit(signal);
    }
  }

  async stop() {
    this.log("测试中断node进程");
    let processList = await helper.findNodeProcess((item) => {
      const cmd = item.cmd;
      this.log("cmd", cmd);
      return cmd.includes("storage-api");
    });
    let pids = processList.map((x) => x.pid);
    this.log("pids", pids);
    if (pids.length) {
      helper.kill(pids);
    }
  }

  async restart() {
    this.log(`Restart . ${chalk.hex("#666666")(`[service]`)}`);
    await this.handleClose();
    await this.run();
  }

  async run() {
    if (this.argv.stop) {
      await this.stop();
    } else {
      process.on("exit", this.handleClose.bind(this, true));
      process.on("SIGINT", this.handleClose.bind(this, true));
      await this.start();
    }
  }

  log(...args) {
    console.log(`[ Storage ] `, ...args);
  }

  exit(code) {
    // process.exit(code);
    process.exitCode = code;
  }
}

const dev = new DevPlugin();
dev.run();
