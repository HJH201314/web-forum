/**
 * 所有API的入口文件
 *
 */

import * as starService from "./video-platform-star";
import * as adminService from "./video-platform-admin";
import * as commentService from "./video-platform-comment";
import * as manageService from "./video-platform-manage";
import * as securityService from "./video-platform-security";
import * as recommendService from "./video-platform-recommend";

export default {
  starService: starService.default,
  adminService: adminService.default,
  commentService: commentService.default,
  manageService: manageService.default,
  securityService: securityService.default,
  recommendService: recommendService.default,
};