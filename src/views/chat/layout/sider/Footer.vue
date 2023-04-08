<!--
 * @Descripttion:
 * @version:
 * @Author: maolw
 * @Date: 2023-03-23 15:04:03
 * @LastEditors: maolw
 * @LastEditTime: 2023-04-04 10:19:44
-->
<script setup lang='ts'>
import { computed, defineAsyncComponent, ref } from 'vue'
import { useUserStore } from '@/store'
import { HoverButton, SvgIcon, UserAvatar } from '@/components/common'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const Setting = defineAsyncComponent(() => import('@/components/common/Setting/index.vue'))
const WxLogin = defineAsyncComponent(() => import('@/components/common/WxLogin/index.vue'))

const show = ref(false)
const showWx = ref(false)

async function showLoginQr() {
  if (userInfo.value.login)
    showWx.value = false
  else
    showWx.value = true
}
</script>

<template>
  <footer class="flex items-center justify-between min-w-0 p-4 overflow-hidden border-t dark:border-neutral-800">
    <div class="flex-1 flex-shrink-0 overflow-hidden" @click="showLoginQr()">
      <UserAvatar />
    </div>

    <HoverButton @click="show = true">
      <span class="text-xl text-[#4f555e] dark:text-white">
        <SvgIcon icon="ri:settings-4-line" />
      </span>
    </HoverButton>

    <Setting v-if="show" v-model:visible="show" />
    <WxLogin v-if="showWx" v-model:visible="showWx" />
  </footer>
</template>
