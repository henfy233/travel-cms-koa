'use strict';

const Redis = require('koa-redis'); // redis-server.exe redis.windows.conf 运行redis
const email = require('../../libs/sendEmail'); // 引入封装好的函数
const {
  LinRouter,
  Failed,
  NotFound,
  LimitException,
  // loginRequired,
  groupRequired,
  disableLoading
} = require('lin-mizar');
const { getSafeParamId } = require('../../libs/util');
const {
  loginRequire,
  getTokens,
  refreshTokenRequiredWithUnifyException
} = require('../../libs/jwt');
const {
  RegisterValidator,
  LoginValidator,
  VerifyValidator,
  GetInformationValidator,
  UserSearchValidator,
  CreateOrUpdateUserValidator,
  AvatarUpdateValidator,
  ChangePasswordValidator
} = require('../../validators/user');

const { PositiveIdValidator } = require('../../validators/common');

const { User } = require('../../models/user');
const { UserDao } = require('../../dao/user');

// user 的红图实例
const userApi = new LinRouter({
  prefix: '/v1/user'
});

// user 的dao 数据库访问层实例
const userDto = new UserDao();

const Store = new Redis().client;

userApi.linPost(
  'userRegister',
  '/register',
  {
    auth: '注册',
    module: '用户',
    mount: false
  },
  async ctx => {
    const v = await new RegisterValidator().validate(ctx);
    const user = {
      email: v.get('body.email'),
      code: v.get('body.code')
    };
    const saveCode = await Store.hget(`nodemail:${user.email}`, 'code');
    const saveExpire = await Store.hget(`nodemail:${user.email}`, 'expire');
    if (user.code === saveCode) {
      if (new Date().getTime() - saveExpire > 0) {
        // 验证码已过期，请重新尝试
        throw new Failed({
          msg: '验证码已过期，请重新尝试'
        });
      }
    } else {
      // 请填写正确的验证码
      throw new Failed({
        msg: '请填写正确的验证码'
      });
    }

    await userDto.createUser(v);
    ctx.success({
      msg: '注册成功'
    });
  }
);

userApi.linPost(
  'userLogin',
  '/login',
  {
    auth: '登陆',
    module: '用户',
    mount: false
  },
  async ctx => {
    const v = await new LoginValidator().validate(ctx);
    let user = await User.verify(
      v.get('body.email'),
      v.get('body.password')
    );
    const { accessToken, refreshToken } = getTokens(user);
    ctx.json({
      access_token: accessToken,
      refresh_token: refreshToken
    });
  }
);

userApi.linPost(
  'userVerify',
  '/verify',
  {
    auth: '邮箱验证',
    module: '用户',
    mount: false
  },
  async ctx => {
    const v = await new VerifyValidator().validate(ctx);
    const mail = v.get('body.email');
    const saveExpire = await Store.hget(`nodemail:${mail}`, 'expire');
    const code = Math.floor(Math.random() * 8999) + 1000; // 生成四位随机验证码
    const expire = new Date().getTime() + 3 * 60 * 1000; // 生成过期时间

    if (saveExpire && new Date().getTime() - saveExpire < 0) {
      throw new LimitException({
        msg: '验证请求过于频繁，3分钟内1次'
      });
    }
    async function timeout () {
      return new Promise((resolve, reject) => {
        email.sendMail(mail, code, state => {
          resolve(state);
        });
      });
    }
    await timeout().then(state => {
      if (state) {
        Store.hmset(
          `nodemail:${mail}`,
          'code',
          code,
          'expire',
          expire,
          'email',
          mail
        );
        ctx.success({
          msg: '邮件发送成功'
        });
      } else {
        throw new Failed({
          msg: '邮件发送失败'
        });
      }
    });
  }
);

