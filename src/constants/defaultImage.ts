export function getDefaultAvatar(username: string = 'notlogin') {
  return `https://api.dicebear.com/7.x/bottts-neutral/svg?backgroundType=gradientLinear&seed=${username}`;
}

export function getDefaultAvatarByUid(uid?: number) {
  if (uid)
    return getDefaultAvatar(`id${uid}`);
  else
    return getDefaultAvatar();
}

export const DEFAULT_USER_AVATAR = getDefaultAvatar('notlogin');

