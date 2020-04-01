'use strict';

const {
  LinRouter,
  NotFound,
  loginRequired,
  groupRequired,
  disableLoading
} = require('lin-mizar');

const { getSafeParamId } = require('../../libs/util');

const {
  PositiveNumValidator
} = require('../../validators/guide');

const {
  loginRequire
} = require('../../libs/jwt');

const {
  PositiveIdValidator,
  PaginateValidator,
  SearchValidator,
  PostArticleValidator
} = require('../../validators/common');

const { GuideDao } = require('../../dao/guide');

// guide 的红图实例
const guideApi = new LinRouter({
  prefix: '/v1/guide'
});

// guide 的dao 数据库访问层实例
const guideDto = new GuideDao();

guideApi.linPost(
  'addGuide',
  '/',
  {
    auth: '发布攻略',
    module: '用户',
    mount: false
  },
  loginRequire,
  async ctx => {
    const v = await new PostArticleValidator().validate(ctx);
    await guideDto.postGuide(ctx, v);
    ctx.success({
      msg: '发布攻略成功'
    });
  }
);

/**
 * 获取所有攻略 包含用户信息
 */
guideApi.get('/guides', async ctx => {
  const v = await new PaginateValidator().validate(ctx);
  const { guides, total } = await guideDto.getGuides(
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
 * 获取几个最火攻略 num个
 */
guideApi.post('/hotGuides', async ctx => {
  const v = await new PositiveNumValidator().validate(ctx);
  const guides = await guideDto.getHotGuides(v);
  if (!guides || guides.length < 1) {
    throw new NotFound({
      msg: '没有找到相关攻略'
    });
  }
  ctx.json(guides);
});

guideApi.linGet(
  'getAllGuides',
  '/login/guides',
  {
    auth: '获取所有攻略',
    module: '用户',
    mount: false
  },
  loginRequire,
  async ctx => {
    const v = await new PaginateValidator().validate(ctx);
    const { guides, total } = await guideDto.getLoginGuides(
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

guideApi.linPost(
  'getHotGuides',
  '/login/hotGuides',
  {
    auth: '获取最火游记',
    module: '用户',
    mount: false
  },
  loginRequire,
  async ctx => {
    const v = await new PositiveNumValidator().validate(ctx);
    const guides = await guideDto.getLoginHotGuides(ctx, v);
    if (!guides || guides.length < 1) {
      throw new NotFound({
        msg: '没有找到相关攻略'
      });
    }
    ctx.json(guides);
  }
);

guideApi.linGet(
  'getMyGuides',
  '/myGuides',
  {
    auth: '获取我的攻略',
    module: '用户',
    mount: false
  },
  loginRequire,
  async ctx => {
    const guides = await guideDto.getMyGuides(ctx);
    if (!guides || guides.length < 1) {
      throw new NotFound({
        msg: '你还没发表攻略'
      });
    }
    ctx.json(guides);
  }
);

guideApi.get('/search', async ctx => {
  const v = await new SearchValidator().validate(ctx);
  const guides = await guideDto.getGuideByKeyword(v.get('query.q'));
  if (!guides || guides.length < 1) {
    throw new NotFound({
      msg: '没有找到相关攻略'
    });
  }
  ctx.json(guides);
});

guideApi.linDelete(
  'deleteMyGuide',
  '/myGuides/:id',
  {
    auth: '删除我的攻略',
    module: '攻略',
    mount: true
  },
  loginRequire,
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    await guideDto.deleteMyGuide(ctx, id);
    ctx.success({
      msg: '删除攻略成功'
    });
  }
);

// -----------------------CMS------------------------------------

guideApi.get('/cms/', loginRequired, async ctx => {
  const v = await new PaginateValidator().validate(ctx);
  const { guides, total } = await guideDto.getCMSAllGuide(
    ctx,
    v.get('query.page'),
    v.get('query.count')
  );
  if (!guides || guides.length < 1) {
    throw new NotFound({
      msg: '没有找到相关攻略'
    });
  }
  ctx.json({
    items: guides,
    total: total,
    page: v.get('query.page'),
    count: v.get('query.count'),
    total_page: Math.ceil(total / parseInt(v.get('query.count')))
  });
});

guideApi.get('/cms/search', loginRequired, async ctx => {
  const v = await new SearchValidator().validate(ctx);
  const guides = await guideDto.getCMSGuideByKeyword(v.get('query.q'));
  if (!guides || guides.length < 1) {
    throw new NotFound({
      msg: '没有找到相关攻略'
    });
  }
  ctx.json(guides);
});

guideApi.post('/', async ctx => {
  const v = await new PostArticleValidator().validate(ctx);
  await guideDto.createGuide(ctx, v);
  ctx.success({
    msg: '新建攻略成功'
  });
});

guideApi.put('/:id', async ctx => {
  // console.log(ctx);
  const v = await new PostArticleValidator().validate(ctx);
  const id = getSafeParamId(ctx);
  await guideDto.updateGuide(v, id);
  ctx.success({
    msg: '更新攻略成功'
  });
});

guideApi.linDelete(
  'permitGuide',
  '/per/:id',
  {
    auth: '开放攻略',
    module: '攻略',
    mount: true
  },
  groupRequired,
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    await guideDto.permitGuide(id);
    ctx.success({
      msg: '开放攻略成功'
    });
  }
);

guideApi.linDelete(
  'prohibitGuide',
  '/pro/:id',
  {
    auth: '封禁攻略',
    module: '攻略',
    mount: true
  },
  groupRequired,
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    await guideDto.prohibitGuide(id);
    ctx.success({
      msg: '封禁攻略成功'
    });
  }
);

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

/**
 * 根据ID值获取攻略
 */
guideApi.get('/:id', async ctx => {
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
});

module.exports = { guideApi, [disableLoading]: false };
