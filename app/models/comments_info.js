'use strict';

const { InfoCrudMixin } = require('lin-mizar/lin/interface');
const { merge } = require('lodash');
const { Sequelize, Model } = require('sequelize');
const { db } = require('lin-mizar/lin/db');

class CommentsInfo extends Model {
  toJSON () {
    let origin = {
      id: this.id,
      owner_id: this.owner_id,
      type: this.type,
      from_id: this.from_id,
      from_name: this.from_name,
      from_avatar: this.from_avatar,
      like_num: this.like_num,
      content: this.content,
      create_time: this.createTime
    };
    return origin;
  }
}

CommentsInfo.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    owner_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: '被评论者id，可以是游记、攻略'
    },
    type: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: '评论类型：对游记评论，对攻略评论'
    },
    from_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: '评论者ID'
    },
    from_name: {
      type: Sequelize.STRING(24),
      allowNull: false,
      comment: '评论者名字'
    },
    from_avatar: {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: '评论者头像'
    },
    content: {
      type: Sequelize.STRING(512),
      allowNull: false,
      comment: '评论内容'
    }
  },
  merge(
    {
      tableName: 'comments_info',
      modelName: 'comments_info',
      sequelize: db
    },
    InfoCrudMixin.options
  )
);

module.exports = { CommentsInfo };
