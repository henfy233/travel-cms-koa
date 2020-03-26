'use strict';

const { InfoCrudMixin } = require('lin-mizar/lin/interface');
const { merge } = require('lodash');
const { Sequelize, Model } = require('sequelize');
const { db } = require('lin-mizar/lin/db');

class Follow extends Model {
  toJSON () {
    let origin = {
      id: this.id,
      eid: this.eid,
      be_eid: this.be_eid,
      create_time: this.createTime
    };
    return origin;
  }
}

Follow.init(
  {
    eid: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: '关注用户ID'
    },
    be_eid: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: '被关注用户ID'
    }
  },
  merge(
    {
      tableName: 'follow',
      modelName: 'follow',
      sequelize: db
    },
    InfoCrudMixin.options
  )
);

module.exports = { Follow };
