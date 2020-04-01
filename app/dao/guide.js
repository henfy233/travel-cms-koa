'use strict';

const { NotFound, unsets } = require('lin-mizar');
const { db } = require('lin-mizar/lin/db');
const { Guide } = require('../models/guide');
const { ArtAround } = require('../models/art_around.js');
const dayjs = require('dayjs');

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
    const arounds = v.get('body.arounds');
    return db.transaction(async t => {
      const guide = await Guide.create({
        title: v.get('body.title'),
        eid: user.id,
        img: v.get('body.img'),
        text: v.get('body.text')
      }, {
        transaction: t
      });
      for (var i = 0; i < arounds.length; i++) {
        await ArtAround.create({
          oid: guide.id,
          type: 200,
          aid: arounds[i]
        }, {
          transaction: t
        });
      }
      await user.increment('guides', {
        by: 1,
        transaction: t
      });
    });
  }

  /**
   * 根据ID获取攻略
   * @param {int} id ID号
   */
  async getGuide (id) {
    let sql =
      ' SELECT g.id, u.nickname, u.avatar, g.title, g.eid, g.img, g.text, g.create_time FROM guide g LEFT JOIN user u ON g.eid = u.id WHERE ';
    let guides = await db.query(
      sql +
        ' g.delete_time IS NULL AND g.id = :id ',
      {
        replacements: {
          id
        },
        type: db.QueryTypes.SELECT
      }
    );
    let guide = guides[0];
    let sql1 =
      ' SELECT s.id, s.name, s.image FROM scenics s, art_around a WHERE s.id = a.aid AND s.delete_time IS NULL AND ';
    let arounds = await db.query(
      sql1 +
        ' a.oid = :id AND a.type = 200 ',
      {
        replacements: {
          id: guide.id
        },
        type: db.QueryTypes.SELECT
      }
    );
    return {
      guide,
      arounds
    };
  }

  /**
   * 获取我的攻略
   * @param {object} ctx 用户信息
   */
  async getMyGuides (ctx) {
    const user = ctx.currentUser;
    let sql =
      'SELECT guide.id ,guide.eid, guide.title, guide.img, guide.praise, guide.text, guide.create_time, user.`nickname`,user.`avatar`, (SELECT count(*) FROM comments_info ci WHERE ci.owner_id = guide.id AND ci.type = 200) commentNum FROM guide, user ';
    let guides = await db.query(
      sql +
        ' WHERE guide.eid = `user`.id AND `user`.id = :id AND guide.delete_time IS NULL Order By guide.create_time Desc ',
      {
        replacements: {
          id: user.id
        },
        type: db.QueryTypes.SELECT
      }
    );
    return guides;
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
   * 根据匹配文本查找攻略
   * @param {String} q 匹配文本
   */
  async getGuideByKeyword (q) {
    let sql =
    'SELECT g.id, g.title, g.eid, g.img, g.praise, g.text, g.create_time,  u.`nickname`,u.`avatar`, (SELECT count(*) FROM comments_info ci WHERE ci.owner_id = g.id AND ci.type = 200) commentNum FROM guide g, user u ';
    let guides = await db.query(
      sql +
        ' WHERE g.eid = u.id AND g.delete_time IS NULL AND g.title LIKE :q Order By g.create_time Desc ',
      {
        replacements: {
          q: '%' + q + '%'
        },
        type: db.QueryTypes.SELECT
      }
    );
    return guides;
  }

  /**
   * 删除我的攻略
   * @param {object} ctx 用户信息
   * @param {int} id ID号
   */
  async deleteMyGuide (ctx, id) {
    const user = ctx.currentUser;
    const guide = await Guide.findOne({
      where: {
        id,
        eid: user.id,
        delete_time: null
      }
    });
    if (!guide) {
      throw new NotFound({
        msg: '没有找到相关攻略'
      });
    }
    return db.transaction(async t => {
      await guide.destroy({
        force: true,
        transaction: t
      });
      await user.decrement('guides', {
        by: 1,
        transaction: t
      });
    });
  }

  /**
   * CMS 获取所有攻略
   * @param {Object} ctx 用户信息
   * @param {int} start 从第几条开始
   * @param {int} count1 每页多少条记录
   */
  async getCMSAllGuide (ctx, start, count1) {
    let sql =
      ' SELECT g.id, g.title, u.email, u.nickname, g.img, g.praise, g.delete_time as isDelete, g.create_time FROM guide g, user u WHERE g.eid = u.id Order By g.create_time Desc';
    let guides = await db.query(
      sql +
      ' LIMIT :count OFFSET :start ',
      {
        replacements: {
          count: count1,
          start: start * count1
        },
        type: db.QueryTypes.SELECT
      }
    );
    guides.map(guide => {
      guide.create_time = dayjs(guide.create_time).format('YYYY-MM-DD dddd HH:mm:ss A');
      return guide;
    });
    let sql1 =
      'SELECT COUNT(*) as count FROM guide g';
    let total = await db.query(sql1, {
      type: db.QueryTypes.SELECT
    });
    total = total[0]['count'];
    return {
      guides,
      total
    };
  }

  /**
   * 根据匹配文本查找攻略
   * @param {String} q 匹配文本
   */
  async getCMSGuideByKeyword (q) {
    let sql =
      ' SELECT g.id, g.title, u.email, u.nickname, g.img, g.praise, g.delete_time as isDelete, g.create_time FROM guide g, user u ';
    let guides = await db.query(
      sql +
      ' WHERE g.eid = u.id AND g.title LIKE :q ',
      {
        replacements: {
          q: '%' + q + '%'
        },
        type: db.QueryTypes.SELECT
      }
    );
    guides.map(guide => {
      guide.create_time = dayjs(guide.create_time).format('YYYY-MM-DD dddd HH:mm:ss A');
      return guide;
    });
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
   * 开放攻略
   * @param {int} id ID号
   */
  async permitGuide (id) {
    await Guide.restore({
      where: {
        id
      }
    });
  }

  /**
   * 封禁攻略
   * @param {int} id ID号
   */
  async prohibitGuide (id) {
    const guide = await Guide.findOne({
      where: {
        id
      }
    });
    if (!guide) {
      throw new NotFound({
        msg: '没有找到相关攻略'
      });
    }
    guide.destroy();
  }

  /**
   * 彻底删除攻略
   * @param {int} id ID号
   */
  async deleteGuide (id) {
    await Guide.destroy({
      where: {
        id
      }
    }, { force: true });
  }
}

// const GuideBelongsToUser = Guide.belongsTo(User, {
//   // 最外部的作用域就定义一下这个映射关系，这样运行周期里只会执行一次
//   foreignKey: eid', targetKey: 'id', as: 'u'
// });

module.exports = { GuideDao };
