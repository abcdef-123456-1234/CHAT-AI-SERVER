<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { NButton, NModal, useMessage } from 'naive-ui'
import QRCode from 'qrcode'
import { getComboList, getPayQr, getPayStatus, getUserInfo } from '@/api'
import { useUserStore } from '@/store'

interface Props {
  visible: boolean
}

interface Introduce {
  id: number
  title: string
  desc: string
  img: string
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const ms = useMessage()

const res = ref<any>()

const userStore = useUserStore()

const currSelect = ref<number>(1)
const showPayModal = ref<boolean>(false)
const qrcodeContainer = ref<string>()
const showPayMsg = ref<string>('')
const payList = ref<Array<any>>([])

const introduceList: Introduce[] = [
  {
    id: 1,
    title: '独享接口',
    desc: '一人独享一条接口畅快对话',
    img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAYAAAAehFoBAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAARtSURBVFiFxZlPaBxVHMe/v8m2gdBLJBJmIf+wEV3jxpktiWQ3gg32koKCCoINag2IpCC11YPQg+Rg2ZCTdQ20xB56Ehr0UAua5GDMYoj7EtOkSEPtsiu+6oKnHJP5edg/3dmd3Z23O9l+4MHse7/f+33n7Zs3v/eG0ACBQOBoa2v7GBENAxwE8BQAP4B2AC0A9oiQYUaSCNvMWCPSlhOJFVlvTKrH6cSJkVcti94G8BqAI3WEXQKsG0LEryt7qhgbRmSCiC8CCKoGqkCSiKOJRPxrtw6uBBtGZFDTeIYZr9SvrSorlsUXNjfj67UMawo2zfAHAOY8kVUDIp5KJOKxajYt1RpDochlAJc9VVUVGtf1njYpU4uVLCoKNs3wlwA+PhRd1QnreneHlOnbTo2OgnMj+zjE5hmqNNJlgnNztonToCJhv78rI2Xa9iDaHjrDiAwS8WZzdVXHsnioePXQihs1jWeaL6k6mkazxb8LU8IwIhMALjZdUW16/P6uf6VM/wYUjXDuDeYJk++/hbnYNExzwJP+mOnT/DUBhdzgu0Y7No3nMPfV57a6oZE3Gu02B78nRPy6BgC5RKZhTONZsLVvK5NnvRKsnQEAXyAQOIps1tU4bAHWQXmdN52PhUKjutba2j6GulLEcq59swDwvq2IjbtedA0AYLZOatnk2zuuzi9kR9k6wNX5BYjNPzzrmwjDvtxOwTvYAlv7hWtPu2YMtOh692cAOt06TU6cRmz2PMwXnsatH3+1tcVmz2P81IsAM8AMc7Df0W5y4jQm3xmH3tkBsXXPtWAioEXXu6cBtLlxMIP9uPTJGQAMvfMJmMF+3PppLSt25iOYweMA2Fac7MZPDWfrB49D/L4L+c9/bjUf8SG7YXQJA/m/G4D5fB9i0XOF6+I2241WtWP34YFjPtRI4u16GVyybBkDfdmm0uWshIp2rCQYPgB7AI65MRZ37lccxXoRd+6rmO9pRMgoBdjaBfjAkyK2dpVujggZjRlJNcG5UfaiKC57zEj6cicyL6t41ZqvbhFbfyrZE2FbY8aaklc+X/CgiO0HaqEZaxqRtqziJHaSZflC3UVtSQORtqxlD+Zoya3Txk7KsxHe2EmpyF1KJFZkbsdh3VC502vf/lKW96oWsZ1UCVnQWNg1m2b4AYBet+5XLr2uGPAR4u5fmL+p9OgkhVjtA7IvDgAAEUeZqeq5VjHnpm+qBGwIIo4WrosbTDP8M4DRpilxx4oQqy/lf9jOJSyLLzRfT3VKNdkSn4cP03/7/V0ZgMabK8sZIp7a2Ih/X1xXlqlJmV7X9Z42AOGmKXOEokKsflFa65haSpla1PXuDgBDh67LmStCrDqenlbMhaVM3348I03RSmKBGsm7lKnFZs5pIp5ymgbF1NxtSJle7+zs+oGIngHQ45k6OyuWxW+WPmBOKH32CoVGPswdzPXWq6yEw/nsVYppjrybPevisXr8m/ZhsZRQaFRntk4SYZgZA0ToZcaTeLRH9PzT7f/OpJflq1W2PwAAAABJRU5ErkJggg==',
  },
  {
    id: 2,
    title: '超低延迟',
    desc: '超低延迟回复秒回',
    img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAYAAAAehFoBAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAU7SURBVFiFzZltbBRFGMf/z/akCSEaDITsaUsFQbgrLTtLIPYKRho/mMagKMGATVrb+kKJJoAkaoyYkEggaAxSTOgJKgVFYzAmJcqLkdIaQm6vVA58Qb1yxG2oiSbytfv4YbfX23vd3bse/pP5sDPzzPO7uZmd55klFKFAIDCtsnJmExGtALgOwHwAfgAzAVQAuEWEMWbEiXCZGReIpLORSL/u1Sd5MVq2rGGNYdBGAI8DuMOD2zOAcUTTBg+7tnTTWVEaW4h4G4A6t45yKE7EuyORwQNODRwBK0pjvSTxHmY84p0tr/oNg7cODQ1eLNSxILAQoecBfFASrAIi4q5IZLA7X5+KfI2q2rgLwK6SUuUVNcvy3Om6fv10rh45gYUI7QOwZUq48isky9WzdD1xMltjVmBrZm8H7ISW55rpDGBrzZZxGeRUyO+vGtP1hG0j2jadojTWE/FQebnyyzB4eerbQ0ptlCTeU36k/JIk2pv6nJxh61D4eKocC1ELAHiuY735rAQBAFo0hhc2vZHXlog3TRwuvpTKbVMCqgTR2b4OqgjaG3jcbF+6qOAYzLQdwCSwGRuU7Li1QAPofPYpCCVgOjXGixmuRoiGVk0bPOwDACuQKZk62p5EZ9ta86EAqDZ01eGo0jMADvsCgcA0mFFXSXTgvdfMv9n6y7WhnwAAkagJ1tn2hK1/RIs5HJmbVHWl7KusnNkEDyGiWLoIna1rMuvrFthm9eChL5PQAKAuXQhRn7JumR37ZDZW+6zg2x1s/QPofif7HmWehI1e+tkGCwAHD51A97uvJJ97Pjrh2C8RVvisTMGVuvduKbg2AUBZcn9GnahfmLTVLv3iyi8zaiWYaY1jdbQ0m+vTYeloaZ6ErVuAjpZHk23ps19IRKghIUJjAGY5MRB1C9C95yVXTiakDf9qrm9LBz85ifCRPrfD3PLBTBgdSVkyP7n73UosmWe3ZcPLMDN8KBDEp0qtm1fsAQAA6On9FuHebzzZkhChfwHMcGrQvsGe1nVsdJfm9fSeQvjoKVc2KbpFqhr6nRn3eR3hh6/fdtX/wcde9eoKRPhDYkbcraFSO/n7tOFrjt8Y2vA1z7AAwIy4RITLbozan34Y+3e2Yv/ONgBA1+thaMO/gY3xgsXjRkuKCJcrZLn6bgBrHcGufwjt61cBzJBn3wUAiMZG0Hd2CGCGCFabR22OMnrzb/R9d6kY5n0Vfn/NXwBvdWoxevMfiGAVAAsQhGhsBNHYCMKffQ8RrII8+06Yx7299J0dRjQ24pmWSNosmRdzdMaJQTQ2AmbDPFqt0r6uAfvf2gAlWA0AiPwYt7WnlvDxc55hAToTifTrVk5nHHFuyBmbSVl8D5RAVc52LRZH15u9RcBOMkoAYN0ixp3xGibAjmPQYnGwMY6e4+fx4ecDyfbUjdZz/Dw27/gU0SuJYmjjEzedySRUVRteZKa891rpUhbfCwCIXr1hqx849jKiV24g/MWFjDYvSk1CbfcSQoTOAVhZtIfSql/TBlZNPNjuJQzD+duiXEpnsgU+o6OJP/3+qjGAmvE/EBF3RaODX6XWZURqup64KMtzpwMIlY0sq2i3pg1kBCpZQ0tdv35alqtnAVg+5VzZ9b6mDWS9Pc0ZC+t64uTtmWnanQsWKBC86/r10+Vc00TclW0ZpKpgtqHriYtz5lT1EdEiAHNLRmdXv2HwuvQNlk2uPntZh8t2ADVeydI0NZ+90iVEQ6t518VNXuzL9mExXaq6UmY2VhNhBTNqiVDDjNmYzBFL/un2PyIYavbF/7GMAAAAAElFTkSuQmCC',
  },
  {
    id: 3,
    title: '无限畅聊',
    desc: '不受对话次数限制',
    img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAYAAAAehFoBAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAASmSURBVFiFxZl/aBNnGMe/z5lZEP9YoeIuXZp2P9CmXeu9KS006XB2gliKY7IJ1eqwdT9axmBKYYwNNoRJZX/Nzg1bcSL7BcKGoH/YlrmshdLl0tVUGA4Xm7GT9c/5Z71nfyTtkvTu8l6Sph94IXnv+eb55nju7nnfIxRBIBDYXFFR2UlEbQA3AXgagBdAJYBNAB4SYYkZCSLEmTFDpExGoxGj0JxUiKilpf2AadJhAC8BeKyAtBOAeUXXpy+5VroJ1rRwLxGfAtDkNpENCSIejkanz8sKpAxrWrhZUfgsM/YW7s2RiGnyybm56dl8gXkNCxF6A8AXJbGVByIejEanP3eK2eR0MBgMnwFwpqSuHKEuVfVvMYzFcbsIW8NChD4D8O66+HImpKo1VYaRvGF10NJw+sxuhNkVWu3O9BrD6ZotYxnYEvJ6fUuGkcy6ELMuOk0LNxPxXHl9OWOa3Jp591AyDyoKny2/JWcUhT7N/L5aEpoW7gVwquyO8uP3en3/GEbyVwDwrMymn2B5EaIRQmvA6/2HinKhxxbw5sAHUrHMNATgPJA+wy0t7QeY6R0Z8YfvD6B7/26AuaihPlEFBqDH7sikfVxVffcNIzmnAEC6kZFC7NoB5uWSjBPHX5ZNC0A5AgBKIBDYjFTXJYWuxwHzUUmGrsddGObOYLBD9VRUVHbCRYt44eJVAIDYtdNFMmtGL/3gKp7Z3KOkmm9XKojmHUXX8OrvuIAIbZ70SkGK/qPd6D/W7SqJI0e7MPrVNYxeviYVzoxGBalljRSi+ZmS1e/K6O/dL/3/iFDrQWoNJme48SnAXLY9rs/ftdc2PSttzA5mbPMgtWCUVDyynNbn/8DA0DlHad/hfTjRu8+NPyu2KsjTxGcZ++13sLm8Ztj9kUyCTXWW2guXr7tyTEKE/gWwVVbQ17MX/T0vukpix+B7X0K/fc+N5KFChCU3irGvb5bmoTF/161ZEGHJw4wEgDpZkdZYB7D9hSeLaKhxrWFGwpPekXlBRtB3aDfEc36wubZmx769BT2esNWOnD5mOTf6zS3EFux1mRAh7mHGDIC3pQy/Gk59yDEcW7iPse9+ctTGbt+D1uDPmtPqfRj5+AjaD56WMsyMGQ+RMslsSgnsSkELVGPkox5E44u2Ui1QXXQpESmTnmg0YggRngC4M6/CohRWDdVXQ6uvLkgrB01EoxEjvaYzr8hIRr//xfJeWsxwqvtsUh5XV81ChP4EUJtPdvxgG0TgSckkzuh3/sLFqzMyoQldn6oDMgwHg+1vMZPjvtZGQcQDKzucWfsSQoR+BtCxIa7siej61PMrX7L2JUyTT5bfjzO5nrIanwcPkn97vb4lgLrKa8saIh6MxaZ/zJxb06kZRnJWVf1bAITK5swSGtb1qU9yZy1bS8NYHFfVmioArevuy5pzuj5luXtq2wsbRvLGxpxpGrYzC+Rp3g1jcbycNU3Eg1ZlkEne1YZhJGe3b/ddJ6KdAPz54gskYpr8Su4FZoWr117ph8sQJJ6IkqzPa69chGh/LbXXJdEwWactz4vFXILBDpXZ3EOENmY0EqGWGdvw/xqx5K9u/wP/GMtxFuYu+wAAAABJRU5ErkJggg==',
  },
  {
    id: 4,
    title: '超多模板',
    desc: '不同领域、专业回答',
    img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAYAAAAehFoBAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAASmSURBVFiFxZl/aBNnGMe/z5lZEP9YoeIuXZp2P9CmXeu9KS006XB2gliKY7IJ1eqwdT9axmBKYYwNNoRJZX/Nzg1bcSL7BcKGoH/YlrmshdLl0tVUGA4Xm7GT9c/5Z71nfyTtkvTu8l6Sph94IXnv+eb55nju7nnfIxRBIBDYXFFR2UlEbQA3AXgagBdAJYBNAB4SYYkZCSLEmTFDpExGoxGj0JxUiKilpf2AadJhAC8BeKyAtBOAeUXXpy+5VroJ1rRwLxGfAtDkNpENCSIejkanz8sKpAxrWrhZUfgsM/YW7s2RiGnyybm56dl8gXkNCxF6A8AXJbGVByIejEanP3eK2eR0MBgMnwFwpqSuHKEuVfVvMYzFcbsIW8NChD4D8O66+HImpKo1VYaRvGF10NJw+sxuhNkVWu3O9BrD6ZotYxnYEvJ6fUuGkcy6ELMuOk0LNxPxXHl9OWOa3Jp591AyDyoKny2/JWcUhT7N/L5aEpoW7gVwquyO8uP3en3/GEbyVwDwrMymn2B5EaIRQmvA6/2HinKhxxbw5sAHUrHMNATgPJA+wy0t7QeY6R0Z8YfvD6B7/26AuaihPlEFBqDH7sikfVxVffcNIzmnAEC6kZFC7NoB5uWSjBPHX5ZNC0A5AgBKIBDYjFTXJYWuxwHzUUmGrsddGObOYLBD9VRUVHbCRYt44eJVAIDYtdNFMmtGL/3gKp7Z3KOkmm9XKojmHUXX8OrvuIAIbZ70SkGK/qPd6D/W7SqJI0e7MPrVNYxeviYVzoxGBalljRSi+ZmS1e/K6O/dL/3/iFDrQWoNJme48SnAXLY9rs/ftdc2PSttzA5mbPMgtWCUVDyynNbn/8DA0DlHad/hfTjRu8+NPyu2KsjTxGcZ++13sLm8Ztj9kUyCTXWW2guXr7tyTEKE/gWwVVbQ17MX/T0vukpix+B7X0K/fc+N5KFChCU3irGvb5bmoTF/161ZEGHJw4wEgDpZkdZYB7D9hSeLaKhxrWFGwpPekXlBRtB3aDfEc36wubZmx769BT2esNWOnD5mOTf6zS3EFux1mRAh7mHGDIC3pQy/Gk59yDEcW7iPse9+ctTGbt+D1uDPmtPqfRj5+AjaD56WMsyMGQ+RMslsSgnsSkELVGPkox5E44u2Ui1QXXQpESmTnmg0YggRngC4M6/CohRWDdVXQ6uvLkgrB01EoxEjvaYzr8hIRr//xfJeWsxwqvtsUh5XV81ChP4EUJtPdvxgG0TgSckkzuh3/sLFqzMyoQldn6oDMgwHg+1vMZPjvtZGQcQDKzucWfsSQoR+BtCxIa7siej61PMrX7L2JUyTT5bfjzO5nrIanwcPkn97vb4lgLrKa8saIh6MxaZ/zJxb06kZRnJWVf1bAITK5swSGtb1qU9yZy1bS8NYHFfVmioArevuy5pzuj5luXtq2wsbRvLGxpxpGrYzC+Rp3g1jcbycNU3Eg1ZlkEne1YZhJGe3b/ddJ6KdAPz54gskYpr8Su4FZoWr117ph8sQJJ6IkqzPa69chGh/LbXXJdEwWactz4vFXILBDpXZ3EOENmY0EqGWGdvw/xqx5K9u/wP/GMtxFuYu+wAAAABJRU5ErkJggg==',
  },
]

const show = computed({
  get: () => props.visible,
  set: (visible: boolean) => emit('update:visible', visible),
})

async function getCombos() {
  const result = await getComboList<any>()
  // eslint-disable-next-line no-console
  console.log('result', result)
  if (result.success === true)
    payList.value = result.data
}

interface Emit {
  (e: 'update:visible', visible: boolean): void
}

const selectVip = (data: any) => {
  currSelect.value = data.id
}

const onDialogClose = () => {
  // eslint-disable-next-line no-console
  console.log('取消点击：')
  showPayModal.value = false
  showPayMsg.value = '取消支付'
}

const getPayStatusInfo = async (result: any) => {
  let payResult: any = {}
  let total = 0
  for (let i = 0; i < 30; i++) {
    total += 1
    try {
      payResult = await new Promise(resolve => setTimeout(() => resolve(getPayStatus<any>({ key: result.data.data.appKey, orderNo: result.data.data.orderNo })), 2000))
      // eslint-disable-next-line no-console
      console.log('payResult', payResult)

      if ((payResult.success === true && payResult.data === '支付成功'))
        break
    }
    catch (error) {
      if (showPayModal.value === false)
        break
    }
  }

  if (total >= 29)
    showPayMsg.value = '支付超时'

  return payResult.success
}

const showPayQr = async () => {
  const data = payList.value.find(item => item.id === currSelect.value) || { price: 0.01, desc: '', day: -1 }
  const result = await getPayQr<any>({ appKey: userStore.userInfo.appKey, amount: data.price, desc: data.desc, days: data.day })
  res.value = result.data.data
  // eslint-disable-next-line no-console
  console.log('返回的url：', result.data.data.qrCode)

  // 调用 QRCode.toCanvas 方法生成二维码
  qrcodeContainer.value = await QRCode.toDataURL(result.data.data.qrCode)

  showPayModal.value = true

  const isSuccessPay = await getPayStatusInfo(result)

  if (isSuccessPay) {
    ms.success('支付成功')
    // 更新用户信息
    const user: any = await getUserInfo()
    userStore.updateUserInfo({ description: user.data.isVip ? `${user.data.vipExpireTime.slice(0, 10)} 到期！` : '账户有效期已过，请充值时长！' })
    show.value = false
  }
  else {
    ms.warning(showPayMsg.value)
  }
  showPayModal.value = false
}

onMounted(() => {
  getCombos()
})
</script>

<template>
  <NModal v-model:show="show" :auto-focus="false" preset="card" style="max-width: 420px; background-image: url(https://file.fcdml.com/qiye-pay-bg.png);" :mask-closable="false" title="购买会员">
    <div style="display: flex; justify-content: center; align-items: center; flex-direction: column; height: 550px;">
      <div class="pay-npanel-content">
        <div class="sub-title">
          成为VIP会员 即可无限次对话
        </div>
      </div>
      <div class="pay-npanel">
        <div v-for="item in payList" :key="item.id" class="pay-npanel-list" :style="{ border: item.id === currSelect ? 'solid 2px #864d07' : 'solid 1px #9999' }" @click="selectVip(item)">
          <div class="item">
            ￥
            <span class="b">{{ item.price / 100 }}</span>
            <span class="day">/{{ item.date }}天</span>
          </div>
          <div class="price_discount">
            {{ item.desc }}
          </div>
        </div>
      </div>
      <div class="pay_tool_footer">
        <NButton type="primary" class="button" @click="showPayQr()">
          立即开通体验
        </NButton>
      </div>
      <div class="vip-power-content">
        <div class="vip-power">
          <div class="title">
            会员权益
          </div>
          <div class="" style="display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap;">
            <div v-for="item in introduceList" :key="item.id" class="" style="width: 120px; height: 90px; margin: 10px 5px; display: flex; justify-content: center; align-items: center;">
              <img class="" style="padding-right: 10px" :src="item.img">
              <div style="display: flex; justify-content: center; flex-direction: column; padding-left: 5px;">
                <span style="font-weight: 550">{{ item.title }}</span>
                <span style="font-size: 14px; border-color: #e5e7eb; width: 90px; transform-origin: left; transform: scale(.8); white-space: normal;">{{ item.desc }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NModal>
  <NModal
    v-model:show="showPayModal"
    style="width: 400px; height: 400px;"
    class="custom-card"
    :mask-closable="false"
    preset="card"
    title="请使用微信扫码支付"
    size="huge"
    :bordered="false"
    :on-close="onDialogClose"
    :on-esc="onDialogClose"
  >
    <div style="display: flex;justify-content: center;align-items: center; width: 100%; height: 100%;">
      <img :src="qrcodeContainer" style="width: 220px; height: 220px">
    </div>
    <template #footer>
      订单号：{{ res.orderNo }}
    </template>
  </NModal>
</template>
