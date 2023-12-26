declare namespace API {
  type addPermissionUsingPOSTParams = {
    /** 权限名称 */
    permission: string;
  };

  type addRoleByIdUsingPOSTParams = {
    /** 角色id */
    roleId: number;
    /** 用户id */
    userId: number;
  };

  type AuthDto = {
    auth?: string;
    type?: number;
  };

  type CommonResultListPermission_ = {
    code?: number;
    data?: Permission[];
    message?: string;
  };

  type CommonResultListRole_ = {
    code?: number;
    data?: Role[];
    message?: string;
  };

  type CommonResultListVisit_ = {
    code?: number;
    data?: Visit[];
    message?: string;
  };

  type CommonResultListVisitMonTotal_ = {
    code?: number;
    data?: VisitMonTotal[];
    message?: string;
  };

  type CommonResultMapObjectObject_ = {
    code?: number;
    data?: Record<string, any>;
    message?: string;
  };

  type CommonResultObject_ = {
    code?: number;
    data?: Record<string, any>;
    message?: string;
  };

  type CommonResultString_ = {
    code?: number;
    data?: string;
    message?: string;
  };

  type CommonResultUser_ = {
    code?: number;
    data?: User;
    message?: string;
  };

  type deletePermissionUsingDELETEParams = {
    /** 权限名称 */
    permission: string;
  };

  type deleteRoleByIdUsingDELETEParams = {
    /** 角色id */
    roleId: number;
    /** 用户id */
    userId: number;
  };

  type deleteRoleUsingDELETEParams = {
    /** 角色名称 */
    roleName: string;
  };

  type deleteUserByIdUsingDELETEParams = {
    /** 用户id */
    id: number;
  };

  type getVisByDayUsingGETParams = {
    /** timeId */
    timeId: string;
  };

  type getVisByMonUsingGETParams = {
    /** mon */
    mon: string;
    /** year */
    year: string;
  };

  type LoginDto = {
    email?: string;
    phone?: string;
    pin?: string;
    pswd?: string;
    type?: number;
  };

  type Permission = {
    /** 权限id */
    id?: number;
    /** 权限名称 */
    name?: string;
  };

  type RegisterDto = {
    email?: string;
    name?: string;
    phone?: string;
    pin?: string;
    pswd?: string;
    type?: number;
  };

  type Role = {
    /** 角色权限描述 */
    describe?: string;
    /** rid */
    id?: number;
    /** 角色名称 */
    name?: string;
  };

  type updateRoleUsingPOSTParams = {
    /** 新角色名称 */
    newRole: string;
    /** 旧角色名称 */
    oldRole: string;
  };

  type User = {
    /** 邮箱 */
    email?: string;
    /** uid */
    id?: number;
    /** 等级 */
    level?: number;
    /** 昵称 */
    name?: string;
    /** 密码 */
    password?: string;
    /** 手机号 */
    phone?: string;
    /** 用户状态 */
    status?: number;
  };

  type UserDetail = {
    /** 经验值 */
    exp?: number;
    /** 性别 */
    gender?: string;
    /** id */
    id?: number;
    /** 自我介绍 */
    info?: string;
    /** ip属地 */
    ip?: string;
    /** 用户id */
    uid?: number;
  };

  type UserStatistics = {
    /** 粉丝数量 */
    fan?: number;
    /** 关注数量 */
    follow?: number;
    id?: number;
    /** 获赞数量 */
    like?: number;
    /** 用户id */
    uid?: number;
    /** 投稿视频数量 */
    videoNum?: number;
    /** 视频总播放量 */
    videoTotalPlay?: number;
  };

  type Visit = {
    /** 访问接口，all为所有接口的总和 */
    api?: string;
    /** id */
    id?: number;
    /** 上次更新时间 */
    lastUpdate?: string;
    /** yyyy-mm-dd的时间id */
    timeId?: string;
    /** 访问量 */
    visits?: number;
  };

  type VisitMonTotal = {
    /** 访问接口，all为总量 */
    api?: string;
    /** 月份 */
    mon?: string;
    /** 访问量 */
    visits?: number;
    /** 年份 */
    year?: string;
  };
}
