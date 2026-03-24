<template>
  <div class="bb-tabs-container" :class="[hideTabs ? 'hide-tabs' : '', size]">
    <van-tabs v-bind="vanProps" ref="tabsRef" v-model:active="activeName" :lazy-render="true">
      <van-tab v-for="(slot, index) in slotList" :key="slot.props?.name" :name="slot.props?.name" :title="slot.props?.title">
        <component :is="slot"></component>
      </van-tab>
    </van-tabs>
  </div>
</template>
<script setup name="BbTabs">
import {
  computed,
  watch,
  ref,
  useSlots
} from 'vue'
import { useDeviceInfo } from "@/stores";
const deviceStore = useDeviceInfo();
const slots = useSlots();
const slotList = computed(() => {
  const list = slots.default()
  return list.filter((item) => {
    const haveName = item.props?.name || item.props?.name === 0
    const haveTitle = item.props?.title || item.props?.title === 0
    if(!haveName) {
      throw new Error('BbTabs 组件slot必须有 name 属性')
    }
    if(!haveTitle) {
      throw new Error('BbTabs 组件slot必须有 title 属性')
    }
    return haveName && haveTitle
  })
})
const props = defineProps({
  modelValue: {},
  size: {
    type: String,
    default: 'normal'
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
const tabsRef = ref(null)
const hideTabs = computed(() => {
  return props.followFullScreen && deviceStore.isFullScreen
})
watch(() => hideTabs.value, () => {
  tabsRef.value.resize()
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
.bb-tabs-container {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  .main-container {
    flex-grow: 1;
    height: 0px;
  }
  :deep(.van-tabs) {
    .van-tab__panel {
      width: 100%;
    }
      
    }
  &.hide-tabs {
    :deep(.van-tabs) {
      .van-tabs__wrap {
        height: 0px;
        overflow: hidden;
      }
    }

  }

  &.small {
    :deep(.van-tabs) {
      .van-tabs__wrap {
        height: 28px;

        .van-tab {
          padding: 0 4px;
          font-size: @font-size-sm;
          line-height: @font-size-sm;
        }
      }
    }
  }
}
</style>
