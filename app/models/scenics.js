'use strict';

const { InfoCrudMixin } = require('lin-mizar/lin/interface');
const { merge } = require('lodash');
const { Sequelize, Model } = require('sequelize');
const { db } = require('lin-mizar/lin/db');

class Scenics extends Model {
  toJSON () {
    let origin = {
      id: this.id,
      name: this.name,
      position: this.position,
      image: this.image,
      praise: this.praise,
      create_time: this.createTime
    };
    return origin;
  }
}

Scenics.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING(20),
      allowNull: false,
      comment: '旅游地名字'
    },
    position: {
      type: Sequelize.STRING(30),
      allowNull: false,
      comment: '旅游地经纬度'
    },
    image: {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: '旅游地封面url'
    },
    praise: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '点赞数'
    }
  },
  merge(
    {
      tableName: 'scenics',
      modelName: 'scenics',
      sequelize: db
    },
    InfoCrudMixin.options
  )
);

module.exports = { Scenics };
