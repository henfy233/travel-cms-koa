'use strict';

const {
  LinRouter,
  NotFound,
  groupRequired,
  disableLoading
} = require('lin-mizar');
const { getSafeParamId } = require('../../libs/util');
const {
  // ScenicsSearchValidator,
  CreateOrUpdateScenicsValidator
} = require('../../validators/scenics');

const { PositiveIdValidator } = require('../../validators/common');

const { ScenicsDao } = require('../../dao/scenics');

// scenics 的红图实例
const scenicsApi = new LinRouter({
  prefix: '/v1/scenics'
});

// scenics 的dao 数据库访问层实例
const scenicsDto = new ScenicsDao();

/**
 * 根据ID获取旅行地
 */
scenicsApi.get('/:id', async ctx => {
  const v = await new PositiveIdValidator().validate(ctx);
  const id = v.get('path.id');
  const { scenics, arounds } = await scenicsDto.getScenics(id);
  if (!scenics) {
    throw new NotFound({
      msg: '没有找到相关旅游地'
    });
  }
  ctx.json({
    scenics,
    arounds
  });
});

scenicsApi.get('/', async ctx => {
  const scenics = await scenicsDto.getAllScenics();
  // if (!books || books.length < 1) {
  //   throw new NotFound({
  //     msg: '没有找到相关书籍'
  //   });
  // }
  ctx.json(scenics);
});

// bookApi.get('/search/one', async ctx => {
//   const v = await new BookSearchValidator().validate(ctx);
//   const book = await bookDto.getBookByKeyword(v.get('query.q'));
//   if (!book) {
//     throw new BookNotFound();
//   }
//   ctx.json(book);
// });

scenicsApi.post('/', async ctx => {
  const v = await new CreateOrUpdateScenicsValidator().validate(ctx);
  await scenicsDto.createScenics(v);
  ctx.success({
    msg: '新建旅游地成功'
  });
});

scenicsApi.put('/:id', async ctx => {
  // console.log(ctx);
  const v = await new CreateOrUpdateScenicsValidator().validate(ctx);
  const id = getSafeParamId(ctx);
  await scenicsDto.updateScenics(v, id);
  ctx.success({
    msg: '更新旅游地成功'
  });
});

scenicsApi.linDelete(
  'deleteScenics',
  '/:id',
  {
    auth: '删除旅游地',
    module: '旅游地',
    mount: true
  },
  groupRequired,
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    await scenicsDto.deleteScenics(id);
    ctx.success({
      msg: '删除旅游地成功'
    });
  }
);

module.exports = { scenicsApi, [disableLoading]: false };
