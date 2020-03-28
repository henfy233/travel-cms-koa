'use strict';

const { InfoCrudMixin } = require('lin-mizar/lin/interface');
const { merge } = require('lodash');
const { Sequelize, Model } = require('sequelize');
const { db } = require('lin-mizar/lin/db');
const config = require('../config/setting');

class Banner extends Model {
  toJSON () {
    let origin = {
      id: this.id,
      title: this.title,
      img: this.img,
      url: this.url,
      date: this.date,
      create_time: this.createTime
    };
    return origin;
  }
}

Banner.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: Sequelize.STRING(50),
      allowNull: false,
      comment: '标题'
    },
    img: {
      type: Sequelize.STRING(500),
      allowNull: false,
      comment: '封面url',
      get () {
        return this.getDataValue('img').indexOf('http') < 0 ? config.siteDomain + '/assets/' + this.getDataValue('img') : this.getDataValue('img');
      }
    },
    url: {
      type: Sequelize.STRING(500),
      allowNull: false,
      comment: '页面跳转url'
    },
    date: {
      type: Sequelize.STRING(50),
      allowNull: false,
      comment: '相关日期'
    }
  },
  merge(
    {
      tableName: 'banner',
      modelName: 'banner',
      sequelize: db
    },
    InfoCrudMixin.options
  )
);

module.exports = { Banner };
