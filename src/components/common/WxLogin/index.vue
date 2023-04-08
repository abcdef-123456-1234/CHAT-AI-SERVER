<script setup lang='ts'>
import { computed, onMounted, ref } from 'vue'
import { NModal, useMessage } from 'naive-ui'
import QRCode from 'qrcode'
import { useAuthStore, useUserStore } from '@/store'
import { getWxUserInfoByKey, loginQrCode } from '@/api'

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const userStore = useUserStore()
const authStore = useAuthStore()

interface Props {
  visible: boolean
}

interface Result {
  data?: string
  success?: boolean
}

const show = computed({
  get() {
    return props.visible
  },
  set(visible: boolean) {
    emit('update:visible', visible)
  },
})

const ms = useMessage()

const url = ref<string>()

const result = ref<Result>()

interface Emit {
  (e: 'update:visible', visible: boolean): void
}

const loading = ref(false)
const isContinue = ref(true)

async function getQrCode() {
  try {
    loading.value = true
    const data = await loginQrCode<any>()
    // 解析返回data.data中url里的各个参数
    const urls = new URL(`${data.data}`)
    const searchParams = urls.searchParams
    const state = searchParams.get('state')
    result.value = data.data
    url.value = await QRCode.toDataURL(data.data)
    const { key } = JSON.parse(`${state}`)
    // 轮询查询用户信息
    getWxUserInfo(key)
  }
  finally {
    loading.value = false
  }
}

const onDialogClose = () => {
  // eslint-disable-next-line no-console
  console.log('onDialogClose')
  isContinue.value = false
}

async function getWxUserInfo(key: string) {
  let data: any = {}
  for (let i = 0; i < 10; i++) {
    // eslint-disable-next-line no-console
    console.log('轮询查询用户信息', isContinue.value)
    data = await new Promise(resolve => setTimeout(() => resolve(getWxUserInfoByKey<any>(key)), 3000))
    if (Object.keys(data.data).length > 0 || isContinue.value === false)
      break
  }

  if (Object.keys(data.data).length > 0) {
    const { user, accessToken } = data.data
    authStore.setAccessToken(accessToken)
    userStore.updateUserInfo({ avatar: user.avatar, name: user.nickName, description: user.isVip ? `${user.vipExpireTime.slice(0, 10)} 到期！` : '账户有效期已过，请充值时长！', login: true, id: user.id, appKey: user.appKey })
    ms.success('登录成功！')
    show.value = false
  }

  return data
}

onMounted(() => {
  getQrCode()
})
</script>

<template>
  <NModal v-model:show="show" :auto-focus="false" preset="card" style="max-width: 400px;" :mask-closable="false" title="微信登录(微信网页授权)" :on-close="onDialogClose" :on-esc="onDialogClose">
    <div style="display: flex; justify-content: center; align-items: center; flex-direction: column;">
      <img :src="url">
      <p>
        扫码登录使用CHAT-GPT AI 对话功能
      </p>
    </div>
  </NModal>
</template>
