'use strict';

const { LinValidator, Rule } = require('lin-mizar');

class GuideSearchValidator extends LinValidator {
  constructor () {
    super();
    this.q = new Rule('isNotEmpty', '必须传入搜索关键字');
  }
}

class CreateOrUpdateGuideValidator extends LinValidator {
  constructor () {
    super();
    this.title = new Rule('isNotEmpty', '必须传入标题');
    this.email = new Rule('isNotEmpty', '必须传入用户邮箱');
    this.content = new Rule('isNotEmpty', '必须传入内容');
    this.imageId = new Rule('isNotEmpty', '必须传入图像ID');
  }
}

module.exports = {
  CreateOrUpdateGuideValidator,
  GuideSearchValidator
};
