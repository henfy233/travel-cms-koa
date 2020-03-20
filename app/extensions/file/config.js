'use strict';

module.exports = {
  file: {
    // 文件的存储路径，你也可以在LocalUploader的构造函数中传入
    storeDir: 'app/assets',
    // 单个文件的大小限制，默认2M
    singleLimit: 1024 * 1024 * 2,
    // 所有文件的大小限制，默认20M
    totalLimit: 1024 * 1024 * 20,
    // 文件数量限制，默认10
    nums: 10,
    // 文件后缀名的排除项，默认排除[]，即允许所有类型的文件上传
    exclude: []
    // 文件后缀名的包括项
    // include:[]
  }
};
