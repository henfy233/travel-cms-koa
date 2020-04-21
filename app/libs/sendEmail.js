const nodemailer = require('nodemailer');
const Email = require('../config/secure');

let transporter = nodemailer.createTransport({
  // node_modules/nodemailer/lib/well-known/services.json  查看相关的配置，如果使用qq邮箱，就查看qq邮箱的相关配置
  service: 'qq', // 类型qq邮箱
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: Email.smtp.user, // 发送方的邮箱
    pass: Email.smtp.pass // smtp 的授权码
  }
});
// pass 不是邮箱账户的密码而是stmp的授权码（必须是相应邮箱的stmp授权码）
// 邮箱---设置--账户--POP3/SMTP服务---开启---获取stmp授权码

/**
 * 发送邮箱
 * @param {String} mail 邮箱
 * @param {String} code 验证码
 * @param {func} call 回调函数
 * @param {int} type 类型 1为注册 2为忘记密码
 */
function sendMail (mail, code, call, type) {
  let mailOptions;
  // 发送的配置项
  if (type === 1) {
    mailOptions = {
      from: `"游乐记" <${Email.smtp.user}>`, // 发送方
      to: mail, // 接收者邮箱，多个邮箱用逗号间隔
      subject: '发送注册验证码', // 标题
      text: '游乐记,注册账号', // 文本内容
      html: `<h2>游乐记</h2><p>注册账号</p><p>您的验证码：${code} （3分钟内有效）</p>` // 页面内容
      // attachments: [{//发送文件
      //      filename: 'index.html', //文件名字
      //      path: './index.html' //文件路径
      //  },
      //  {
      //      filename: 'sendEmail.js', //文件名字
      //      content: 'sendEmail.js' //文件路径
      //  }
      // ]
    };
  } else {
    mailOptions = {
      from: `"游乐记" <${Email.smtp.user}>`, // 发送方
      to: mail, // 接收者邮箱，多个邮箱用逗号间隔
      subject: '发送忘记密码验证码', // 标题
      text: '游乐记,忘记密码', // 文本内容
      html: `<h2>游乐记</h2><p>忘记密码</p><p>您的验证码：${code} （3分钟内有效）</p>` // 页面内容
    };
  }

  // 发送函数
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      call(false);
    } else {
      call(true); // 因为是异步 所有需要回调函数通知成功结果
    }
  });
}

module.exports = {
  sendMail
};
