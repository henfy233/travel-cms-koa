'use strict';

const {
  LinRouter,
  NotFound,
  groupRequired,
  loginRequired,
  disableLoading,
  logger
} = require('lin-mizar');
const { getSafeParamId } = require('../../libs/util');
const {
  CreateOrUpdateScenicsValidator
} = require('../../validators/scenics');

const { PositiveIdValidator, SearchValidator, PaginateValidator } = require('../../validators/common');

const { ScenicsDao } = require('../../dao/scenics');

// scenics 的红图实例
const scenicsApi = new LinRouter({
  prefix: '/v1/scenics'
});

// scenics 的dao 数据库访问层实例
const scenicsDto = new ScenicsDao();

scenicsApi.get('/', async ctx => {
  const scenics = await scenicsDto.getAllScenics();
  if (!scenics || scenics.length < 1) {
    throw new NotFound({
      msg: '没有找到相关景点'
    });
  }
  ctx.json(scenics);
});

scenicsApi.get('/search', async ctx => {
  const v = await new SearchValidator().validate(ctx);
  const scenics = await scenicsDto.getScenicsByKeyword(v.get('query.q'));
  if (!scenics || scenics.length < 1) {
    throw new NotFound({
      msg: '没有找到相关景点'
    });
  }
  ctx.json(scenics);
});

scenicsApi.get('/hotScenics', async ctx => {
  const num = 3;
  const scenics = await scenicsDto.getHotScenics(num);
  if (!scenics || scenics.length < 1) {
    throw new NotFound({
      msg: '没有找到相关景点'
    });
  }
  ctx.json(scenics);
});

// -----------------------CMS------------------------------------

scenicsApi.get('/cms/', loginRequired, async ctx => {
  const v = await new PaginateValidator().validate(ctx);
  const { scenics, total } = await scenicsDto.getCMSAllScenics(
    ctx,
    v.get('query.page'),
    v.get('query.count')
  );
  if (!scenics || scenics.length < 1) {
    throw new NotFound({
      msg: '没有找到相关景点'
    });
  }
  ctx.json({
    items: scenics,
    total: total,
    page: v.get('query.page'),
    count: v.get('query.count'),
    total_page: Math.ceil(total / parseInt(v.get('query.count')))
  });
});

scenicsApi.linPost(
  'scenicsAdd',
  '/',
  {
    auth: '添加景点',
    module: '景点',
    mount: false
  },
  loginRequired,
  logger('管理员新建了景点'),
  async ctx => {
    const v = await new CreateOrUpdateScenicsValidator().validate(ctx);
    await scenicsDto.createScenics(v);
    ctx.success({
      msg: '新建景点成功'
    });
  }
);

scenicsApi.linPut(
  'scenicsUpdate',
  '/:id',
  {
    auth: '更新景点',
    module: '景点',
    mount: false
  },
  loginRequired,
  logger('管理员更新了景点'),
  async ctx => {
    const v = await new CreateOrUpdateScenicsValidator().validate(ctx);
    const id = getSafeParamId(ctx);
    await scenicsDto.updateScenics(v, id);
    ctx.success({
      msg: '更新景点成功'
    });
  }
);

scenicsApi.linDelete(
  'deleteScenics',
  '/:id',
  {
    auth: '删除景点',
    module: '景点',
    mount: true
  },
  groupRequired,
  logger('管理员删除了景点'),
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    await scenicsDto.deleteScenics(id);
    ctx.success({
      msg: '删除景点成功'
    });
  }
);

/**
 * 根据ID获取景点
 */
scenicsApi.get('/:id', async ctx => {
  const v = await new PositiveIdValidator().validate(ctx);
  const id = v.get('path.id');
  const { scenics, arounds } = await scenicsDto.getScenics(id);
  if (!scenics) {
    throw new NotFound({
      msg: '没有找到相关景点'
    });
  }
  ctx.json({
    scenics,
    arounds
  });
});

module.exports = { scenicsApi, [disableLoading]: false };
