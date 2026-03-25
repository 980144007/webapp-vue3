<template>
  <div 
    class="page-mine-container" 
    @mousemove="handleMouseMove"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <div class="scene">
      <div
        class="cube"
        :style="{ transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)` }"
      >
        <div class="face" v-for="i in 6" :key="i">{{ i }}</div>
      </div>
    </div>
  </div>
</template>

<script setup name="Mine">
import { ref } from "vue";

const faceOpacity = ref(0.6);

const rotateX = ref(-30);
const rotateY = ref(45);

let touchStartX = 0;
let touchStartY = 0;
let isTouching = false;

const handleMouseMove = (e) => {
  rotateX.value = -30 + (e.clientY / window.innerHeight - 0.5) * 60;
  rotateY.value = 45 + (e.clientX / window.innerWidth - 0.5) * 60;
};

const handleTouchStart = (e) => {
  isTouching = true;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
};

const handleTouchMove = (e) => {
  if (!isTouching) return;
  e.preventDefault();
  
  const touchX = e.touches[0].clientX;
  const touchY = e.touches[0].clientY;
  
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
.page-mine-container {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background-color: #000000;

  .scene {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    perspective: 1800px;
  }

  .cube {
    position: relative;
    width: 200px;
    height: 200px;
    transform-style: preserve-3d;
    transition: transform 0.1s ease-out;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    .face {
      position: absolute;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 30px;
      font-weight: bold;
      color: white;
      backface-visibility: visible;
      
      &:nth-child(1) {
        background-color: rgba(255, 0, 0, v-bind(faceOpacity));
        transform: translateZ(100px);
      }

      &:nth-child(2) {
        background-color: rgba(0, 255, 0, v-bind(faceOpacity));
        transform: rotateY(180deg) translateZ(100px);
      }

      &:nth-child(3) {
        background-color: rgba(0, 0, 255, v-bind(faceOpacity));
        transform: rotateY(90deg) translateZ(100px);
      }

      &:nth-child(4) {
        background-color: rgba(255, 255, 0, v-bind(faceOpacity));
        transform: rotateY(-90deg) translateZ(100px);
      }

      &:nth-child(5) {
        background-color: rgba(255, 0, 255, v-bind(faceOpacity));
        transform: rotateX(90deg) translateZ(100px);
      }

      &:nth-child(6) {
        background-color: rgba(0, 255, 255, v-bind(faceOpacity));
        transform: rotateX(-90deg) translateZ(100px);
      }
    }
  }
}
</style>
