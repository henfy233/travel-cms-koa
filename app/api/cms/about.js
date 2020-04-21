/* eslint-disable camelcase */
/* eslint-disable new-cap */
'use strict';

const {
  LinRouter,
  loginRequired
  // NotFound
} = require('lin-mizar');
// const { getSafeParamId } = require('../../libs/util');
// const {
//   CreateOrUpdateAboutValidator
// } = require('../../validators/About');

// const {
//   PaginateValidator,
//   PositiveIdValidator
// } = require('../../validators/common');

const { AboutDao } = require('../../dao/about');

const about = new LinRouter({
  prefix: '/cms/about'
});

const aboutDto = new AboutDao();

/**
 * CMS 获取总用户数
 */
about.get('/', loginRequired, async ctx => {
  const {
    total_user,
    updatem_user,
    updated_user,
    banner_num,
    scenics_num,
    note_num,
    guide_num
  } = await aboutDto.getAllData();
  ctx.json({
    total_user,
    updatem_user,
    updated_user,
    banner_num,
    scenics_num,
    note_num,
    guide_num
  });
});

// /**
//  * CMS 获取新增用户数 (月)
//  */
// about.get('/updatem_user', loginRequired, async ctx => {
//   const num = await aboutDto.getUpdateMUser();
//   ctx.json(num);
// });

// /**
//  * CMS 获取新增用户数 (日)
//  */
// about.get('/updated_user', loginRequired, async ctx => {
//   const num = await aboutDto.getUpdateDUser();
//   ctx.json(num);
// });

module.exports = { about };