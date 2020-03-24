'use strict';

const { NotFound, unsets } = require('lin-mizar');
const { db } = require('lin-mizar/lin/db');
const { Note } = require('../models/note');
const { User } = require('../models/user');
const Sequelize = require('sequelize');

class NoteDao {
  /**
   * 根据页数获取游记
   * @param {Object} ctx 用户信息
   * @param {int} start 从第几条开始
   * @param {int} count1 每页多少条记录
   */
  async getNotes (ctx, start, count1) {
    let sql =
      'SELECT note.*,user.`nickname`,user.`avatar`,favor.`id` as liked FROM note LEFT JOIN favor ON note.id = favor.art_id LEFT JOIN user ON note.eId = user.id WHERE';
    let notes = await db.query(
      sql +
        ' note.delete_time IS NULL Order By note.create_time Desc LIMIT :count OFFSET :start',
      {
        replacements: {
          count: count1,
          start: start * count1
        },
        type: db.QueryTypes.SELECT
      }
    );
    let sql1 =
      'SELECT COUNT(*) as count FROM note WHERE note.delete_time IS NULL';
    let total = await db.query(sql1, {
      type: db.QueryTypes.SELECT
    });
    notes.map(notes => {
      unsets(notes, ['update_time', 'delete_time']);
      // notes.create_time = dayjs(notes.create_time).unix();
      return notes;
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
    const bk = new Note();
    bk.title = v.get('body.title');
    bk.eId = user.id;
    bk.img = v.get('body.img');
    bk.text = v.get('body.text');
    bk.save();
  }

  /**
   * 根据ID获取游记
   * @param {int} id ID号
   */
  async getNote (id) {
    let sql =
      'SELECT note.*,user.`nickname`,user.`avatar` FROM note LEFT JOIN user ON note.eId = user.id WHERE';
    let note = await db.query(
      sql +
        ' note.delete_time IS NULL AND note.id = :id ',
      {
        replacements: {
          id
        },
        type: db.QueryTypes.SELECT
      }
    );
    note.map(note => {
      unsets(note, ['update_time', 'delete_time']);
      // notes.create_time = dayjs(notes.create_time).unix();
      return note;
    });
    return note[0];
  }

  /**
   * 根据匹配文本查找游记
   * @param {String} q 匹配文本
   */
  async getNoteByKeyword (q) {
    const note = await Note.findOne({
      where: {
        title: {
          [Sequelize.Op.like]: `%${q}%`
        },
        delete_time: null
      }
    });
    return note;
  }

  /**
   * 获取所有游记
   */
  // async getNotes () {
  //   let notes = await Note.findAll({
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
  //     order: [
  //       ['create_time', 'DESC']
  //     ],
  //     include: [
  //       {
  //         // 这里再传入他，这个对象只是类似一个工厂函数，实际查询的时候findAll会找到最新的结果
  //         association: NoteBelongsToUser,
  //         attributes: []
  //       }
  //     ],
  //     raw: true
  //   });
  //   return notes;
  // }

  /**
   * 获取最火游记
   * @param {object} v 游记数量
   */
  async getHotNotes (v) {
    const num = v.get('body.num');
    let notes = await Note.findAll({
      attributes: [
        'id',
        'title',
        'img',
        'praise',
        'text',
        'create_time',
        Sequelize.col('u.nickname'),
        Sequelize.col('u.avatar')
      ],
      where: {
        delete_time: null
      },
      include: [
        {
          // 这里再传入他，这个对象只是类似一个工厂函数，实际查询的时候findAll会找到最新的结果
          association: NoteBelongsToUser,
          attributes: []
        }
      ],
      limit: num,
      raw: true
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
   * 删除游记
   * @param {int} id ID号
   */
  async deleteNote (id) {
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
    note.destroy();
  }
}

const NoteBelongsToUser = Note.belongsTo(User, {
  // 最外部的作用域就定义一下这个映射关系，这样运行周期里只会执行一次
  foreignKey: 'eId', targetKey: 'id', as: 'u'
});

module.exports = { NoteDao };