userApi.linGet(
  'userGetToken',
  '/refresh',
  {
    auth: '刷新令牌',
    module: '用户',
    mount: false
  },
  refreshTokenRequiredWithUnifyException,
  async ctx => {
    let user = ctx.currentUser;
    const { accessToken, refreshToken } = getTokens(user);
    ctx.json({
      access_token: accessToken,
      refresh_token: refreshToken
    });
  }
);

userApi.linGet(
  'getInformation',
  '/getInformation',
  {
    auth: '查询自己信息',
    module: '用户',
    mount: false
  },
  loginRequire,
  async ctx => {
    const user = ctx.currentUser;
    ctx.json(user);
  }
);

userApi.linPost(
  'changeInformation',
  '/changeInformation',
  {
    auth: '修改自己信息',
    module: '用户',
    mount: false
  },
  loginRequire,
  async ctx => {
    const v = await new GetInformationValidator().validate(ctx);
    await userDto.updateUser(ctx, v);
    ctx.success({
      msg: '修改成功'
    });
  }
);

userApi.linPut(
  'userUpdatePassword',
  '/change_password',
  {
    auth: '修改密码',
    module: '用户',
    mount: false
  },
  loginRequire,
  async ctx => {
    const v = await new ChangePasswordValidator().validate(ctx);
    let user = ctx.currentUser;
    const ok = user.changePassword(
      v.get('body.old_password'),
      v.get('body.new_password')
    );
    if (!ok) {
      throw new NotFound({
        msg: '修改密码失败，你可能输入了错误的旧密码'
      });
    }
    user.save();
    ctx.success({
      msg: '密码修改成功'
    });
  }
);

userApi.linGet(
  'userGetToken',
  '/refresh',
  {
    auth: '刷新令牌',
    module: '用户',
    mount: false
  },
  refreshTokenRequiredWithUnifyException,
  async ctx => {
    let user = ctx.currentUser;
    const { accessToken, refreshToken } = getTokens(user);
    ctx.json({
      access_token: accessToken,
      refresh_token: refreshToken
    });
  }
);

userApi.put('/avatar', loginRequire, async ctx => {
  const v = await new AvatarUpdateValidator().validate(ctx);
  const avatar = v.get('body.avatar');
  let user = ctx.currentUser;
  user.avatar = avatar;
  await user.save();
  ctx.success({ msg: '更新头像成功' });
});

userApi.get('/:id', async ctx => {
  const v = await new PositiveIdValidator().validate(ctx);
  const id = v.get('path.id');
  const user = await userDto.getUser(id);
  if (!user) {
    throw new NotFound({
      msg: '没有找到相关用户'
    });
  }
  ctx.json(user);
});

userApi.get('/', async ctx => {
  const users = await userDto.getUsers();
  // if (!users || users.length < 1) {
  //   throw new NotFound({
  //     msg: '没有找到相关用户'
  //   });
  // }
  ctx.json(users);
});

userApi.get('/search/one', async ctx => {
  const v = await new UserSearchValidator().validate(ctx);
  const user = await userDto.getUserByKeyword(v.get('query.q'));
  if (!user) {
    throw new NotFound({
      msg: '没有找到用户'
    });
  }
  ctx.json(user);
});

userApi.post('/', async ctx => {
  const v = await new CreateOrUpdateUserValidator().validate(ctx);
  await userDto.createUser(v);
  ctx.success({
    msg: '新建用户成功'
  });
});

userApi.put('/:id', async ctx => {
  const v = await new CreateOrUpdateUserValidator().validate(ctx);
  const id = getSafeParamId(ctx);
  await userDto.updateUser(v, id);
  ctx.success({
    msg: '更新用户成功'
  });
});

userApi.linDelete(
  'deleteUser',
  '/:id',
  {
    auth: '删除用户',
    module: '用户',
    mount: true
  },
  groupRequired,
  async ctx => {
    const v = await new PositiveIdValidator().validate(ctx);
    const id = v.get('path.id');
    await userDto.deleteUser(id);
    ctx.success({
      msg: '删除用户成功'
    });
  }
);

module.exports = { userApi, [disableLoading]: false };
