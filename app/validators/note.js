'use strict';

const { LinValidator, Rule } = require('lin-mizar');

class CreateOrUpdateNoteValidator extends LinValidator {
  constructor () {
    super();
    this.title = new Rule('isNotEmpty', '必须传入标题');
    this.img = new Rule('isNotEmpty', '必须传入封面url');
    this.text = new Rule('isNotEmpty', '发布内容不得为空');
  }
}

class PositiveNumValidator extends LinValidator {
  constructor () {
    super();
    this.num = new Rule('isInt', 'num必须为正整数', { min: 1 });
  }
}

module.exports = {
  CreateOrUpdateNoteValidator,
  PositiveNumValidator
};
