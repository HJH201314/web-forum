declare namespace API {
  type CommonResultListInt_ = {
    code?: number;
    data?: number[];
    message?: string;
  };

  type CommonResultString_ = {
    code?: number;
    data?: 'FAILED' | 'FORBIDDEN' | 'SUCCESS' | 'UNAUTHORIZED' | 'VALIDATE_FAILED';
    message?: string;
  };

  type getRecommendByUpdateIdUsingGETParams = {
    /** uid */
    uid: number;
    /** updateId */
    updateId: number;
  };

  type getRecommendUsingGETParams = {
    /** uid */
    uid: number;
  };

  type plusScoreUsingPOSTParams = {
    /** 得分：(观看：+1 ,点赞：+2 ,投币：+3 ,收藏：+4) */
    score: number;
    /** 当前登录的用户id */
    uid: number;
    /** 动态id */
    updateId: number;
  };
}
