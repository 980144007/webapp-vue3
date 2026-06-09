<template>
  <div class="bb-floating-button-container">
    <slot>
      <van-button class="floating-button" size="mini" type="primary" @click="toRotate">
        旋转屏幕
        <template #icon>
          <van-icon :name="icon" />
        </template>
      </van-button>
    </slot>
  </div>
</template>
<script setup lang="ts">
import icon from "./images/rotate.png"
import { useDeviceInfo } from "@/stores";
const deviceInfo = useDeviceInfo();
// console.log(334, deviceInfo)
function toRotate() {
  deviceInfo.rotateScreen();
}
</script>
<style lang="scss" scoped>
  .bb-floating-button-container {
//     & > :deep(.floating-button) {
//       .van-button__content {
//         .van-button__icon {
// display: flex;
//         align-items: center;
//         }
        
//       }
//     }
  }
</style>