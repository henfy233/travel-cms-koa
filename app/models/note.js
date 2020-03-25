'use strict';

const { InfoCrudMixin } = require('lin-mizar/lin/interface');
const { merge } = require('lodash');
const { Sequelize, Model } = require('sequelize');
const { db } = require('lin-mizar/lin/db');
const config = require('../config/setting');

class Note extends Model {
  toJSON () {
    let origin = {
      id: this.id,
      title: this.title,
      eId: this.eId,
      img: this.img,
      praise: this.praise,
      text: this.text,
      create_time: this.createTime
    };
    return origin;
  }
}

Note.init(
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
    eid: {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: '用户ID'
    },
    img: {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: '封面url',
      get () {
        return this.getDataValue('img').indexOf('http') < 0 ? config.siteDomain + '/assets/' + this.getDataValue('img') : this.getDataValue('img');
      }
    },
    praise: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: '点赞数'
    },
    text: {
      type: Sequelize.TEXT,
      allowNull: false,
      comment: '游记内容'
    }
  },
  merge(
    {
      tableName: 'note',
      modelName: 'note',
      sequelize: db
    },
    InfoCrudMixin.options
  )
);

module.exports = { Note };
