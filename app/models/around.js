'use strict';

const { InfoCrudMixin } = require('lin-mizar/lin/interface');
const { merge } = require('lodash');
const { Sequelize, Model } = require('sequelize');
const { db } = require('lin-mizar/lin/db');

class Around extends Model {
  toJSON () {
    let origin = {
      id: this.id,
      sid: this.sid,
      aid: this.aid,
      create_time: this.createTime
    };
    return origin;
  }
}

Around.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sid: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: '旅游地ID'
    },
    aid: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: '关联旅游地ID'
    }
  },
  merge(
    {
      tableName: 'around',
      modelName: 'around',
      sequelize: db
    },
    InfoCrudMixin.options
  )
);

module.exports = { Around };
