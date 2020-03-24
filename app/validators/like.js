'use strict';

const { LinValidator, Rule } = require('lin-mizar');
const {
  ArtType
} = require('../libs/enum');

class PositiveIntegerValidator extends LinValidator {
  constructor () {
    super();
    this.id = [
      new Rule('isInt', '需要是正整数', {
        min: 1
      })
    ];
  }
}

class LikeValidator extends PositiveIntegerValidator {
  constructor () {
    super();
    this.validateType = checkArtType;
  }
}

function checkArtType (vals) {
  let type = vals.body.type || vals.path.type;
  if (!type) {
    throw new Error('type是必须参数');
  }
  type = parseInt(type);

  if (!ArtType.isThisType(type)) {
    throw new Error('type参数不合法');
  }
}

module.exports = {
  LikeValidator
};
