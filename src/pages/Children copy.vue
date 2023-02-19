<template>
  <div class="slide">
    <TransitionGroup name="list">
      <template v-for="item in items" :key="item">
        <div v-if="item === currentIndex" class="item">
          {{ item }}
        </div>
      </template>
    </TransitionGroup>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, onMounted, PropType, ref } from 'vue'
const props = defineProps({
  items: {
    type: Array as PropType<number[]>,
    default: () => []
  }
})

const currentIndex = ref<number>(1)

onMounted(() => {
  setInterval(() => {
    const current = props.items?.findIndex((item) => item === currentIndex.value) as number

    if (current < 0) {
      currentIndex.value = props?.items[0] || -1
    } else if (current < props?.items.length - 1) {
      currentIndex.value = props?.items[current + 1]
    } else {
      currentIndex.value = props?.items?.[0] || -1
    }
  }, 2000)
})
</script>

<style lang="less" scoped>
.list-enter-form {
  transform: translateY(100%);
}

.list-enter-to {
  transform: translateY(0);
}

.list-enter-active {
  transition: all 0.5s ease;
}

.list-leave-active {
  transition: all 0.5s ease;
}
.list-leave-to {
  transform: translateY(-100%);
}

.list-enter-form {
  transform: translateY(0);
}
.slide {
  height: 20px;
  overflow: hidden;
  position: relative;
  margin: 200px;
}

.item {
  background: green;
  color: red;
  text-align: center;
  height: 20px;
  width: 100px;
  transform: translateY(0);
}
</style>
