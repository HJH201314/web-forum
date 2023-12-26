export type PostItemCardProps = {
  type?: 'post' | 'video' | 'c'; // 动态类型
  postId?: number; // （可能）用于用于跳转post详情
  userId?: number; // 用于跳转用户信息
  userName?: string; // 用户名
  avatar?: string; // 用户头像
  forwardCount?: number; // 转发数
  commentCount?: number; // 评论数
  likeCount?: number; // 点赞数
  isLiked?: boolean; // 是否已点赞
  createTime?: string; // 发布时间
  content?: string; // 动态内容
  images?: string[]; // 动态图片

  // 特殊控制
  showAction?: boolean; // 是否展示action
  defaultTab?: string; // 默认展开的tab
};