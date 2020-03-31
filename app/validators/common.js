'use strict';

const { LinValidator, Rule } = require('lin-mizar');
const { config } = require('lin-mizar/lin/config');

class PositiveIdValidator extends LinValidator {
  constructor () {
    super();
    this.id = new Rule('isInt', 'id必须为正整数', { min: 1 });
  }
}

class PaginateValidator extends LinValidator {
  constructor () {
    super();
    this.count = [
      new Rule('isOptional', '', config.getItem('countDefault')),
      new Rule('isInt', 'count必须为正整数', { min: 1 })
    ];
    this.page = [
      new Rule('isOptional', '', config.getItem('pageDefault')),
      new Rule('isInt', 'page必须为整数，且大于等于0', { min: 0 })
    ];
  }
}

class SearchValidator extends LinValidator {
  constructor () {
    super();
    this.q = new Rule('isNotEmpty', '必须传入搜索关键字');
  }
}

class PostArticleValidator extends LinValidator {
  constructor () {
    super();
    this.title = new Rule('isNotEmpty', '必须传入标题');
    this.img = new Rule('isNotEmpty', '必须传入封面url');
    this.text = new Rule('isNotEmpty', '发布内容不得为空');
  }
}

module.exports = {
  PaginateValidator,
  PositiveIdValidator,
  SearchValidator,
  PostArticleValidator
};
