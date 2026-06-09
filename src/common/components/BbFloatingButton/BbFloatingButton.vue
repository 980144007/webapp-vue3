<template>
  <div class="bb-rotate-container">
    <slot>
      <van-button
        class="floating-button"
        size="mini"
        type="primary"
      >
        {{ text }}
      </van-button>
    </slot>
  </div>
</template>
<script setup lang="ts">

const props = defineProps({
  zIndex: {
    type: [Number, String],
    default: "999",
  },
  text: {
    type: String,
    default: "",
  },
  right: {
    type: [Number, String],
    default: "10vw",
  },
  bottom: {
    type: [Number, String],
    default: "20vh",
  },
  size: {
    type: [Number, String],
    default: "50px",
  },
});

</script>
<style lang="less" scoped>
.bb-rotate-container {
  position: fixed;
  right: v-bind(right);
  bottom: v-bind(bottom);
  z-index: v-bind(zIndex);
  & > :deep(.floating-button) {
    width: v-bind(size);
    height: v-bind(size);
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    .van-button__content {
      .van-button__icon {
        display: flex;
        align-items: center;
      }
    }
  }
}
</style>
