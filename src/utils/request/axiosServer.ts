/*
 * @Descripttion:
 * @version:
 * @Author: maolw
 * @Date: 2023-04-04 10:21:34
 * @LastEditors: maolw
 * @LastEditTime: 2023-04-04 11:27:16
 */
import axios, { type AxiosResponse } from 'axios'
import { useAuthStore, useUserStore } from '@/store'

const service = axios.create({
  baseURL: import.meta.env.VITE_GLOB_SERVER_URL,
})

service.interceptors.request.use(
  (config) => {
    const token = useAuthStore().accessToken
    if (token)
      config.headers.Authorization = token
    return config
  },
  (error) => {
    return Promise.reject(error.response)
  },
)

service.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // eslint-disable-next-line no-console
    console.log('response', response)
    if (response.status === 200)
      return response

    throw new Error(response.status.toString())
  },
  (error) => {
    if (error.response.status === 403) {
      useUserStore().resetUserInfo()
      // eslint-disable-next-line no-console
      console.log('response', error)
    }
    return Promise.reject(error)
  },
)

export default service
