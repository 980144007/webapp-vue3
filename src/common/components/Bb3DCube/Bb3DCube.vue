<template>
  <div
    class="cm-3d-text-container"
    @mousemove="handleMouseMove"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <div class="scene">
      <div
        class="cube"
        :style="{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          width: cubeSize,
          height: cubeSize,
          '--translate-z': translateZ,
          fontSize: fontSize
        }"
      >
        {{ text }}
        <div
          class="face"
          v-for="i in 6"
          :key="i"
        >
          <span class="face-text">{{ text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup name="Bb3DCube">
import { ref, computed } from "vue";

const props = defineProps({
  text: {
    type: String,
    default: "",
  },
  size: {
    type: String,
    default: "200px",
  },
  fontSize: {
    type: String,
    default: "1.5em",
  },
  textColor: {
    type: String,
    default: "#ffffff",
  },
});

const rotateX = ref(-30);
const rotateY = ref(45);

const cubeSize = computed(() => props.size);
const translateZ = computed(() => {
  const num = parseInt(props.size);
  return `${num / 2}px`;
});

let touchStartX = 0;
let touchStartY = 0;
let isTouching = false;

const handleMouseMove = ({clientX, clientY}) => {
  rotateX.value = -30 + (clientY / window.innerHeight - 0.5) * 60;
  rotateY.value = 45 + (clientX / window.innerWidth - 0.5) * 60;
};

const handleTouchStart = ({touches: [{clientX, clientY}]}) => {
  isTouching = true;
  touchStartX = clientX;
  touchStartY = clientY;
};

const handleTouchMove = (e) => {
  if (!isTouching) return;
  e.preventDefault();
  const {
    touches: [{clientX, clientY}]
  } = e;
  const touchX = clientX;
  const touchY = clientY;

  const deltaX = touchX - touchStartX;
  const deltaY = touchY - touchStartY;

  rotateY.value += deltaX * 0.5;
  rotateX.value -= deltaY * 0.5;

  touchStartX = touchX;
  touchStartY = touchY;
};

const handleTouchEnd = () => {
  isTouching = false;
};
</script>
<style lang="less" scoped>
.cm-3d-text-container {
  display: flex;
  flex-direction: column;
  padding: 50px;

  .scene {
    display: flex;
    justify-content: center;
    align-items: center;
    perspective: 1800px;
  }

  .cube {
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.1s ease-out;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    .face {
      position: absolute;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      opacity: 0.8;
      backface-visibility: visible;
      cursor: pointer;
      transform-style: preserve-3d;

      .face-text {
        position: absolute;
        z-index: 10;
        pointer-events: none;
        user-select: none;
        transform: translateZ(1px);
        background: v-bind(textColor);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        text-fill-color: transparent;
      }

      &:nth-child(1) {
        background-color: rgba(0, 255, 0, 0.9);
        transform: translateZ(var(--translate-z));
      }

      &:nth-child(2) {
        background-color: rgba(122, 250, 154, 0.9);
        transform: rotateY(180deg) translateZ(var(--translate-z));
      }

      &:nth-child(3) {
        background-color: rgba(255, 255, 0, 0.9);
        transform: rotateY(90deg) translateZ(var(--translate-z));
      }

      &:nth-child(4) {
        background-color: rgba(128, 184, 247, 0.9);
        transform: rotateY(-90deg) translateZ(var(--translate-z));
      }

      &:nth-child(5) {
        background-color: rgba(248, 148, 248, 0.9);
        transform: rotateX(90deg) translateZ(var(--translate-z));
      }

      &:nth-child(6) {
        background-color: rgba(0, 255, 255, 0.9);
        transform: rotateX(-90deg) translateZ(var(--translate-z));
      }
    }
  }
}
</style>
