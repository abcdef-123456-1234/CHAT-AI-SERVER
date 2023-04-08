/*
 * @Descripttion:
 * @version:
 * @Author: maolw
 * @Date: 2023-03-23 15:04:03
 * @LastEditors: maolw
 * @LastEditTime: 2023-04-07 17:07:32
 */
import type { AxiosProgressEvent, GenericAbortSignal } from 'axios'
import { get, post } from '@/utils/request'
import { useSettingStore } from '@/store'

export function fetchChatAPI<T = any>(
  prompt: string,
  options?: { conversationId?: string; parentMessageId?: string },
  signal?: GenericAbortSignal,
) {
  return post<T>({
    url: '/chat',
    data: { prompt, options },
    signal,
  })
}

export function fetchChatConfig<T = any>() {
  return post<T>({
    url: '/config',
  })
}

export function fetchChatAPIProcess<T = any>(
  params: {
    prompt: string
    options?: { conversationId?: string; parentMessageId?: string }
    signal?: GenericAbortSignal
    onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void },
) {
  const settingStore = useSettingStore()

  return post<T>({
    url: '/chat-process',
    data: { prompt: params.prompt, options: params.options, systemMessage: settingStore.systemMessage },
    signal: params.signal,
    onDownloadProgress: params.onDownloadProgress,
  })
}

export function fetchSession<T>() {
  return post<T>({
    url: '/session',
  })
}

export function fetchVerify<T>(token: string) {
  return post<T>({
    url: '/verify',
    data: { token },
  })
}

// 获取微信登录二维码
export function loginQrCode<T>() {
  return get<T>({
    url: '/user/redirect',
    types: 'SERVER',
  })
}

// 获取微信用户信息
export function getWxUserInfoByKey<T>(key: string) {
  return get<T>({
    url: '/user/get-wx-user',
    data: { key },
    types: 'SERVER',
  })
}

// 获取支付二维码
export function getPayQr<T>(data: any) {
  return get<T>({
    url: '/pay/pay-qrcode',
    data,
    types: 'SERVER',
  })
}

// 获取支付状态
export function getPayStatus<T>(data: any) {
  return post<T>({
    url: '/pay/checkPaidStatus',
    data,
    types: 'SERVER',
  })
}

// 获取最新用户信息
export function getUserInfo<T>() {
  return get<T>({
    url: '/user/getUserInfo',
    types: 'SERVER',
  })
}

// 获取套餐列表
export function getComboList<T>() {
  return get<T>({
    url: '/combo/comboList',
    types: 'SERVER',
  })
}
