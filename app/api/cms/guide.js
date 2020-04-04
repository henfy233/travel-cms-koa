/* eslint-disable new-cap */
'use strict';

const {
  LinRouter,
  loginRequired,
  groupRequired,
  NotFound,
  logger
} = require('lin-mizar');

const {
  PaginateValidator,
  PositiveIdValidator,
  SearchValidator
} = require('../../validators/common');

const { GuideDao } = require('../../dao/guide');

const guide = new LinRouter({
  prefix: '/cms/guide'
});

const guideDto = new GuideDao();

guide.linGet(
  'getGuides',
  '/',
  {
    auth: '获取攻略',
    module: '攻略',
    mount: false
  },
  loginRequired,
  async ctx => {
    const v = await new PaginateValidator().validate(ctx);
    const { guides, total } = await guideDto.getCMSAllGuide(
      ctx,
      v.get('query.page'),
      v.get('query.count')
    );
    ctx.json({
      items: guides,
      total: total,
      page: v.get('query.page'),
      count: v.get('query.count'),
      total_page: Math.ceil(total / parseInt(v.get('query.count')))
    });
  }
);

guide.linGet(
  'getGuideByKeyword',
  '/search',
  {
    auth: '根据关键词获取攻略',
    module: '攻略',
    mount: false
  },
  loginRequired,
  async ctx => {
    const v = await new SearchValidator().validate(ctx);
    const guides = await guideDto.getCMSGuideByKeyword(v.get('query.q'));
    if (!guides || guides.length < 1) {
      throw new NotFound({
        msg: '没有找到相关攻略'
      });
    }
    ctx.json(guides);
  }
);

guide.linGet(
  'getGuideById',
  '/:id',
  {
    auth: '根据ID获取攻略',
    module: '攻略',
    mount: false
  },
  loginRequired,
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    const { guide, arounds } = await guideDto.getGuide(id);
    if (!guide) {
      throw new NotFound({
        msg: '没有找到相关攻略'
      });
    }
    ctx.json({
      guide,
      arounds
    });
  }
);

guide.linGet(
  'recommendGuide',
  '/rec/:id',
  {
    auth: '推荐攻略',
    module: '攻略',
    mount: true
  },
  groupRequired,
  logger('管理员推荐了攻略'),
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    await guideDto.recommendGuide(id);
    ctx.success({
      msg: '推荐攻略成功'
    });
  }
);

guide.linGet(
  'disrecommendGuide',
  '/dis/:id',
  {
    auth: '取消推荐攻略',
    module: '攻略',
    mount: true
  },
  groupRequired,
  logger('管理员取消推荐了攻略'),
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    await guideDto.disrecommendGuide(id);
    ctx.success({
      msg: '取消推荐攻略成功'
    });
  }
);

guide.linGet(
  'permitGuide',
  '/per/:id',
  {
    auth: '开放攻略',
    module: '攻略',
    mount: true
  },
  groupRequired,
  logger('管理员开放了攻略'),
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    await guideDto.permitGuide(id);
    ctx.success({
      msg: '开放攻略成功'
    });
  }
);

guide.linGet(
  'prohibitGuide',
  '/pro/:id',
  {
    auth: '封禁攻略',
    module: '攻略',
    mount: true
  },
  groupRequired,
  logger('管理员封禁了攻略'),
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    await guideDto.prohibitGuide(id);
    ctx.success({
      msg: '封禁攻略成功'
    });
  }
);

guide.linDelete(
  'deleteGuide',
  '/:id',
  {
    auth: '删除攻略',
    module: '攻略',
    mount: true
  },
  groupRequired,
  logger('管理员删除了攻略'),
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    await guideDto.deleteGuide(id);
    ctx.success({
      msg: '删除攻略成功'
    });
  }
);

module.exports = { guide };
