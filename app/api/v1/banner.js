'use strict';

const {
  LinRouter,
  NotFound,
  // groupRequired,
  disableLoading
} = require('lin-mizar');
// const { getSafeParamId } = require('../../libs/util');
// const {
//   BannerSearchValidator,
//   CreateOrUpdateBannerValidator
// } = require('../../validators/banner');

// const { PositiveIdValidator } = require('../../validators/common');

const { BannerDao } = require('../../dao/banner');

// banner 的红图实例
const bannerApi = new LinRouter({
  prefix: '/v1/banner'
});

// banner 的dao 数据库访问层实例
const bannerDto = new BannerDao();

// bannerApi.get('/:id', async ctx => {
//   const v = await new PositiveIdValidator().validate(ctx);
//   const id = v.get('path.id');
//   const banner = await bannerDto.getBanner(id);
//   if (!banner) {
//     throw new NotFound({
//       msg: '没有找到相关Banner'
//     });
//   }
//   ctx.json(banner);
// });

bannerApi.get('/', async ctx => {
  const banners = await bannerDto.getBanners();
  if (!banners || banners.length < 1) {
    throw new NotFound({
      msg: '没有找到相关Banner'
    });
  }
  ctx.json(banners);
});

// bannerApi.get('/search/one', async ctx => {
//   const v = await new BannerSearchValidator().validate(ctx);
//   const banner = await bannerDto.getBannerByKeyword(v.get('query.q'));
//   if (!banner) {
//     throw new NotFound({
//       msg: '没有找到相关Banner'
//     });
//   }
//   ctx.json(banner);
// });

// bannerApi.post('/', async ctx => {
//   const v = await new CreateOrUpdateBannerValidator().validate(ctx);
//   await bannerDto.createBanner(v);
//   ctx.success({
//     msg: '新建Banner成功'
//   });
// });

// bannerApi.put('/:id', async ctx => {
//   const v = await new CreateOrUpdateBannerValidator().validate(ctx);
//   const id = getSafeParamId(ctx);
//   await bannerDto.updateBanner(v, id);
//   ctx.success({
//     msg: '更新Banner成功'
//   });
// });

// bannerApi.linDelete(
//   'deleteBanner',
//   '/:id',
//   {
//     auth: '删除Banner',
//     module: 'Banner',
//     mount: true
//   },
//   groupRequired,
//   async ctx => {
//     const v = await new PositiveIdValidator().validate(ctx);
//     const id = v.get('path.id');
//     await bannerDto.deleteBanner(id);
//     ctx.success({
//       msg: '删除Banner成功'
//     });
//   }
// );

module.exports = { bannerApi, [disableLoading]: false };
