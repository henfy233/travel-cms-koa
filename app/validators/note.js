'use strict';

const { LinValidator, Rule } = require('lin-mizar');

class PositiveNumValidator extends LinValidator {
  constructor () {
    super();
    this.num = new Rule('isInt', 'num必须为正整数', { min: 1 });
  }
}

module.exports = {
  PositiveNumValidator
};
