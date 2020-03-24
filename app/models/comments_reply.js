'use strict';

const { InfoCrudMixin } = require('lin-mizar/lin/interface');
const { merge } = require('lodash');
const { Sequelize, Model } = require('sequelize');
const { db } = require('lin-mizar/lin/db');

class CommentsReply extends Model {
  toJSON () {
    let origin = {
      id: this.id,
      art_id: this.art_id,
      type: this.type,
      eid: this.eid,
      praise: this.praise,
      text: this.text,
      create_time: this.createTime
    };
    return origin;
  }
}

CommentsReply.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    comment_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: '评论主表id'
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
    to_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: '被评论者ID'
    },
    to_name: {
      type: Sequelize.STRING(24),
      allowNull: false,
      comment: '被评论者名字'
    },
    to_avatar: {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: '被评论者头像'
    },
    content: {
      type: Sequelize.STRING(512),
      allowNull: false,
      comment: '评论内容'
    }
  },
  merge(
    {
      tableName: 'comments_reply',
      modelName: 'comments_reply',
      sequelize: db
    },
    InfoCrudMixin.options
  )
);

module.exports = { CommentsReply };
