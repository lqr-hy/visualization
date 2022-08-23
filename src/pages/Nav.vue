<template>
  <el-row class="tac">
    <el-col :span="24">
      <div class="title">THREE</div>
      <el-menu
        default-active="1-8"
        class="el-menu-vertical-demo"
        @open="handleOpen"
        @close="handleClose"
      >
        <el-sub-menu index="1">
          <template #title>
            <el-icon><location /></el-icon>
            <span>Basic</span>
          </template>
          <el-menu-item index="1-1" @click="handleChangeRoute('/basic/first-scene')"
            >First-scene</el-menu-item
          >
          <el-menu-item index="1-2" @click="handleChangeRoute('/basic/transform')">Transform</el-menu-item>
          <el-menu-item index="1-3" @click="handleChangeRoute('/basic/animation')">Animation</el-menu-item>
          <el-menu-item index="1-4" @click="handleChangeRoute('/basic/camera')">Camera</el-menu-item>
          <el-menu-item index="1-5" @click="handleChangeRoute('/basic/fullscreen')">Fullscreen</el-menu-item>
          <el-menu-item index="1-6" @click="handleChangeRoute('/basic/geometry')">Geometry</el-menu-item>
          <el-menu-item index="1-7" @click="handleChangeRoute('/basic/textures')">Textures</el-menu-item>
          <el-menu-item index="1-8" @click="handleChangeRoute('/basic/materials')">Materials</el-menu-item>
          <el-menu-item index="1-9" @click="handleChangeRoute('/basic/threeD-text')">threeD</el-menu-item>
          <el-menu-item index="1-10" @click="handleChangeRoute('/basic/lights')">Lights</el-menu-item>
          <el-menu-item index="1-11" @click="handleChangeRoute('/basic/shadow')">Shadow</el-menu-item>
          <!-- <el-sub-menu index="1-4">
            <template #title>item four</template>
            <el-menu-item index="1-4-1">item one</el-menu-item>
          </el-sub-menu> -->
        </el-sub-menu>
        <el-menu-item index="2">
          <el-icon><icon-menu /></el-icon>
          <span>Navigator Two</span>
        </el-menu-item>
        <el-menu-item index="4">
          <el-icon><setting /></el-icon>
          <span>Navigator Four</span>
        </el-menu-item>
      </el-menu>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { Menu as IconMenu, Location, Setting } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
const Router = useRouter()
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

const handleChangeRoute = (path: string) => {
  Router.push(path)
}
</script>


<style lang="less" scoped>
.title {
  height: 60px;
  text-align: center;
  line-height: 60px;
  font-size: 48px;
}
</style>