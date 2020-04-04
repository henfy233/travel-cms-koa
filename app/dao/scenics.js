'use strict';

const { NotFound, Forbidden } = require('lin-mizar');
const { db } = require('lin-mizar/lin/db');
const { Scenics } = require('../models/scenics');
const { Around } = require('../models/around');
const Sequelize = require('sequelize');

class ScenicsDao {
  /**
   * 根据ID获取景点
   * @param {int} id 景点ID
   */
  async getScenics (id) {
    let sql = 'SELECT s.id, s.name, s.position, s.image, s.praise FROM scenics s WHERE ';
    let scenicss = await db.query(
      sql +
      ' s.id = :id AND s.delete_time IS NULL ',
      {
        replacements: {
          id
        },
        type: db.QueryTypes.SELECT
      }
    );
    if (!scenicss) {
      throw new NotFound({
        msg: '没有找到相关景点'
      });
    }
    let scenics = scenicss[0];
    let arounds = await Around.findAll({
      attributes: [
        Sequelize.col('s.id'),
        Sequelize.col('s.name'),
        Sequelize.col('s.image')
      ],
      where: {
        sid: id,
        delete_time: null
      },
      include: [{
        association: AroundBelongsToScenics,
        attributes: []
      }],
      raw: true
    });
    let sql1 = 'SELECT n.id, n.title, n.img FROM art_around a, note n WHERE a.oid = n.id AND a.type = 100 ';
    let notes = await db.query(
      sql1 +
        '  AND a.aid = :id AND n.delete_time IS NULL ',
      {
        replacements: {
          id: id
        },
        type: db.QueryTypes.SELECT
      }
    );
    let sql2 = 'SELECT g.id, g.title, g.img FROM art_around a, guide g WHERE a.oid = g.id AND a.type = 200 ';
    let guides = await db.query(
      sql2 +
        '  AND a.aid = :id AND g.delete_time IS NULL  ',
      {
        replacements: {
          id: id
        },
        type: db.QueryTypes.SELECT
      }
    );
    return {
      scenics,
      arounds,
      notes,
      guides
    };
  }

  /**
   * 搜索景点
   * @param {String} q 关键词
   */
  async getScenicsByKeyword (q) {
    let sql = 'SELECT s.id, s.name, s.position, s.image, s.praise FROM scenics s WHERE s.delete_time IS NULL AND ';
    let scenics = await db.query(
      sql +
        ' s.name LIKE :q ',
      {
        replacements: {
          q: '%' + q + '%'
        },
        type: db.QueryTypes.SELECT
      }
    );
    return scenics;
  }

  /**
   * 获取所有景点
   */
  async getAllScenics () {
    const scenics = await Scenics.findAll({
      attributes: [
        'id',
        'name',
        'image'
      ],
      where: {
        delete_time: null
      }
    });
    return scenics;
  }

  /**
   * 获取最火景点
   * @param {int} num 几个景点
   */
  async getHotScenics (num) {
    let sql =
      'SELECT s.id, s.name, s.image FROM scenics s WHERE s.delete_time IS NULL ORDER BY s.praise DESC ';
    let scenics = await db.query(
      sql +
        ' LIMIT :num ',
      {
        replacements: {
          num: num
        },
        type: db.QueryTypes.SELECT
      }
    );
    return scenics;
  }

  /**
   * CMS 获取所有景点
   * @param {Object} ctx 用户信息
   * @param {int} start 从第几条开始
   * @param {int} count1 每页多少条记录
   */
  async getCMSAllScenics (ctx, start, count1) {
    let sql =
      ' SELECT s.id, s.name, s.position, s.image, a.arounds FROM scenics s LEFT JOIN (SELECT a.sid, GROUP_CONCAT(s.name SEPARATOR \',\') arounds FROM scenics s, around a WHERE s.id = a.aid AND s.delete_time IS NULL GROUP BY a.sid) a ON s.id = a.sid WHERE s.delete_time IS NULL ';
    let scenics = await db.query(
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
      'SELECT COUNT(*) as count FROM scenics s WHERE s.delete_time IS NULL';
    let total = await db.query(sql1, {
      type: db.QueryTypes.SELECT
    });
    total = total[0]['count'];
    return {
      scenics,
      total
    };
  }

  /**
   * CMS 根据ID获取景点
   * @param {int} id 景点ID
   */
  async getCMSScenics (id) {
    let sql =
      ' SELECT s.id, s.name, s.position, s.image FROM scenics s WHERE s.delete_time IS NULL ';
    let scenicss = await db.query(
      sql +
      ' AND s.id = :id ',
      {
        replacements: {
          id
        },
        type: db.QueryTypes.SELECT
      }
    );
    let scenics = scenicss[0];
    return scenics;
  }

  /**
   * CMS 创建景点
   * @param {Object} v 返回信息
   */
  async createScenics (v) {
    const scenics = await Scenics.findOne({
      where: {
        name: v.get('body.name'),
        delete_time: null
      }
    });
    if (scenics) {
      throw new Forbidden({
        msg: '景点已存在'
      });
    }
    const arounds = v.get('body.arounds');
    return db.transaction(async t => {
      const scenics = await Scenics.create({
        name: v.get('body.name'),
        position: v.get('body.position'),
        image: v.get('body.image')
      }, {
        transaction: t
      });
      for (var i = 0; i < arounds.length; i++) {
        await Around.create({
          sid: scenics.id,
          aid: arounds[i]
        }, {
          transaction: t
        });
      }
    });
  }

  /**
   * CMS 根据景点ID修改景点信息
   * @param {int} id 景点ID
   * @param {Object} v 景点信息
   */
  async updateScenics (v, id) {
    const scenics = await Scenics.findByPk(id);
    if (!scenics) {
      throw new NotFound({
        msg: '没有找到相关景点'
      });
    }
    scenics.name = v.get('body.name');
    scenics.position = v.get('body.position');
    scenics.image = v.get('body.image');
    scenics.save();
  }

  /**
   * CMS 根据景点ID删除景点
   * @param {int} id 景点ID
   */
  async deleteScenics (id) {
    const scenics = await Scenics.findOne({
      where: {
        id,
        delete_time: null
      }
    });
    if (!scenics) {
      throw new NotFound({
        msg: '没有找到相关景点'
      });
    }
    scenics.destroy();
  }
}

const AroundBelongsToScenics = Around.belongsTo(Scenics, {
  // 最外部的作用域就定义一下这个映射关系，这样运行周期里只会执行一次
  foreignKey: 'aid', targetKey: 'id', as: 's'
});

module.exports = { ScenicsDao };
