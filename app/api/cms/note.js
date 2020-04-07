/* eslint-disable new-cap */
'use strict';

const {
  LinRouter,
  loginRequired,
  groupRequired,
  NotFound,
  logger
} = require('lin-mizar');

const {
  PaginateValidator,
  PositiveIdValidator,
  SearchValidator
} = require('../../validators/common');

const { NoteDao } = require('../../dao/note');

const note = new LinRouter({
  prefix: '/cms/note'
});

const noteDto = new NoteDao();

note.linGet(
  'getNotes',
  '/',
  {
    auth: '获取游记',
    module: '游记',
    mount: false
  },
  loginRequired,
  async ctx => {
    const v = await new PaginateValidator().validate(ctx);
    const { notes, total } = await noteDto.getCMSAllNote(
      ctx,
      v.get('query.page'),
      v.get('query.count')
    );
    ctx.json({
      items: notes,
      total: total,
      page: v.get('query.page'),
      count: v.get('query.count'),
      total_page: Math.ceil(total / parseInt(v.get('query.count')))
    });
  }
);

note.linGet(
  'getNoteByKeyword',
  '/search',
  {
    auth: '根据关键词获取游记',
    module: '游记',
    mount: false
  },
  loginRequired,
  async ctx => {
    const v = await new SearchValidator().validate(ctx);
    const notes = await noteDto.getCMSNoteByKeyword(v.get('query.q'));
    if (!notes || notes.length < 1) {
      throw new NotFound({
        msg: '没有找到相关游记'
      });
    }
    ctx.json(notes);
  }
);

note.linGet(
  'getNoteById',
  '/:id',
  {
    auth: '根据ID获取游记',
    module: '游记',
    mount: false
  },
  loginRequired,
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    const { note, arounds } = await noteDto.getNote(id);
    if (!note) {
      throw new NotFound({
        msg: '没有找到相关游记'
      });
    }
    ctx.json({
      note,
      arounds
    });
  }
);

note.linGet(
  'recommendNote',
  '/rec/:id',
  {
    auth: '推荐游记',
    module: '游记',
    mount: true
  },
  groupRequired,
  logger('{user.username}推荐了游记'),
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    await noteDto.recommendNote(id);
    ctx.success({
      msg: '推荐游记成功'
    });
  }
);

note.linGet(
  'disrecommendNote',
  '/dis/:id',
  {
    auth: '取消推荐游记',
    module: '游记',
    mount: true
  },
  groupRequired,
  logger('{user.username}取消推荐了游记'),
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    await noteDto.disrecommendNote(id);
    ctx.success({
      msg: '取消推荐游记成功'
    });
  }
);

note.linGet(
  'permitNote',
  '/per/:id',
  {
    auth: '开放游记',
    module: '游记',
    mount: true
  },
  groupRequired,
  logger('{user.username}开放了游记'),
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    await noteDto.permitNote(id);
    ctx.success({
      msg: '开放游记成功'
    });
  }
);

note.linGet(
  'prohibitNote',
  '/pro/:id',
  {
    auth: '封禁游记',
    module: '游记',
    mount: true
  },
  groupRequired,
  logger('{user.username}封禁了游记'),
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    await noteDto.prohibitNote(id);
    ctx.success({
      msg: '封禁游记成功'
    });
  }
);

note.linDelete(
  'deleteNote',
  '/:id',
  {
    auth: '删除游记',
    module: '游记',
    mount: true
  },
  groupRequired,
  logger('{user.username}删除了游记'),
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    await noteDto.deleteNote(id);
    ctx.success({
      msg: '删除游记成功'
    });
  }
);

module.exports = { note };
