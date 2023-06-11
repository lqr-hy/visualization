<template>
  <div class="glowing-text">THREE - JS</div>
</template>

<script lang="ts" setup>

</script>

<style lang="less" scoped>
.glowing-text {
  font-family: Arial, sans-serif;
  font-size: 48px;
  font-weight: bold;
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  text-shadow: 0 0 10px #fff, 0 0 20px #dcd6d6, 0 0 30px #fff, 0 0 40px #736872, 0 0 70px #ff00de, 0 0 80px #ff00de, 0 0 100px #dcd6d6, 0 0 150px #dcd6d6;
  animation: glowing-text 2s infinite;
}

@keyframes glowing-text {
  0% {
    text-shadow: 0 0 10px #fff, 0 0 20px #dcd6d6, 0 0 30px #f1f1f1, 0 0 40px #736872, 0 0 70px #ff00de, 0 0 80px #ff00de, 0 0 100px #dcd6d6, 0 0 150px #dcd6d6;
  }
  50% {
    text-shadow: none;
  }
  100% {
    text-shadow: 0 0 10px #fff, 0 0 20px #dcd6d6, 0 0 30px #fff, 0 0 40px #736872, 0 0 70px #ff00de, 0 0 80px #ff00de, 0 0 100px #dcd6d6, 0 0 150px #dcd6d6;
  }
}
</style>