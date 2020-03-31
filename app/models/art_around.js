'use strict';

const { InfoCrudMixin } = require('lin-mizar/lin/interface');
const { merge } = require('lodash');
const { Sequelize, Model } = require('sequelize');
const { db } = require('lin-mizar/lin/db');

class ArtAround extends Model {
  toJSON () {
    let origin = {
      id: this.id,
      oid: this.oid,
      type: this.type,
      aid: this.aid,
      create_time: this.createTime
    };
    return origin;
  }
}

ArtAround.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    oid: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: '文章ID'
    },
    type: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: '类型：游记、攻略'
    },
    aid: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: '关联旅游地ID'
    }
  },
  merge(
    {
      tableName: 'art_around',
      modelName: 'art_around',
      sequelize: db
    },
    InfoCrudMixin.options
  )
);

module.exports = { ArtAround };
