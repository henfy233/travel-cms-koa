'use strict';

const { NotFound, unsets } = require('lin-mizar');
const { db } = require('lin-mizar/lin/db');
const { Guide } = require('../models/guide');
const Sequelize = require('sequelize');

class GuideDao {
  /**
   * 根据页数获取攻略
   * @param {int} start 从第几条开始
   * @param {int} count1 每页多少条记录
   */
  async getGuides (start, count1) {
    let sql =
      'SELECT guide.*,user.`nickname`,user.`avatar`, (SELECT count(*) FROM comments_info ci WHERE ci.owner_id = guide.id AND ci.type = 200) commentNum FROM guide ';
    let guides = await db.query(
      sql +
        ' LEFT JOIN user ON guide.eid = user.id WHERE guide.delete_time IS NULL Order By guide.create_time Desc LIMIT :count OFFSET :start',
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
   * 发布攻略
   * @param {Object} ctx 用户信息
   * @param {Object} v 发布攻略信息
   */
  async postGuide (ctx, v) {
    const user = ctx.currentUser;
    const bk = new Guide();
    bk.title = v.get('body.title');
    bk.eid = user.id;
    bk.img = v.get('body.img');
    bk.text = v.get('body.text');
    bk.save();
  }

  /**
   * 根据ID获取攻略
   * @param {int} id ID号
   */
  async getGuide (id) {
    let sql =
      'SELECT guide.*,user.`nickname`,user.`avatar` FROM guide LEFT JOIN user ON guide.eid = user.id WHERE';
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

  /**
   * 根据匹配文本查找攻略
   * @param {String} q 匹配文本
   */
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
   * 获取最火攻略
   * @param {object} v 攻略数量
   */
  async getHotGuides (v) {
    const num = v.get('body.num');
    let sql =
      'SELECT guide.id ,guide.eid, guide.title, guide.img, guide.praise, guide.text, guide.create_time, user.`nickname`,user.`avatar`, (SELECT count(*) FROM comments_info ci WHERE ci.owner_id = guide.id AND ci.type = 200) commentNum FROM guide ';
    let guides = await db.query(
      sql +
        ' LEFT JOIN user ON guide.eid = user.id WHERE  guide.delete_time IS NULL Order By guide.praise Desc LIMIT :count ',
      {
        replacements: {
          count: num
        },
        type: db.QueryTypes.SELECT
      }
    );
    return guides;
  }

  /**
   * 根据页数获取攻略
   * @param {Object} ctx 用户信息
   * @param {int} start 从第几条开始
   * @param {int} count1 每页多少条记录
   */
  async getLoginGuides (ctx, start, count1) {
    const user = ctx.currentUser;
    let sql =
      'SELECT guide.*,user.`nickname`,user.`avatar`,favor.`id` as liked, (SELECT count(*) FROM comments_info ci WHERE ci.owner_id = guide.id AND ci.type = 200) commentNum FROM guide ';
    let guides = await db.query(
      sql +
        ' LEFT JOIN favor ON guide.id = favor.art_id AND favor.eid = :id LEFT JOIN user ON guide.eid = user.id WHERE guide.delete_time IS NULL Order By guide.create_time Desc LIMIT :count OFFSET :start',
      {
        replacements: {
          id: user.id,
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
   * 获取最火攻略
   * @param {Object} ctx 用户信息
   * @param {object} v 攻略数量
   */
  async getLoginHotGuides (ctx, v) {
    const num = v.get('body.num');
    const user = ctx.currentUser;
    let sql =
      'SELECT guide.id ,guide.eid, guide.title, guide.img, guide.praise, guide.text, guide.create_time, user.`nickname`,user.`avatar`,  favor.`id` as liked, (SELECT count(*) FROM comments_info ci WHERE ci.owner_id = guide.id AND ci.type = 200) commentNum FROM guide ';
    let guides = await db.query(
      sql +
        ' LEFT JOIN favor ON guide.id = favor.art_id AND favor.eid = :id LEFT JOIN user ON guide.eid = user.id WHERE  guide.delete_time IS NULL Order By guide.praise Desc LIMIT :count ',
      {
        replacements: {
          id: user.id,
          count: num
        },
        type: db.QueryTypes.SELECT
      }
    );
    return guides;
  }

  /**
   * 创建攻略
   * @param {Object} v 信息
   */
  async createGuide (v) {
    const bk = new Guide();
    bk.name = v.get('body.name');
    bk.position = v.get('body.position');
    bk.image = v.get('body.image');
    bk.save();
  }

  /**
   * 更新攻略
   * @param {Object} v 信息
   * @param {int} id ID号
   */
  async updateGuide (v, id) {
    const guide = await Guide.findByPk(id);
    if (!guide) {
      throw new NotFound({
        msg: '没有找到相关攻略'
      });
    }
    guide.name = v.get('body.name');
    guide.position = v.get('body.position');
    guide.image = v.get('body.image');
    guide.save();
  }

  /**
   * 删除攻略
   * @param {int} id ID号
   */
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
//   foreignKey: eid', targetKey: 'id', as: 'u'
// });

module.exports = { GuideDao };
