'use strict';

module.exports = {
  log: {
    // 日志记录的level，推荐开发环境下为DEBUG，生产环境下为INFO
    level: 'DEBUG',
    // 记录日志文件的目录，默认为logs
    dir: 'logs',
    // 日志文件的切割大小，默认为5M
    sizeLimit: 1024 * 1024 * 5,
    // 记录http请求日志，默认为true，即记录，为false时则不记录
    requestLog: true,
    // 是否开启日志文件记录，默认为true
    file: false
  }
};
