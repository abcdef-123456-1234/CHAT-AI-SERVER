/*
 * @Descripttion:
 * @version:
 * @Author: maolw
 * @Date: 2023-03-23 15:04:03
 * @LastEditors: maolw
 * @LastEditTime: 2023-04-07 16:33:21
 */
import fetch from 'node-fetch'

const auth = async (req, res, next) => {
  const token = req.header('Authorization')

  const headers = {
    'Authorization': token,
    'Content-Type': 'application/json',
  }

  // 校验该token是否有效，以及会员是否过期
  const result = await fetch('https://fcdml.com/baas-dev/chat/check-vip', { headers })
  const data: any = await result.json()
  global.console.log('返回结果：', data)
  if (data.success === false) {
    res.send({ status: 'Unauthorized', message: '请登录后使用！' ?? 'Please authenticate.', data: null })
  }
  else {
    if (data.data === false)
      res.send({ status: 'Unauthorized', message: '会员已过期，请充值时长', data: null })

    next()
  }
}

export { auth }
