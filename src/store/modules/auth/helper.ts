import { ss } from '@/utils/storage'

const LOCAL_NAME = 'SECRET_TOKEN'
const ACCESS_TOKEN = 'ACCESS_TOKEN'

export function getToken() {
  return ss.get(LOCAL_NAME)
}

export function setToken(token: string) {
  return ss.set(LOCAL_NAME, token)
}

export function removeToken() {
  return ss.remove(LOCAL_NAME)
}

export function getAccessToken() {
  return ss.get(ACCESS_TOKEN)
}

export function setAccessToken(token: string) {
  return ss.set(ACCESS_TOKEN, token)
}

export function removeAccessToken() {
  return ss.remove(ACCESS_TOKEN)
}
