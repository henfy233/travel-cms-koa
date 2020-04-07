'use strict';

const {
  LinRouter,
  disableLoading
} = require('lin-mizar');
const {
  LikeValidator
} = require('../../validators/like');
const {
  loginRequire
} = require('../../libs/jwt');
const { FavorDao } = require('../../dao/favor');

// like 的红图实例
const likeApi = new LinRouter({
  prefix: '/v1/like'
});

// like 的dao 数据库访问层实例
const favorDto = new FavorDao();

/**
 * 点赞
 */
likeApi.post('/', loginRequire, async ctx => {
  const v = await new LikeValidator().validate(ctx, {
    id: 'art_id'
  });
  let user = ctx.currentUser;
  await favorDto.like(
    v.get('body.art_id'), v.get('body.type'), user.id);
  ctx.success({
    msg: '点赞成功'
  });
});

/**
 * 取消点赞
 */
likeApi.post('/cancel', loginRequire, async ctx => {
  const v = await new LikeValidator().validate(ctx, {
    id: 'art_id'
  });
  let user = ctx.currentUser;
  await favorDto.disLike(
    v.get('body.art_id'), v.get('body.type'), user.id);
  ctx.success({
    msg: '取消点赞成功'
  });
});

module.exports = { likeApi, [disableLoading]: false };
