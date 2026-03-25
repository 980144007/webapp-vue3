<template>
  <div class="bb-tabbar-container" :class="{'hide-tabs': followFullScreen && deviceStore.isFullScreen}">
    <van-tabbar v-bind="vanProps" v-if="slotList.length > 1 && navPosition === 'top' && !(followFullScreen && deviceStore.isFullScreen)" v-model="activeName" :fixed="false">
      <van-tabbar-item v-for="(slot, index) in slotList" :key="index" :name="slot.props.name" :icon="slot.props?.icon">{{ slot.props?.title }}</van-tabbar-item>
    </van-tabbar>
    <div class="main-container">
      <component v-for="(slot, index) in slotList" :key="slot.props?.name" v-show="activeName === slot.props.name" :is="slot" />
    </div>
    <van-tabbar v-bind="vanProps" v-if="slotList.length > 1 && navPosition === 'bottom' && !(followFullScreen && deviceStore.isFullScreen)" v-model="activeName" :fixed="false">
      <van-tabbar-item v-for="(slot, index) in slotList" :key="index" :name="slot.props.name" :icon="slot.props?.icon">
          <span>{{ slot.props?.title }}</span>
          <template #icon="props">
            <van-icon :name="activeName === slot.props.name ? slot.props?.activeIcon || slot.props?.icon : slot.props?.icon" size="24px" />
          </template>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>
<script setup lang="ts">
import {
  computed,
  ref,
  useSlots,
} from 'vue'
import { useDeviceInfo } from '@/stores'

const slots = useSlots();
const slotList = computed(() => {
  const list = (slots.default?.() || []).reduce((prev, cur) => {
    if (cur.children) {
      prev.push(...cur.children)
    } else {
      prev.push(cur)
    }
    return prev
  }, [])
  return list.filter((item) => {
    const haveName = item.props?.name || item.props?.name === 0
    const haveTitle = item.props?.title || item.props?.title === 0
    if(!haveName) {
      throw new Error('BbTabbar 组件slot必须有 name 属性')
    }
    if(!haveTitle) {
      throw new Error('BbTabbar 组件slot必须有 title 属性')
    }
    return haveName && haveTitle
  })
})

const deviceStore = useDeviceInfo();
const props = defineProps({
  modelValue: {},
  navPosition: {
    type: String,
    default: 'bottom'
  },
  followFullScreen: {
    type: Boolean,
    default: false
  },
  vanProps: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(["update:modelValue"])
const activeName = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

</script>
<style lang="less" scoped>
.bb-tabbar-container {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  .main-container {
    flex-grow: 1;
    height: 0px;
    overflow: auto;
    
  }
  :deep(.van-tabbar) {
    padding: 4px 0px;
      .van-tabbar-item {
        .van-tabbar-item__icon {
          img {
            height: 26px;
          }
          
        }
      }
    }
  &.hide-tabs {
    :deep(.van-tabs) {
      .van-tabs__wrap {
        display: none;
      }
    }

  }
}
</style>
