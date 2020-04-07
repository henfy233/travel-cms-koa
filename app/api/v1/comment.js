'use strict';

const {
  LinRouter,
  NotFound,
  disableLoading
} = require('lin-mizar');

const { CommentValidator, SendCommentValidator, SendReplyValidator } = require('../../validators/comment');
const {
  loginRequire
} = require('../../libs/jwt');

const { CommentDao } = require('../../dao/comment');

// comment 的红图实例
const commentApi = new LinRouter({
  prefix: '/v1/comment'
});

// comment 的dao 数据库访问层实例
const commentDto = new CommentDao();

/**
 * 根据（被评论者id，可以是游记、攻略）获取评论
 */
commentApi.get('/:id', async ctx => {
  const v = await new CommentValidator().validate(ctx);
  const id = v.get('path.id');
  const type = v.get('query.type');
  const comments = await commentDto.getComment(id, type);
  if (!comments) {
    throw new NotFound({
      msg: '没有找到相关评论'
    });
  }
  ctx.json(comments);
});

/**
 * 发表评论
 */
commentApi.post('/sendComment', loginRequire, async ctx => {
  const v = await new SendCommentValidator().validate(ctx);
  await commentDto.sendComment(ctx, v);
  ctx.success({
    msg: '发表成功'
  });
});

/**
 * 发表回复
 */
commentApi.post('/sendReply', loginRequire, async ctx => {
  const v = await new SendReplyValidator().validate(ctx);
  await commentDto.sendReply(ctx, v);
  ctx.success({
    msg: '发表成功'
  });
});

module.exports = { commentApi, [disableLoading]: false };
