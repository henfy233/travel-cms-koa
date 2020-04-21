/* eslint-disable camelcase */
'use strict';

// const { NotFound } = require('lin-mizar');
// const { Banner } = require('../models/banner');
const { db } = require('lin-mizar/lin/db');
// const Sequelize = require('sequelize');

class AboutDao {
  /**
   * CMS 获取全部数据
   */
  async getAllData () {
    let sql =
      'SELECT COUNT(*) as count FROM user u WHERE u.delete_time IS NULL';
    let total_user = await db.query(sql, {
      type: db.QueryTypes.SELECT
    });
    total_user = total_user[0]['count'];
    sql =
      ' SELECT COUNT(*) as count FROM user u WHERE u.delete_time IS NULL AND DATE_SUB(CURDATE(), INTERVAL 30 DAY) <= date(u.create_time) ';
    let updatem_user = await db.query(sql, {
      type: db.QueryTypes.SELECT
    });
    updatem_user = updatem_user[0]['count'];
    sql =
      ' SELECT COUNT(*) as count FROM user u WHERE u.delete_time IS NULL AND to_days(u.create_time) = to_days(now()) ';
    let updated_user = await db.query(sql, {
      type: db.QueryTypes.SELECT
    });
    updated_user = updated_user[0]['count'];
    sql =
      ' SELECT COUNT(*) as count FROM banner b WHERE b.delete_time IS NULL ';
    let banner_num = await db.query(sql, {
      type: db.QueryTypes.SELECT
    });
    banner_num = banner_num[0]['count'];
    sql =
      ' SELECT COUNT(*) as count FROM scenics s WHERE s.delete_time IS NULL ';
    let scenics_num = await db.query(sql, {
      type: db.QueryTypes.SELECT
    });
    scenics_num = scenics_num[0]['count'];
    sql =
      ' SELECT COUNT(*) as count FROM note n WHERE n.delete_time IS NULL ';
    let note_num = await db.query(sql, {
      type: db.QueryTypes.SELECT
    });
    note_num = note_num[0]['count'];
    sql =
      ' SELECT COUNT(*) as count FROM guide g WHERE g.delete_time IS NULL ';
    let guide_num = await db.query(sql, {
      type: db.QueryTypes.SELECT
    });
    guide_num = guide_num[0]['count'];
    return {
      total_user,
      updatem_user,
      updated_user,
      banner_num,
      scenics_num,
      note_num,
      guide_num
    };
  }
}

module.exports = { AboutDao };
