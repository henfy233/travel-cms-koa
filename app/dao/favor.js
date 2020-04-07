'use strict';

const { Forbidden } = require('lin-mizar');
const { db } = require('lin-mizar/lin/db');
const { Favor } = require('../models/favor');

class FavorDao {
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
        art_id, type, eid
      }
    });
    if (favor) {
      throw new Forbidden({
        msg: '你已经点赞过'
      });
    }
    return db.transaction(async t => {
      await Favor.create({
        art_id, type, eid
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

  /**
   * 取消点赞
   * @param {int} art_id 类型ID
   * @param {int} type 类型
   * @param {int} eid 邮箱ID
   */
  // eslint-disable-next-line camelcase
  async disLike (art_id, type, eid) {
    const favor = await Favor.findOne({
      where: {
        art_id, type, eid
      }
    });
    if (!favor) {
      throw new Forbidden({
        msg: '你已取消点赞'
      });
    }
    return db.transaction(async t => {
      await favor.destroy({
        force: true,
        transaction: t
      });
      const art = await this.getData(art_id, type);
      await art.decrement('praise', {
        by: 1,
        transaction: t
      });
    });
  }

  // eslint-disable-next-line camelcase
  async getData (art_id, type) {
    let art = null;
    const finder = {
      where: {
        id: art_id,
        delete_time: null
      }
    };
    switch (type) {
      case 100:
        const { Note } = require('../models/note');
        art = await Note.findOne(finder);
        break;
      case 200:
        const { Guide } = require('../models/guide');
        art = await Guide.findOne(finder);
        break;
      case 300:
        const { Scenics } = require('../models/scenics');
        art = await Scenics.findOne(finder);
        break;
      default:
        break;
    }
    return art;
  }
}

module.exports = { FavorDao };
