'use strict';

const {
  LinRouter,
  NotFound,
  groupRequired,
  disableLoading
} = require('lin-mizar');
const { getSafeParamId } = require('../../libs/util');
const {
  GuideSearchValidator,
  CreateOrUpdateGuideValidator
} = require('../../validators/guide');

const { PositiveIdValidator, PaginateValidator } = require('../../validators/common');

const { GuideNotFound } = require('../../libs/err-code');
const { GuideDao } = require('../../dao/guide');

// guide 的红图实例
const guideApi = new LinRouter({
  prefix: '/v1/guide'
});

// guide 的dao 数据库访问层实例
const guideDto = new GuideDao();

/**
 * 获取所有攻略 包含用户信息
 */
guideApi.get('/guides', async ctx => {
  const v = await new PaginateValidator().validate(ctx);
  const { guides, total } = await guideDto.getGuides(
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
});

/**
 * 根据ID值获取攻略
 */
guideApi.get('/:id', async ctx => {
  const v = await new PositiveIdValidator().validate(ctx);
  const id = v.get('path.id');
  const guide = await guideDto.getGuide(id);
  if (!guide) {
    throw new NotFound({
      msg: '没有找到相关游记'
    });
  }
  ctx.json(guide);
});

guideApi.get('/search/one', async ctx => {
  const v = await new GuideSearchValidator().validate(ctx);
  const guide = await guideDto.getGuideByKeyword(v.get('query.q'));
  if (!guide) {
    throw new GuideNotFound();
  }
  ctx.json(guide);
});

guideApi.post('/', async ctx => {
  const v = await new CreateOrUpdateGuideValidator().validate(ctx);
  await guideDto.createGuide(v);
  ctx.success({
    msg: '新建攻略成功'
  });
});

guideApi.put('/:id', async ctx => {
  const v = await new CreateOrUpdateGuideValidator().validate(ctx);
  const id = getSafeParamId(ctx);
  await guideDto.updateGuide(v, id);
  ctx.success({
    msg: '更新攻略成功'
  });
});

guideApi.linDelete(
  'deleteGuide',
  '/:id',
  {
    auth: '删除攻略',
    module: '攻略',
    mount: true
  },
  groupRequired,
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    await guideDto.deleteGuide(id);
    ctx.success({
      msg: '删除攻略成功'
    });
  }
);

module.exports = { guideApi, [disableLoading]: false };
