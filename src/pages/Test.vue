<template>
  <div>
    <Children :items="items"> </Children>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, watchEffect, watch, computed, ref, onMounted } from 'vue'
import Children from './Children.vue'

export default defineComponent({
  components: {
    Children
  },
  setup() {
    const items = ref([1])
    const flag = ref(false)

    onMounted(() => {
      setTimeout(() => {
        console.log('----')
        items.value.push(2)
        flag.value = true
      }, 1000)
    })

    watchEffect(() => {
      if (flag.value) {
        setTimeout(() => {
          console.log('-++---')
          items.value.shift()
        }, 1600)
      }
    })
    return {
      items
    }
  }
})
</script>

<style lang="less" scoped>
</style>
