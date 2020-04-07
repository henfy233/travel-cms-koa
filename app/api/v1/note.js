'use strict';

const {
  LinRouter,
  NotFound,
  disableLoading
} = require('lin-mizar');

const {
  PositiveNumValidator
} = require('../../validators/note');

const {
  loginRequire
} = require('../../libs/jwt');

const {
  PositiveIdValidator,
  PaginateValidator,
  SearchValidator,
  PostArticleValidator
} = require('../../validators/common');

const { NoteDao } = require('../../dao/note');

// note 的红图实例
const noteApi = new LinRouter({
  prefix: '/v1/note'
});

// note 的dao 数据库访问层实例
const noteDto = new NoteDao();

/**
 * 发布游记
 */
noteApi.post('/', loginRequire, async ctx => {
  const v = await new PostArticleValidator().validate(ctx);
  await noteDto.postNote(ctx, v);
  ctx.success({
    msg: '发布游记成功'
  });
});

/**
 * 获取所有游记 包含用户信息
 */
noteApi.get('/notes', async ctx => {
  const v = await new PaginateValidator().validate(ctx);
  const { notes, total } = await noteDto.getNotes(
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
});

/**
 * 获取几个最火游记 num个
 */
noteApi.post('/hotNotes', async ctx => {
  const v = await new PositiveNumValidator().validate(ctx);
  const notes = await noteDto.getHotNotes(v);
  if (!notes || notes.length < 1) {
    throw new NotFound({
      msg: '没有找到相关游记'
    });
  }
  ctx.json(notes);
});

noteApi.linGet(
  'getAllNotes',
  '/login/notes',
  {
    auth: '获取所有游记',
    module: '用户',
    mount: false
  },
  loginRequire,
  async ctx => {
    const v = await new PaginateValidator().validate(ctx);
    const { notes, total } = await noteDto.getLoginNotes(
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

noteApi.linPost(
  'getHotNotes',
  '/login/hotNotes',
  {
    auth: '获取最火游记',
    module: '用户',
    mount: false
  },
  loginRequire,
  async ctx => {
    const v = await new PositiveNumValidator().validate(ctx);
    const notes = await noteDto.getLoginHotNotes(ctx, v);
    if (!notes || notes.length < 1) {
      throw new NotFound({
        msg: '没有找到相关游记'
      });
    }
    ctx.json(notes);
  }
);

noteApi.linGet(
  'getMyNotes',
  '/myNotes',
  {
    auth: '获取我的游记',
    module: '用户',
    mount: false
  },
  loginRequire,
  async ctx => {
    const notes = await noteDto.getMyNotes(ctx);
    if (!notes || notes.length < 1) {
      throw new NotFound({
        msg: '没有找到相关游记'
      });
    }
    ctx.json(notes);
  }
);

noteApi.get('/search', async ctx => {
  const v = await new SearchValidator().validate(ctx);
  const notes = await noteDto.getNoteByKeyword(v.get('query.q'));
  if (!notes || notes.length < 1) {
    throw new NotFound({
      msg: '没有找到相关游记'
    });
  }
  ctx.json(notes);
});

noteApi.get('/recommend', async ctx => {
  const notes = await noteDto.getRecommendNotes();
  if (!notes || notes.length < 1) {
    throw new NotFound({
      msg: '没有找到相关游记'
    });
  }
  ctx.json(notes);
});

noteApi.linDelete(
  'deleteMyNote',
  '/myNotes/:id',
  {
    auth: '删除我的游记',
    module: '游记',
    mount: false
  },
  loginRequire,
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    await noteDto.deleteMyNote(ctx, id);
    ctx.success({
      msg: '删除游记成功'
    });
  }
);

/**
 * 根据ID值获取游记
 */
noteApi.get('/:id', async ctx => {
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
});

module.exports = { noteApi, [disableLoading]: false };
