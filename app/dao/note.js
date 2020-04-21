'use strict';

const { NotFound } = require('lin-mizar');
const { db } = require('lin-mizar/lin/db');
const { Note } = require('../models/note');
const { ArtAround } = require('../models/art_around.js');
const dayjs = require('dayjs');

class NoteDao {
  /**
   * 根据页数获取游记
   * @param {int} start 从第几条开始
   * @param {int} count1 每页多少条记录
   */
  async getNotes (start, count1) {
    let sql =
      'SELECT n.id, n.title, u.nickname, u.avatar, n.img, n.praise, n.text, n.create_time, (SELECT count(*) FROM comments_info ci WHERE ci.owner_id = n.id AND ci.type = 100) commentNum FROM note n';
    let notes = await db.query(
      sql +
      ' LEFT JOIN user u ON n.eid = u.id WHERE n.delete_time IS NULL AND n.stage > 0 Order By n.create_time Desc LIMIT :count OFFSET :start',
      {
        replacements: {
          count: count1,
          start: start * count1
        },
        type: db.QueryTypes.SELECT
      }
    );
    let sql1 =
      'SELECT COUNT(*) as count FROM note n WHERE n.delete_time IS NULL AND n.stage > 0';
    let total = await db.query(sql1, {
      type: db.QueryTypes.SELECT
    });
    total = total[0]['count'];
    return {
      notes,
      total
    };
  }

  /**
   * 发布游记
   * @param {Object} ctx 用户信息
   * @param {Object} v 发布游记信息
   */
  async postNote (ctx, v) {
    const user = ctx.currentUser;
    const arounds = v.get('body.arounds');
    return db.transaction(async t => {
      const note = await Note.create({
        title: v.get('body.title'),
        eid: user.id,
        img: v.get('body.img'),
        text: v.get('body.text')
      }, { transaction: t });
      for (var i = 0; i < arounds.length; i++) {
        await ArtAround.create({
          oid: note.id,
          type: 100,
          aid: arounds[i]
        }, { transaction: t });
      }
      await user.increment('notes', {
        by: 1, transaction: t
      });
    });
  }

  /**
   * 根据ID获取游记
   * @param {int} id ID号
   */
  async getNote (id) {
    let sql =
      ' SELECT n.id, u.nickname, u.avatar, n.title, n.eid, n.img, n.praise, n.text, n.create_time FROM note n LEFT JOIN user u ON n.eid = u.id WHERE ';
    let notes = await db.query(
      sql +
      ' n.delete_time IS NULL AND n.stage > 0 AND n.id = :id ',
      {
        replacements: {
          id
        },
        type: db.QueryTypes.SELECT
      }
    );
    let note = notes[0];
    let sql1 =
      ' SELECT s.id, s.name, s.image FROM scenics s, art_around a WHERE s.id = a.aid AND s.delete_time IS NULL AND ';
    let arounds = await db.query(
      sql1 +
      ' a.oid = :id AND a.type = 100 ',
      {
        replacements: {
          id: note.id
        },
        type: db.QueryTypes.SELECT
      }
    );
    return {
      note,
      arounds
    };
  }

  /**
   * Login 根据ID获取游记
   * @param {Object} ctx 用户信息
   * @param {int} id ID号
   */
  async getLoginNote (ctx, id) {
    const user = ctx.currentUser;
    let sql =
      ' SELECT n.id, u.nickname, u.avatar, n.title, n.eid, n.img, n.praise, n.text, n.create_time, f.id as liked FROM note n LEFT JOIN user u ON n.eid = u.id ';
    let notes = await db.query(
      sql +
      ' LEFT JOIN favor f ON n.id = f.art_id AND f.eid = :uid AND f.type = 100 WHERE n.delete_time IS NULL AND n.stage > 0 AND n.id = :id ',
      {
        replacements: {
          id,
          uid: user.id
        },
        type: db.QueryTypes.SELECT
      }
    );
    let note = notes[0];
    let sql1 =
      ' SELECT s.id, s.name, s.image FROM scenics s, art_around a WHERE s.id = a.aid AND s.delete_time IS NULL AND ';
    let arounds = await db.query(
      sql1 +
      ' a.oid = :id AND a.type = 100 ',
      {
        replacements: {
          id: note.id
        },
        type: db.QueryTypes.SELECT
      }
    );
    return {
      note,
      arounds
    };
  }

  /**
   * 获取最火游记
   * @param {object} v 游记数量
   */
  async getHotNotes (v) {
    const num = v.get('body.num');
    let sql =
      'SELECT n.id ,n.eid, n.title, n.img, n.praise, n.text, n.create_time, u.nickname, u.avatar, (SELECT count(*) FROM comments_info ci WHERE ci.owner_id = n.id AND ci.type = 100) commentNum FROM note n ';
    let notes = await db.query(
      sql +
      ' LEFT JOIN user u ON n.eid = u.id WHERE n.delete_time IS NULL AND n.stage > 0 Order By n.praise Desc LIMIT :count ',
      {
        replacements: {
          count: num
        },
        type: db.QueryTypes.SELECT
      }
    );
    return notes;
  }

