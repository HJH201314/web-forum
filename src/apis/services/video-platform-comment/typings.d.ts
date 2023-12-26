declare namespace API {
  type Comment = {
    /** 子评论 */
    children?: Comment[];
    /** 评论内容 */
    content?: string;
    /** 评论时间 */
    createTime?: string;
    /** 评论对象的id */
    foreignId?: number;
    /** id，主键 */
    id?: string;
    /** 是否置顶（1：置顶 0：不置顶） */
    isTop?: number;
    /** 点赞数量 */
    likeNum?: number;
    /** 回复数量 */
    replyNum?: number;
    /** 回复的用户 */
    targetUsername?: string;
    /** 用户id */
    userId?: number;
    /** 用户名 */
    username?: string;
  };

  type CommentVo = {
    children?: CommentVo[];
    content?: string;
    createTime?: string;
    foreignId?: number;
    id?: string;
    isLiked?: boolean;
    likeNum?: number;
    replyNum?: number;
    targetUsername?: string;
    userId?: number;
    username?: string;
  };

  type CommonResultInt_ = {
    code?: number;
    data?: number;
    message?: string;
  };

  type CommonResultListResultCommentVo_ = {
    code?: number;
    data?: ListResultCommentVo_;
    message?: string;
  };

  type CommonResultLong_ = {
    code?: number;
    data?: string;
    message?: string;
  };

  type CommonResultString_ = {
    code?: number;
    data?: 'FAILED' | 'FORBIDDEN' | 'SUCCESS' | 'UNAUTHORIZED' | 'VALIDATE_FAILED';
    message?: string;
  };

  type countChildrenCommentsByPidUsingGETParams = {
    /** 要获取子评论的根评论id */
    pid: string;
  };

  type countCommentsByForeignIdUsingGETParams = {
    /** foreignId */
    foreignId: number;
  };

  type deleteChildCommentUsingDELETEParams = {
    /** 要删除的子评论的id */
    cid: string;
    /** 要删除的子评论的根评论的id */
    pid: string;
  };

  type deleteRootCommentUsingDELETEParams = {
    /** 要删除的根评论的id */
    pid: string;
  };

  type likeChildrenCommentUsingPOSTParams = {
    /** 点赞的子评论id */
    cid: string;
    /** 点赞或取消点赞（1：点赞  -1：取消点赞） */
    flag: number;
    /** 点赞的对应的根评论id */
    pid: string;
    /** 被点赞的评论的用户的id */
    pUid: number;
    /** 当前登录用户id */
    uid: number;
  };

  type likeRootCommentUsingPOSTParams = {
    /** 点赞或取消点赞（1：点赞  -1：取消点赞） */
    flag: number;
    /** 点赞的根评论的id */
    pid: string;
    /** 被点赞的评论的用户的id */
    pUid: number;
    /** 当前登录用户id */
    uid: number;
  };

  type listChildrenCommentByPagesUsingGETParams = {
    /** 当前页 */
    page: number;
    /** 要获取子评论的根评论id */
    pid: string;
    /** 每页大小 */
    size: number;
    /** 当前登录用户id */
    uid: number;
  };

  type listCommentByPagesUsingGETParams = {
    /** 要获取评论的动态id */
    foreignId: number;
    /** 当前页 */
    page: number;
    /** 每页大小 */
    size: number;
    /** 排序字段 */
    sortBy: string;
    /** 当前登录的用户的id */
    uid: number;
  };

  type ListResultCommentVo_ = {
    list?: CommentVo[];
    total?: number;
  };

  type replyCommentUsingPOSTParams = {
    /** 回复的根评论的id */
    pid: string;
  };

  type toTopCommentUsingPOSTParams = {
    /** 置顶或取消置顶 */
    flag: number;
    /** 要置顶的评论id（只能为根评论） */
    pid: string;
  };
}
