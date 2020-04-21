'use strict';

const { LinValidator, Rule } = require('lin-mizar');

class CreateOrUpdateScenicsValidator extends LinValidator {
  constructor () {
    super();
    this.name = new Rule('isNotEmpty', '必须传入景点名字');
    this.position = new Rule('isNotEmpty', '必须传入景点坐标');
    this.city = new Rule('isNotEmpty', '必须传入景点地点');
    this.image = new Rule('isLength', '景点插图的url长度必须在0~100之间', {
      min: 0,
      max: 100
    });
  }
}

module.exports = {
  CreateOrUpdateScenicsValidator
};
