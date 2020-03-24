'use strict';

const { LinValidator, Rule } = require('lin-mizar');

class CommentValidator extends LinValidator {
  constructor () {
    super();
    this.id = new Rule('isInt', 'id必须为正整数', { min: 1 });
    this.type = new Rule('isInt', 'type必须为正整数');
  }
}

class SendCommentValidator extends LinValidator {
  constructor () {
    super();
    this.owner_id = new Rule('isInt', 'id必须为正整数', { min: 1 });
    this.type = new Rule('isInt', 'type必须为正整数');
    this.comment = new Rule('isNotEmpty', '评论内容不得为空');
  }
}

class SendReplyValidator extends LinValidator {
  constructor () {
    super();
    this.commentId = new Rule('isInt', 'id必须为正整数', { min: 1 });
    this.toId = new Rule('isInt', 'id必须为正整数', { min: 1 });
    this.toName = new Rule('isNotEmpty', '回复用户名字不得为空');
    this.comment = new Rule('isNotEmpty', '评论内容不得为空');
  }
}

module.exports = {
  CommentValidator,
  SendCommentValidator,
  SendReplyValidator
};
