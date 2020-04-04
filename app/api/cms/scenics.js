/* eslint-disable new-cap */
'use strict';

const {
  LinRouter,
  loginRequired,
  groupRequired,
  NotFound,
  logger
} = require('lin-mizar');
const { getSafeParamId } = require('../../libs/util');
const {
  CreateOrUpdateScenicsValidator
} = require('../../validators/scenics');

const {
  PaginateValidator,
  PositiveIdValidator
} = require('../../validators/common');

const { ScenicsDao } = require('../../dao/scenics');

const scenics = new LinRouter({
  prefix: '/cms/scenics'
});

const scenicsDto = new ScenicsDao();

scenics.linGet(
  'getScenicss',
  '/',
  {
    auth: '获取景点',
    module: '景点',
    mount: false
  },
  loginRequired,
  async ctx => {
    const v = await new PaginateValidator().validate(ctx);
    const { scenics, total } = await scenicsDto.getCMSAllScenics(
      ctx,
      v.get('query.page'),
      v.get('query.count')
    );
    ctx.json({
      items: scenics,
      total: total,
      page: v.get('query.page'),
      count: v.get('query.count'),
      total_page: Math.ceil(total / parseInt(v.get('query.count')))
    });
  }
);

scenics.linGet(
  'getScenicsById',
  '/:id',
  {
    auth: '根据ID获取景点',
    module: '景点',
    mount: false
  },
  loginRequired,
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    const scenics = await scenicsDto.getCMSScenics(id);
    if (!scenics) {
      throw new NotFound({
        msg: '没有找到相关景点'
      });
    }
    ctx.json(scenics);
  }
);

scenics.linPost(
  'scenicsAdd',
  '/',
  {
    auth: '添加景点',
    module: '景点',
    mount: true
  },
  groupRequired,
  logger('管理员添加了景点'),
  async ctx => {
    const v = await new CreateOrUpdateScenicsValidator().validate(ctx);
    await scenicsDto.createScenics(v);
    ctx.success({
      msg: '新建景点成功'
    });
  }
);

scenics.linPut(
  'scenicsUpdate',
  '/:id',
  {
    auth: '更新景点',
    module: '景点',
    mount: true
  },
  groupRequired,
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

scenics.linDelete(
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

module.exports = { scenics };
