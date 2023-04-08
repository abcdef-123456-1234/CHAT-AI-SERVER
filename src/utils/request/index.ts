/*
 * @Descripttion:
 * @version:
 * @Author: maolw
 * @Date: 2023-03-23 15:04:03
 * @LastEditors: maolw
 * @LastEditTime: 2023-04-04 13:53:14
 */
import type { AxiosProgressEvent, AxiosResponse, GenericAbortSignal } from 'axios'
import request from './axios'
import serverRquest from './axiosServer'
import { useAuthStore, useUserStore } from '@/store'

export interface HttpOption {
  url: string
  data?: any
  method?: string
  headers?: any
  types?: string
  onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void
  signal?: GenericAbortSignal
  beforeRequest?: () => void
  afterRequest?: () => void
}

export interface Response<T = any> {
  data: T
  message: string | null
  status: string
  success: boolean
}

function http<T>(
  { url, data, method, headers, types, onDownloadProgress, signal, beforeRequest, afterRequest }: HttpOption,
) {
  const successHandler = (res: AxiosResponse<Response<T>>) => {
    const authStore = useAuthStore()

    if (res.data.status === 'Success' || res.data.success === true || typeof res.data === 'string')
      return res.data

    if (res.data.status === 'Unauthorized') {
      authStore.removeToken()
      useUserStore().resetUserInfo()
      window.location.reload()
    }

    return Promise.reject(res.data)
  }

  const failHandler = (error: Response<Error>) => {
    afterRequest?.()
    throw new Error(error?.message || 'Error')
  }

  beforeRequest?.()

  method = method || 'GET'

  const params = Object.assign(typeof data === 'function' ? data() : data ?? {}, {})

  if (types === 'API') {
    return method === 'GET'
      ? request.get(url, { params, signal, onDownloadProgress }).then(successHandler, failHandler)
      : request.post(url, params, { headers, signal, onDownloadProgress }).then(successHandler, failHandler)
  }

  if (types === 'SERVER') {
    return method === 'GET'
      ? serverRquest.get(url, { params, signal, onDownloadProgress }).then(successHandler, failHandler)
      : serverRquest.post(url, params, { headers, signal, onDownloadProgress }).then(successHandler, failHandler)
  }
}

export function get<T = any>(
  { url, data, method = 'GET', onDownloadProgress, signal, beforeRequest, afterRequest, types = 'API' }: HttpOption,
): Promise<Response<T>> {
  const promise = http<T>({
    url,
    method,
    data,
    types,
    onDownloadProgress,
    signal,
    beforeRequest,
    afterRequest,
  })

  return promise!
}

export function post<T = any>(
  { url, data, method = 'POST', headers, onDownloadProgress, signal, beforeRequest, afterRequest, types = 'API' }: HttpOption,
): Promise<Response<T>> {
  const promise = http<T>({
    url,
    method,
    data,
    headers,
    types,
    onDownloadProgress,
    signal,
    beforeRequest,
    afterRequest,
  })

  return promise!
}
