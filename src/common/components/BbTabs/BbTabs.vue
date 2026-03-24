<template>
  <div class="bb-tabs-container" :class="[hideTabs ? 'hide-tabs' : '', size]">
    <van-tabs ref="tabsRef" v-model:active="activeName" :lazy-render="true">
      <van-tab v-for="({ name, title, component, ...other }) in list" :key="name" :name="name" :title="title">
        <component :is="component" v-bind="other"></component>
      </van-tab>
    </van-tabs>
  </div>
</template>
<script setup lang="ts">
import {
  computed,
  watch,
  ref
} from 'vue'
import { useDeviceInfo } from "@/stores";
const deviceStore = useDeviceInfo();

const props = defineProps({
  modelValue: {},
  list: {
    type: Array,
    default: () => []
  },
  navPosition: {
    type: String,
    default: 'bottom'
  },
  followFullScreen: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'normal'
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
