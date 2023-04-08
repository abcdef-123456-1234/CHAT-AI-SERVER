/*
 * @Descripttion:
 * @version:
 * @Author: maolw
 * @Date: 2023-03-23 15:04:03
 * @LastEditors: maolw
 * @LastEditTime: 2023-04-07 16:15:56
 */
import axios, { type AxiosResponse } from 'axios'
import { useAuthStore } from '@/store'

const service = axios.create({
  baseURL: import.meta.env.VITE_GLOB_API_URL,
})

service.interceptors.request.use(
  (config) => {
    const assessToken = useAuthStore().accessToken
    if (assessToken)
      config.headers.Authorization = `${assessToken}`
    return config
  },
  (error) => {
    return Promise.reject(error.response)
  },
)

service.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    if (response.status === 200)
      return response

    throw new Error(response.status.toString())
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default service
