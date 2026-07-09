<script setup lang="ts" name="BbLoadingIcon">
const props = defineProps({
  size: {
    type: String,
    default: "28px",
  },
  text: {
    default: "",
  },
  type: {
    type: String,
    default: "1",
  },
});
const usedText = computed(() => props.text || (props.type === "1" ? "Homa" : "●●●"))
</script>

<template>
  <div class="bb-loading-icon" :style="{ 'font-size': size }">
    <slot>{{ usedText }}</slot>
  </div>
</template>

<style scoped lang="less">
.bb-loading-icon {
  width: fit-content;
  font-family: system-ui, sans-serif;
  font-weight: bold;
  // text-transform: uppercase;
  color: #0000;
  -webkit-text-stroke: 1px #E96736;
  background: conic-gradient(#E96736 0 0) 0/0% 100% no-repeat;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: l1 1.5s linear infinite;

  @keyframes l1 {
    to {
      background-size: 120% 100%;
    }
  }
}
</style>
