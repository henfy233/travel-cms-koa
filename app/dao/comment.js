'use strict';

// const { NotFound, Forbidden } = require('lin-mizar');
const { db } = require('lin-mizar/lin/db');
const { CommentsInfo } = require('../models/comments_info');
const { CommentsReply } = require('../models/comments_reply');

class CommentDao {
  /**
   * 获取评论
   * @param {int} id 被评论者ID
   * @param {int} type 被评论者类型
   */
  async getComment (id, type) {
    let sql =
      'SELECT ci.id , ci.from_id as eid, ci.from_name as name, ci.from_avatar as headImg, ci.content as comment, ci.create_time as time FROM `comments_info` as ci WHERE';
    let comments = await db.query(
      sql +
      ' ci.owner_id = :id AND ci.type = :type ',
      {
        replacements: {
          id,
          type
        },
        type: db.QueryTypes.SELECT
      }
    );

    for (var i = 0; i < comments.length; i++) {
      let sql1 =
        'SELECT cr.id, cr.from_id as fromId, cr.from_name as fromName, cr.from_avatar as fromHeadImg, cr.to_name as toName, cr.to_id as toId, cr.content as comment, cr.create_time as time FROM `comments_reply` as cr WHERE cr.comment_id = :id ';
      comments[i].reply = await db.query(sql1,
        {
          replacements: {
            id: comments[i].id
          },
          type: db.QueryTypes.SELECT
        }
      );
    }
    return comments;
  }

  /**
   * 发表评论
   * @param {object} ctx 用户信息
   * @param {object} v 返回信息
   */
  async sendComment (ctx, v) {
    let user = ctx.currentUser;
    const comment = new CommentsInfo();
    comment.owner_id = v.get('body.owner_id');
    comment.type = v.get('body.type');
    comment.from_id = user.id;
    comment.from_name = user.nickname;
    comment.from_avatar = user.avatar;
    comment.content = v.get('body.comment');
    comment.save();
  }

  /**
   * 发表回复
   * @param {object} ctx 用户信息
   * @param {object} v 返回信息
   */
  async sendReply (ctx, v) {
    let user = ctx.currentUser;
    const reply = new CommentsReply();
    reply.comment_id = v.get('body.commentId');
    reply.from_id = user.id;
    reply.from_name = user.nickname;
    reply.from_avatar = user.avatar;
    reply.to_id = v.get('body.toId');
    reply.to_name = v.get('body.toName');
    reply.content = v.get('body.comment');
    reply.save();
  }
}

module.exports = { CommentDao };
