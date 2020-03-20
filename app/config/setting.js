// 基础配置
'use strict';

module.exports = {
  // 端口号
  port: 5000,
  // 本后端地址端口
  siteDomain: 'http://localhost:5000',
  // 分页参数，每页的个数
  countDefault: 10,
  // 分页参数，默认的开始页
  pageDefault: 0,
  // api目录，默认从 app/api目录中自动加载所有api
  apiDir: 'app/api',
  // debug 模式
  debug: true,
  // ---前台页面设置----
  // access token 的过期时间 默认 1 个小时 1h 单位秒
  aExp: 60 * 60,
  // refreshExp 设置refresh_token的过期时间，默认一个月
  rExp: 60 * 60 * 24 * 30,
  // ---后台管理页面设置----
  // access token 的过期时间 默认 1 个小时 1h 单位秒
  accessExp: 60 * 60,
  // refreshExp 设置refresh_token的过期时间，默认一个月
  refreshExp: 60 * 60 * 24 * 30,
  // 暂不启用插件
  pluginPath: {
    // plugin name
    // poem: {
    //   // determine a plugin work or not
    //   enable: true,
    //   // path of the plugin that relatived the workdir
    //   path: "app/plugins/poem",
    //   // other config
    //   limit: 2
    // },
    // notify: {
    //   enable: true,
    //   path: "app/plugins/notify",
    //   retry: 2000
    // }
  }
};