  /**
   * 根据页数获取游记
   * @param {Object} ctx 用户信息
   * @param {int} start 从第几条开始
   * @param {int} count1 每页多少条记录
   */
  async getLoginNotes (ctx, start, count1) {
    const user = ctx.currentUser;
    let sql =
      ' SELECT n.id, n.title, n.eid, u.nickname, u.avatar, n.img, n.praise, n.text, n.create_time, f.id as liked, (SELECT count(*) FROM comments_info ci WHERE ci.owner_id = n.id AND ci.type = 100) commentNum FROM note n ';
    let notes = await db.query(
      sql +
      ' LEFT JOIN favor f ON n.id = f.art_id AND f.eid = :id AND f.type = 100 LEFT JOIN user u ON n.eid = u.id WHERE n.delete_time IS NULL AND n.stage > 0 Order By n.create_time Desc LIMIT :count OFFSET :start',
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
      'SELECT COUNT(*) as count FROM note n WHERE n.delete_time IS NULL AND n.stage > 0';
    let total = await db.query(sql1, {
      type: db.QueryTypes.SELECT
    });
    total = total[0]['count'];
    return {
      notes,
      total
    };
  }

  /**
   * 获取最火游记
   * @param {Object} ctx 用户信息
   * @param {object} v 游记数量
   */
  async getLoginHotNotes (ctx, v) {
    const num = v.get('body.num');
    const user = ctx.currentUser;
    let sql =
      'SELECT n.id ,n.eid, n.title, n.img, n.praise, n.text, n.create_time, u.nickname, u.avatar, f.id as liked, (SELECT count(*) FROM comments_info ci WHERE ci.owner_id = n.id AND ci.type = 100) commentNum FROM note n';
    let notes = await db.query(
      sql +
      ' LEFT JOIN favor f ON n.id = f.art_id AND f.eid = :id AND f.type = 100 LEFT JOIN user u ON n.eid = u.id WHERE n.delete_time IS NULL AND n.stage > 0 Order By n.praise Desc LIMIT :count ',
      {
        replacements: {
          id: user.id,
          count: num
        },
        type: db.QueryTypes.SELECT
      }
    );
    return notes;
  }

  /**
   * 根据用户ID获取游记
   * @param {int} id 用户ID
   */
  async getNotesById (id) {
    let sql =
      ' SELECT n.id ,n.eid, n.title, n.img, n.praise, n.text, n.create_time, u.`nickname`,u.`avatar`, (SELECT count(*) FROM comments_info ci WHERE ci.owner_id = n.id AND ci.type = 100) commentNum FROM note n, user u ';
    let notes = await db.query(
      sql +
      ' WHERE n.eid = u.id AND u.id = :id AND n.delete_time IS NULL AND n.stage > 0 Order By n.create_time Desc ',
      {
        replacements: {
          id
        },
        type: db.QueryTypes.SELECT
      }
    );
    return notes;
  }

  /**
   * 根据匹配文本查找游记
   * @param {String} q 匹配文本
   */
  async getNoteByKeyword (q) {
    let sql =
      'SELECT n.id, n.title, n.eid, n.img, n.praise, n.text, n.create_time,  u.`nickname`,u.`avatar`, (SELECT count(*) FROM comments_info ci WHERE ci.owner_id = n.id AND ci.type = 100) commentNum FROM note n, user u ';
    let notes = await db.query(
      sql +
      ' WHERE n.eid = u.id AND n.delete_time IS NULL AND n.stage > 0 AND n.title LIKE :q Order By n.create_time Desc ',
      {
        replacements: {
          q: '%' + q + '%'
        },
        type: db.QueryTypes.SELECT
      }
    );
    return notes;
  }

  /**
   * 获取推荐游记
   */
  async getRecommendNotes () {
    const sql = 'SELECT n.id, n.title, n.img FROM note n WHERE n.delete_time IS NULL AND n.stage = 2 ORDER BY n.create_time DESC ';
    let notes = await db.query(
      sql,
      {
        type: db.QueryTypes.SELECT
      }
    );
    return notes;
  }

  /**
   * 删除我的游记
   * @param {object} ctx 用户信息
   * @param {int} id ID号
   */
  async deleteMyNote (ctx, id) {
    const user = ctx.currentUser;
    const note = await Note.findOne({
      where: {
        id,
        eid: user.id,
        delete_time: null
      }
    });
    if (!note) {
      throw new NotFound({
        msg: '没有找到相关游记'
      });
    }
    return db.transaction(async t => {
      await note.destroy({
        transaction: t
      });
      await user.decrement('notes', {
        by: 1,
        transaction: t
      });
    });
  }

  /**
   * CMS 获取所有游记
   * @param {Object} ctx 用户信息
   * @param {int} start 从第几条开始
   * @param {int} count1 每页多少条记录
   */
  async getCMSAllNote (ctx, start, count1) {
    let sql =
      ' SELECT n.id, n.title, u.email, u.nickname, n.img, n.praise, n.text, n.stage, a.arounds, n.create_time FROM note n LEFT JOIN user u ON n.eid = u.id LEFT JOIN (SELECT a.oid, GROUP_CONCAT(s.name SEPARATOR \',\') arounds FROM scenics s, art_around a WHERE s.id = a.aid AND a.type = 100 AND s.delete_time IS NULL GROUP BY a.oid) a ON n.id = a.oid WHERE n.delete_time IS NULL Order By n.create_time Desc ';
    let notes = await db.query(
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
    notes.map(note => {
      note.create_time = dayjs(note.create_time).format('YYYY-MM-DD dddd HH:mm:ss A');
      return note;
    });
    let sql1 =
      'SELECT COUNT(*) as count FROM note n';
    let total = await db.query(sql1, {
      type: db.QueryTypes.SELECT
    });
    total = total[0]['count'];
    return {
      notes,
      total
    };
  }

  /**
   * 根据匹配文本查找游记
   * @param {String} q 匹配文本
   */
  async getCMSNoteByKeyword (q) {
    let sql =
      ' SELECT n.id, n.title, u.email, u.nickname, n.img, n.praise, n.text, n.stage, a.arounds, n.create_time FROM note n LEFT JOIN user u ON n.eid = u.id LEFT JOIN (SELECT a.oid, GROUP_CONCAT(s.name SEPARATOR \',\') arounds FROM scenics s, art_around a WHERE s.id = a.aid AND a.type = 100 AND s.delete_time IS NULL GROUP BY a.oid) a ON n.id = a.oid ';
    let notes = await db.query(
      sql +
      ' WHERE n.delete_time IS NULL AND n.title LIKE :q  Order By n.create_time Desc ',
      {
        replacements: {
          q: '%' + q + '%'
        },
        type: db.QueryTypes.SELECT
      }
    );
    notes.map(note => {
      note.create_time = dayjs(note.create_time).format('YYYY-MM-DD dddd HH:mm:ss A');
      return note;
    });
    return notes;
  }

  /**
   * 创建游记
   * @param {Object} v 信息
   */
  async createNote (v) {
    const bk = new Note();
    bk.name = v.get('body.name');
    bk.position = v.get('body.position');
    bk.image = v.get('body.image');
    bk.save();
  }

  /**
   * 更新游记
   * @param {Object} v 信息
   * @param {int} id ID号
   */
  async updateNote (v, id) {
    const note = await Note.findByPk(id);
    if (!note) {
      throw new NotFound({
        msg: '没有找到相关游记'
      });
    }
    note.name = v.get('body.name');
    note.position = v.get('body.position');
    note.image = v.get('body.image');
    note.save();
  }

  /**
   * 推荐游记
   * @param {int} id ID号
   */
  async recommendNote (id) {
    const note = await Note.findOne({
      where: {
        id, delete_time: null
      }
    });
    if (!note) {
      throw new NotFound({
        msg: '没有找到相关游记'
      });
    }
    if (note.stage === 0) {
      throw new NotFound({
        msg: '游记已封禁，不可推荐'
      });
    }
    if (note.stage === 2) {
      throw new NotFound({
        msg: '游记已推荐'
      });
    }
    note.stage = 2;
    note.save();
  }

  /**
   * 取消推荐游记
   * @param {int} id ID号
   */
  async disrecommendNote (id) {
    const note = await Note.findOne({
      where: {
        id,
        delete_time: null
      }
    });
    if (!note) {
      throw new NotFound({
        msg: '没有找到相关游记'
      });
    }
    if (note.stage === 0) {
      throw new NotFound({
        msg: '游记已封禁，不可取消推荐'
      });
    }
    if (note.stage === 1) {
      throw new NotFound({
        msg: '游记已取消推荐'
      });
    }
    note.stage = 1;
    note.save();
  }

  /**
   * 开放游记
   * @param {int} id ID号
   */
  async permitNote (id) {
    const note = await Note.findOne({
      where: {
        id,
        delete_time: null
      }
    });
    if (!note) {
      throw new NotFound({
        msg: '没有找到相关游记'
      });
    }
    if (note.stage === 2) {
      throw new NotFound({
        msg: '游记已推荐，不可开放'
      });
    }
    if (note.stage === 1) {
      throw new NotFound({
        msg: '游记已开放'
      });
    }
    note.stage = 1;
    note.save();
  }

  /**
   * 封禁游记
   * @param {int} id ID号
   */
  async prohibitNote (id) {
    const note = await Note.findOne({
      where: {
        id, delete_time: null
      }
    });
    if (!note) {
      throw new NotFound({
        msg: '没有找到相关游记'
      });
    }
    if (note.stage === 2) {
      throw new NotFound({
        msg: '游记已推荐，不可封禁'
      });
    }
    if (note.stage === 0) {
      throw new NotFound({
        msg: '游记已封禁'
      });
    }
    note.stage = 0;
    note.save();
  }

  /**
   * 删除游记
   * @param {int} id ID号
   */
  async deleteNote (id) {
    await Note.destroy({
      where: {
        id
      }
    });
  }
}

module.exports = { NoteDao };
