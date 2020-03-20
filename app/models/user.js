'use strict';

const { NotFound, ParametersException } = require('lin-mizar');
const { InfoCrudMixin } = require('lin-mizar/lin/interface');
const { merge } = require('lodash');
const { Sequelize, Model } = require('sequelize');
const { db } = require('lin-mizar/lin/db');
const bcrypt = require('bcryptjs');
const config = require('../config/setting');

class User extends Model {
  toJSON () {
    let origin = {
      id: this.id,
      nickname: this.nickname,
      email: this.email,
      avatar: this.avatar,
      city: this.city,
      sex: this.sex,
      introduce: this.introduce,
      password: this.password,
      create_time: this.createTime
    };
    return origin;
  }
  /**
   * 验证密码
   * @param {String} email 邮箱
   * @param {String} password 密码
   */
  static async verify (email, password) {
    // tslint:disable-next-line: await-promise
    const user = await this.findOne({ where: { email, delete_time: null } });
    if (!user) {
      throw new NotFound({ msg: '用户不存在' });
    }
    if (!user.checkPassword(password)) {
      throw new ParametersException({ msg: '密码错误，请输入正确密码' });
    }
    return user;
  }
  /**
   * 验证密码
   * @param {String} raw 输入密码
   */
  checkPassword (raw) {
    const correct = bcrypt.compareSync(raw, this.password);
    return correct;
  }
  /**
   * 修改密码
   * @param {String} oldPassword 旧密码
   * @param {String} newPassword 新密码
   */
  changePassword (oldPassword, newPassword) {
    if (this.checkPassword(oldPassword)) {
      this.password = newPassword;
      return true;
    }
    return false;
  }
}

User.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nickname: {
      type: Sequelize.STRING(24),
      allowNull: true,
      defaultValue: '佚名',
      comment: '昵称'
    },
    email: {
      type: Sequelize.STRING(100),
      unique: true,
      allowNull: false,
      comment: '邮箱'
    },
    avatar: {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: '头像url',
      get () {
        return this.getDataValue('avatar') ? config.siteDomain + '/assets/' + this.getDataValue('avatar') : null;
      }
    },
    city: {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: '居住地'
    },
    sex: {
      type: Sequelize.STRING(10),
      allowNull: true,
      comment: '性别',
      defaultValue: '保密'
    },
    introduce: {
      type: Sequelize.STRING(200),
      allowNull: true,
      comment: '简介'
    },
    password: {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: '密码',
      set (val) {
        const salt = bcrypt.genSaltSync(10);
        const psw = bcrypt.hashSync(val, salt);
        this.setDataValue('password', psw);
      }
    }
  },
  merge(
    {
      tableName: 'user',
      modelName: 'user',
      sequelize: db
    },
    InfoCrudMixin.options
  )
);

module.exports = { User };
