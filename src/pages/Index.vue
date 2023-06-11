<template>
  <div class="main">
    <el-container>
      <el-aside width="200px">
        <Nav/>
      </el-aside>
      <el-container>
        <el-header>
          <Header/>
        </el-header>
        <el-main>
          <router-view/>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import Nav from './Nav.vue'
import Header from "./Header.vue"
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
  background-color: #ffffff;
}

.el-header {
  background-color: #dadada;
}

.el-main {
  // background-color: aqua;
}
</style>
