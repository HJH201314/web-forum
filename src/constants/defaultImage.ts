export const DEFAULT_USER_AVATAR = 'https://avatars.githubusercontent.com/u/24362351?v=4';

export function getDefaultAvatar(username: string) {
  return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`;
}