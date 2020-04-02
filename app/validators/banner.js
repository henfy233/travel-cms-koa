'use strict';

const { LinValidator, Rule } = require('lin-mizar');

class CreateOrUpdateBannerValidator extends LinValidator {
  constructor () {
    super();
    this.title = new Rule('isNotEmpty', '必须传入标题名');
    this.img = new Rule('isLength', '图片的url长度必须在0~100之间', {
      min: 0,
      max: 100
    });
    this.url = new Rule('isNotEmpty', '必须传入跳转地址');
    this.date = new Rule('isNotEmpty', '必须传入日期');
  }
}

module.exports = {
  CreateOrUpdateBannerValidator
};
