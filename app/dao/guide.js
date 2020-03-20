'use strict';

const { NotFound } = require('lin-mizar');
const { Guide } = require('../models/guide');
const { User } = require('../models/user');
const Sequelize = require('sequelize');

class GuideDao {
  async getGuide (id) {
    const guide = await Guide.findOne({
      where: {
        id,
        delete_time: null
      }
    });
    return guide;
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
  async getGuides () {
    let guides = await Guide.findAll({
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
          association: GuideBelongsToUser,
          attributes: []
        }
      ],
      limit: 3,
      raw: true
    });
    return guides;
  }

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

const GuideBelongsToUser = Guide.belongsTo(User, {
  // 最外部的作用域就定义一下这个映射关系，这样运行周期里只会执行一次
  foreignKey: 'eId', targetKey: 'id', as: 'u'
});

module.exports = { GuideDao };
