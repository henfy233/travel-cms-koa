'use strict';

const { LinValidator, Rule } = require('lin-mizar');

class CreateOrUpdateGuideValidator extends LinValidator {
  constructor () {
    super();
    this.title = new Rule('isNotEmpty', '必须传入标题');
    this.email = new Rule('isNotEmpty', '必须传入用户邮箱');
    this.content = new Rule('isNotEmpty', '必须传入内容');
    this.imageId = new Rule('isNotEmpty', '必须传入图像ID');
  }
}

class PositiveNumValidator extends LinValidator {
  constructor () {
    super();
    this.num = new Rule('isInt', 'num必须为正整数', { min: 1 });
  }
}

module.exports = {
  CreateOrUpdateGuideValidator,
  PositiveNumValidator
};
