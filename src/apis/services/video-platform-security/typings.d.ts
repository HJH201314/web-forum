declare namespace API {
  type AuthDto = {
    auth?: string;
    type?: number;
  };

  type CommonResultBoolean_ = {
    code?: number;
    data?: boolean;
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

  type LoginDto = {
    email?: string;
    phone?: string;
    pin?: string;
    pswd?: string;
    type?: number;
  };

  type RegisterDto = {
    email?: string;
    name?: string;
    phone?: string;
    pin?: string;
    pswd?: string;
    type?: number;
  };

  type User = {
    /** 头像 */
    avatar?: string;
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
}
