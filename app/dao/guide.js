'use strict';

const { NotFound, unsets } = require('lin-mizar');
const { db } = require('lin-mizar/lin/db');
const { Guide } = require('../models/guide');
// const { User } = require('../models/user');
const Sequelize = require('sequelize');

class GuideDao {
  /**
   * 根据页数获取攻略
   * @param {Object} ctx 用户信息
   * @param {int} start 从第几条开始
   * @param {int} count1 每页多少条记录
   */
  async getGuides (ctx, start, count1) {
    let sql =
      'SELECT guide.*,user.`nickname`,user.`avatar`,favor.`id` as liked FROM guide LEFT JOIN favor ON guide.id = favor.art_id LEFT JOIN user ON guide.eId = user.id WHERE';
    let guides = await db.query(
      sql +
        ' guide.delete_time IS NULL Order By guide.create_time Desc LIMIT :count OFFSET :start',
      {
        replacements: {
          count: count1,
          start: start * count1
        },
        type: db.QueryTypes.SELECT
      }
    );
    let sql1 =
      'SELECT COUNT(*) as count FROM guide WHERE guide.delete_time IS NULL';
    let total = await db.query(sql1, {
      type: db.QueryTypes.SELECT
    });
    guides.map(guides => {
      unsets(guides, ['update_time', 'delete_time']);
      // guides.create_time = dayjs(guides.create_time).unix();
      return guides;
    });
    total = total[0]['count'];
    return {
      guides,
      total
    };
  }

  /**
   * 根据ID获取攻略
   * @param {int} id ID号
   */
  async getGuide (id) {
    let sql =
      'SELECT guide.*,user.`nickname`,user.`avatar` FROM guide LEFT JOIN user ON guide.eId = user.id WHERE';
    let guide = await db.query(
      sql +
        ' guide.delete_time IS NULL AND guide.id = :id ',
      {
        replacements: {
          id
        },
        type: db.QueryTypes.SELECT
      }
    );
    guide.map(guide => {
      unsets(guide, ['update_time', 'delete_time']);
      // guides.create_time = dayjs(guides.create_time).unix();
      return guide;
    });
    return guide[0];
  }

  async getGuideByKeyword (q) {
    const guide = await Guide.findOne({
      where: {
        title: {
          [Sequelize.Op.like]: `%${q}%`
        },
        delete_time: null
      }
    });
    return guide;
  }

  /**
   * 获取所有攻略
   */
  // async getGuides () {
  //   let guides = await Guide.findAll({
  //     attributes: [
  //       'id',
  //       'title',
  //       'img',
  //       'praise',
  //       'text',
  //       'create_time',
  //       Sequelize.col('u.nickname'),
  //       Sequelize.col('u.avatar')
  //     ],
  //     where: {
  //       delete_time: null
  //     },
  //     include: [
  //       {
  //         // 这里再传入他，这个对象只是类似一个工厂函数，实际查询的时候findAll会找到最新的结果
  //         association: GuideBelongsToUser,
  //         attributes: []
  //       }
  //     ],
  //     limit: 3,
  //     raw: true
  //   });
  //   return guides;
  // }

  async createGuide (v) {
    const bk = new Guide();
    bk.title = v.get('body.title');
    bk.email = v.get('body.email');
    bk.imageId = v.get('body.imageId');
    bk.content = v.get('body.content');
    bk.save();
  }

  async updateGuide (v, id) {
    const guide = await Guide.findByPk(id);
    if (!guide) {
      throw new NotFound({
        msg: '没有找到相关攻略'
      });
    }
    guide.title = v.get('body.title');
    guide.email = v.get('body.email');
    guide.imageId = v.get('body.imageId');
    guide.content = v.get('body.content');
    guide.save();
  }

  async deleteGuide (id) {
    const guide = await Guide.findOne({
      where: {
        id,
        delete_time: null
      }
    });
    if (!guide) {
      throw new NotFound({
        msg: '没有找到相关攻略'
      });
    }
    guide.destroy();
  }
}

// const GuideBelongsToUser = Guide.belongsTo(User, {
//   // 最外部的作用域就定义一下这个映射关系，这样运行周期里只会执行一次
//   foreignKey: 'eId', targetKey: 'id', as: 'u'
// });

module.exports = { GuideDao };
