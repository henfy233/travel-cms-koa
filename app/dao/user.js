'use strict';

const { NotFound, Forbidden } = require('lin-mizar');
const { User } = require('../models/user');
const Sequelize = require('sequelize');

class UserDao {
  // async getAuths (ctx) {
  //   let user = ctx.currentUser;
  //   let auths = await ctx.manager.authModel.findAll({
  //     where: {
  //       group_id: user.group_id
  //     }
  //   });
  //   let group = await ctx.manager.groupModel.findOne({
  //     where: {
  //       id: user.group_id
  //     }
  //   });
  //   const aus = this.splitAuths(auths);
  //   set(user, 'auths', aus);
  //   console.log(user);
  //   if (group) {
  //     set(user, 'groupName', group.name);
  //   }
  //   return user;
  // }

  /**
   * 根据ID获取用户信息
   * @param {int} id 用户ID
   */
  async getUser (id) {
    const user = await User.findOne({
      where: {
        id,
        delete_time: null
      }
    });
    return user;
  }

  async getUserByEmail (v) {
    const user = await User.findOne({
      where: {
        email: v.get('body.email'),
        delete_time: null
      }
    });
    return user;
  }

  async getUserByKeyword (q) {
    const user = await User.findOne({
      where: {
        title: {
          [Sequelize.Op.like]: `%${q}%`
        },
        delete_time: null
      }
    });
    return user;
  }

  async getUsers () {
    const users = await User.findAll({
      where: {
        delete_time: null
      }
    });
    return users;
  }

  async createUser (v) {
    const user = await User.findOne({
      where: {
        email: v.get('body.email'),
        delete_time: null
      }
    });
    if (user) {
      throw new Forbidden({
        msg: '用户已存在'
      });
    }
    const bk = new User();
    bk.nickname = v.get('body.nickname');
    bk.email = v.get('body.email');
    bk.avatar = v.get('body.avatar');
    bk.password = v.get('body.password');
    bk.save();
  }

  /**
   * 修改用户信息
   * @param {object} ctx 用户信息
   * @param {object} v 返回信息
   */
  async updateUser (ctx, v) {
    let user = ctx.currentUser;
    user.nickname = v.get('body.nickname');
    user.city = v.get('body.city');
    user.sex = v.get('body.sex');
    user.introduce = v.get('body.introduce');
    user.save();
  }

  async deleteUser (id) {
    const user = await User.findOne({
      where: {
        id,
        delete_time: null
      }
    });
    if (!user) {
      throw new NotFound({
        msg: '没有找到相关用户'
      });
    }
    user.destroy();
  }
}

module.exports = { UserDao };
