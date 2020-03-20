// 安全性配置
'use strict';

module.exports = {
  // 数据库配置项
  db: {
    database: 'tour', // 数据库名，请现在数据库中新建你自己的数据库
    host: 'localhost', // 数据库host
    dialect: 'mysql',
    port: 3306, // 数据库端口
    username: 'root', // 用户名
    password: '123321', // 密码
    logging: true, // 是否打印sql的日志
    timezone: '+08:00'
  },
  // 令牌的secret 重要！！！，千万不可泄漏，也请更换！
  secret:
    '\x88W\xf09\x91\x07\x98\x89\x87\x96\xa0A\xc68\xf9\xecJJU\x17\xc5V\xbe\x8b\xef\xd7\xd8\xd3\xe6\x95*4',
  smtp: {
    get host () {
      return 'smtp.qq.com';
    },
    get user () {
      return '619899573@qq.com';
    },
    get pass () {
      return 'qxdasiffaqcjbcde';
    }
    // get code () {
    //   return () => {
    //     return Math.random().toString(16).slice(2, 6).toUpperCase()
    //   }
    // },
    // get expire () {
    //   return () => {
    //     return new Date().getTime() + 3 * 60 * 1000;
    //   };
    // }
  }
};
