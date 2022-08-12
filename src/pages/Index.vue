<template>
  <div class="main">
    <el-container>
      <el-aside width="200px"><Nav /></el-aside>
      <el-container>
        <el-header>欢迎来到Three</el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import Nav from './Nav.vue'
</script>

<style lang="less" scoped>
.main {
  width: 100%;
  height: 100%;
}

.el-container {
  height: 100vh;
  background-color: aliceblue;
}

.el-aside {
  background-color: aquamarine;
}

.el-header {
  background-color: bisque;
}

.el-main {
  background-color: aqua;
}
</style>
