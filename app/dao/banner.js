'use strict';

const { NotFound } = require('lin-mizar');
const { Banner } = require('../models/banner');
const { db } = require('lin-mizar/lin/db');
const Sequelize = require('sequelize');

class BannerDao {
  /**
   * 根据ID获取Banner
   * @param {int} id BannerID
   */
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
   * @param {Object} ctx Banner信息
   * @param {int} start 从第几条开始
   * @param {int} count1 每页多少条记录
   */
  async getCMSBanners (ctx, start, count1) {
    let sql =
      ' SELECT b.id, b.title, b.img, b.url, b.date FROM banner b WHERE b.delete_time IS NULL ';
    let banners = await db.query(
      sql +
      ' LIMIT :count OFFSET :start',
      {
        replacements: {
          count: count1,
          start: start * count1
        },
        type: db.QueryTypes.SELECT
      }
    );
    let sql1 =
      'SELECT COUNT(*) as count FROM banner b WHERE b.delete_time IS NULL';
    let total = await db.query(sql1, {
      type: db.QueryTypes.SELECT
    });
    total = total[0]['count'];
    return {
      banners,
      total
    };
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

  /**
   * CMS 创建Banner
   * @param {Object} v 返回信息
   */
  async createBanner (v) {
    const bk = new Banner();
    bk.title = v.get('body.title');
    bk.img = v.get('body.img');
    bk.url = v.get('body.url');
    bk.date = v.get('body.date');
    bk.save();
  }

  /**
   * 根据ID修改信息
   * @param {int} id BannerID
   * @param {Object} v 修改信息
   */
  async updateBanner (v, id) {
    const banner = await Banner.findByPk(id);
    if (!banner) {
      throw new NotFound({
        msg: '没有找到相关Banner'
      });
    }
    banner.title = v.get('body.title');
    banner.img = v.get('body.img');
    banner.url = v.get('body.url');
    banner.date = v.get('body.date');
    banner.save();
  }

  /**
   * 根据ID删除Banner
   * @param {int} id BannerID
   */
  async deleteBanner (id) {
    const banner = await Banner.findOne({
      where: {
        id,
        delete_time: null
      }
    });
    if (!banner) {
      throw new NotFound({
        msg: '没有找到相关Banner'
      });
    }
    banner.destroy();
  }
}

module.exports = { BannerDao };
