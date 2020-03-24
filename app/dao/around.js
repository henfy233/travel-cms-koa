'use strict';

const { Forbidden } = require('lin-mizar');
const { db } = require('lin-mizar/lin/db');
const { Around } = require('../models/around');

class AroundDao {
  /**
   * 点赞
   * @param {int} art_id 类型ID
   * @param {int} type 类型
   * @param {int} eid 邮箱ID
   */
  // eslint-disable-next-line camelcase
  async like (art_id, type, eid) {
    const favor = await Favor.findOne({
      where: {
        art_id,
        type,
        eid
      }
    });
    if (favor) {
      throw new Forbidden({
        msg: '你已经点赞过'
      });
    }
    return db.transaction(async t => {
      await Favor.create({
        art_id,
        type,
        eid
      }, {
        transaction: t
      });
      const art = await this.getData(art_id, type);
      await art.increment('praise', {
        by: 1,
        transaction: t
      });
    });
  }
}

module.exports = { AroundDao };
