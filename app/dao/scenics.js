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
    const scenics = await Scenics.findOne({
      where: {
        id,
        delete_time: null
      }
    });
    let arounds = await Around.findAll({
      attributes: [
        Sequelize.col('s.id'),
        Sequelize.col('s.name'),
        Sequelize.col('s.image')
      ],
      where: {
        sid: scenics.id,
        delete_time: null
      },
      include: [{
        association: AroundBelongsToScenics,
        attributes: []
      }],
      raw: true
    });
    return {
      scenics,
      arounds
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
        'name'
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
      ' SELECT s.id, s.name, s.position, s.image FROM scenics s WHERE s.delete_time IS NULL ';
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
    const bk = new Scenics();
    bk.name = v.get('body.name');
    bk.position = v.get('body.position');
    bk.image = v.get('body.image');
    bk.save();
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
