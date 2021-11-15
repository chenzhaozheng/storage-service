'use strict';

const runScript = require('runscript');
const isWin = process.platform === 'win32';
const REGEX = isWin ? /^(.*)\s+(\d+)\s*$/ : /^\s*(\d+)\s+(.*)/;
const moment = require('moment');
const mkdirp = require('mz-modules/mkdirp');
const path = require('path');
const fs = require('fs');

exports.findNodeProcess = async (filterFn) => {
  const command = isWin ?
    'wmic Path win32_process Where "Name = \'node.exe\'" Get CommandLine,ProcessId' :
    // command, cmd are alias of args, not POSIX standard, so we use args
    'ps -eo "pid,args"';
  const stdio = await runScript(command, { stdio: 'pipe' });
  const processList = stdio.stdout.toString().split('\n')
    .reduce((arr, line) => {
      if (!!line && !line.includes('/bin/sh') && line.includes('node')) {
        const m = line.match(REGEX);
        /* istanbul ignore else */
        if (m) {
          const item = isWin ? { pid: m[2], cmd: m[1] } : { pid: m[1], cmd: m[2] };
          if (!filterFn || filterFn(item)) {
            arr.push(item);
          }
        }
      }
      return arr;
    }, []);
  return processList;
};

exports.kill = function(pids, signal) {
  pids.forEach(pid => {
    try {
      process.kill(pid, signal);
    } catch (err) {
      if (err.code !== 'ESRCH') {
        throw err;
      }
    }
  })
}

async function getRotatelog(logfile) {
  await mkdirp(path.dirname(logfile));

  if (fs.existsSync(logfile)) {
    const timestamp = moment().format('.YYYYMMDD.HHmmss');
    await fs.renameSync(logfile, logfile + timestamp);
  }

  return await fs.openSync(logfile, 'a');
}

exports.getRotatelog = getRotatelog;
