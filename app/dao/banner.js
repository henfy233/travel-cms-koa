'use strict';

const { NotFound, Forbidden } = require('lin-mizar');
const { Banner } = require('../models/banner');
const { db } = require('lin-mizar/lin/db');
const Sequelize = require('sequelize');

class BannerDao {
  async getBanner (id) {
    const banner = await Banner.findOne({
      where: {
        id,
        delete_time: null
      }
    });
    return banner;
  }

  async getBannerByKeyword (q) {
    const banner = await Banner.findOne({
      where: {
        title: {
          [Sequelize.Op.like]: `%${q}%`
        },
        delete_time: null
      }
    });
    return banner;
  }

  /**
   * 获取所有Banner
   */
  async getBanners () {
    let sql =
    ' SELECT b.title, b.img, b.url, b.date FROM banner b ORDER BY b.create_time DESC ';
    let banners = await db.query(
      sql,
      {
        type: db.QueryTypes.SELECT
      }
    );
    return banners;
  }

  async createBanner (v) {
    const banner = await Banner.findOne({
      where: {
        title: v.get('body.title'),
        delete_time: null
      }
    });
    if (banner) {
      throw new Forbidden({
        msg: '图书已存在'
      });
    }
    const bk = new Banner();
    bk.title = v.get('body.title');
    bk.author = v.get('body.author');
    bk.summary = v.get('body.summary');
    bk.image = v.get('body.image');
    bk.save();
  }

  async updateBanner (v, id) {
    const banner = await Banner.findByPk(id);
    if (!banner) {
      throw new NotFound({
        msg: '没有找到相关书籍'
      });
    }
    banner.title = v.get('body.title');
    banner.author = v.get('body.author');
    banner.summary = v.get('body.summary');
    banner.image = v.get('body.image');
    banner.save();
  }

  async deleteBanner (id) {
    const banner = await Banner.findOne({
      where: {
        id,
        delete_time: null
      }
    });
    if (!banner) {
      throw new NotFound({
        msg: '没有找到相关书籍'
      });
    }
    banner.destroy();
  }
}

module.exports = { BannerDao };
