'use strict';

const { InfoCrudMixin } = require('lin-mizar/lin/interface');
const { merge } = require('lodash');
const { Sequelize, Model } = require('sequelize');
const { db } = require('lin-mizar/lin/db');

class Scenics extends Model {
  toJSON () {
    let origin = {
      id: this.id,
      name: this.name,
      position: this.position,
      image: this.image,
      create_time: this.createTime
    };
    return origin;
  }
}

Scenics.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING(20),
      allowNull: false
    },
    position: {
      type: Sequelize.STRING(30),
      allowNull: false
    },
    image: {
      type: Sequelize.STRING(100),
      allowNull: true
    }
  },
  merge(
    {
      tableName: 'scenics',
      modelName: 'scenics',
      sequelize: db
    },
    InfoCrudMixin.options
  )
);

module.exports = { Scenics };
