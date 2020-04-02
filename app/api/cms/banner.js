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
  CreateOrUpdateBannerValidator
} = require('../../validators/banner');

const {
  PaginateValidator,
  PositiveIdValidator
} = require('../../validators/common');

const { BannerDao } = require('../../dao/banner');

const banner = new LinRouter({
  prefix: '/cms/banner'
});

const bannerDto = new BannerDao();

banner.linGet(
  'getBanners',
  '/',
  {
    auth: '获取Banners',
    module: 'Banner',
    mount: false
  },
  loginRequired,
  async ctx => {
    const v = await new PaginateValidator().validate(ctx);
    const { banners, total } = await bannerDto.getCMSBanners(
      ctx,
      v.get('query.page'),
      v.get('query.count')
    );
    ctx.json({
      items: banners,
      total: total,
      page: v.get('query.page'),
      count: v.get('query.count'),
      total_page: Math.ceil(total / parseInt(v.get('query.count')))
    });
  }
);

banner.linGet(
  'getBannerById',
  '/:id',
  {
    auth: '获取Banner',
    module: 'Banner',
    mount: false
  },
  loginRequired,
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    const banner = await bannerDto.getBanner(id);
    if (!banner) {
      throw new NotFound({
        msg: '没有找到相关Banner'
      });
    }
    ctx.json(banner);
  }
);

banner.linPost(
  'addBanner',
  '/',
  {
    auth: '添加Banner',
    module: 'Banner',
    mount: true
  },
  groupRequired,
  logger('管理员添加了Banner'),
  async ctx => {
    const v = await new CreateOrUpdateBannerValidator().validate(ctx);
    await bannerDto.createBanner(v);
    ctx.success({
      msg: '新建Banner成功'
    });
  }
);

banner.linPut(
  'bannerUpdate',
  '/:id',
  {
    auth: '更新Banner',
    module: 'Banner',
    mount: true
  },
  groupRequired,
  logger('管理员更新了Banner'),
  async ctx => {
    const v = await new CreateOrUpdateBannerValidator().validate(ctx);
    const id = getSafeParamId(ctx);
    await bannerDto.updateBanner(v, id);
    ctx.success({
      msg: '更新Banner成功'
    });
  }
);

banner.linDelete(
  'deleteBanner',
  '/:id',
  {
    auth: '删除Banner',
    module: 'Banner',
    mount: true
  },
  groupRequired,
  logger('管理员删除了Banner'),
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    await bannerDto.deleteBanner(id);
    ctx.success({
      msg: '删除Banner成功'
    });
  }
);

module.exports = { banner };
