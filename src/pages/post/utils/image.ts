import { ADMIN_SERVICE_PATH, SERVER_API_URL } from "@/apis/services/constants";

/**
 * Convert post image path to url
 * @param path
 */
export function convertPostImage(path?: string) {
  if (!path) return "";
  return `${SERVER_API_URL}${ADMIN_SERVICE_PATH}/updates/getImage?url=${path}`;
}

/**
 * Convert user file uuid to url
 * @param uuid
 */
export function convertUserFile(uuid?: string) {
  if (!uuid) return undefined;
  return `${SERVER_API_URL}/minio/video-platform.user/${uuid}`;
}