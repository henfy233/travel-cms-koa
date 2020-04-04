'use strict';

const {
  LinRouter,
  NotFound,
  disableLoading
} = require('lin-mizar');

const { PositiveIdValidator, SearchValidator } = require('../../validators/common');

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

/**
 * 根据ID获取景点
 */
scenicsApi.get('/:id', async ctx => {
  const v = await new PositiveIdValidator().validate(ctx);
  const id = v.get('path.id');
  const { scenics, arounds, notes, guides } = await scenicsDto.getScenics(id);
  ctx.json({
    scenics,
    arounds,
    notes,
    guides
  });
});

module.exports = { scenicsApi, [disableLoading]: false };
