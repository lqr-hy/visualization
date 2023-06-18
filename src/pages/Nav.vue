<template>
  <el-row class="tac">
    <el-col :span="24">
      <div class="title">Visualization</div>
      <el-menu
          :default-active="$route.path"
          class="el-menu-vertical-demo"
          @open="handleOpen"
          @close="handleClose"
          :unique-opened="true"
      >
        <el-sub-menu :index="navKey" v-for="(navValue, navKey) in nav" :key="navKey">
          <template #title>
            <el-icon>
              <FolderOpened/>
            </el-icon>
            <span>{{ navKey }}</span>
          </template>
          <el-menu-item :index="`/${navKey}/${navPath}`"
                        v-for="navPath of navValue"
                       :key="navPath"
                        @click="handleChangeRoute(`/${navKey}/${navPath}`)"
          >{{ navPath }}
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="3-1">
          <template #title>
            <el-icon>
              <FolderOpened/>
            </el-icon>
            <span>Projects</span>
          </template>
          <el-menu-item index="3-1" @click="handleChangeRoute(`/projects/House`)">House</el-menu-item>
          <el-menu-item index="3-1" @click="handleChangeRoute(`/ScrollBaseAnimation`)">ScrollBaseAnimation</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { FolderOpened } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const nav = {
  three: ['FirstScene', 'Transform', 'Animation', 'Camera', 'Fullscreen', 'Geometry', 'Textures', 'Materials', 'threeDText'
    , 'Lights', 'Shadow', 'Particles', 'Galaxy', 'RayCaster', 'Physics', 'Models', 'Realistic', 'Shaders', 'ShaderPatterns'
    , 'RagingSea', 'AnimatedGalaxy', 'ModifiedMaterial', 'PostProcessing'
  ],
  webgpu: ['Triangle', 'ColorTriangle',  'RotatingCube', 'index'],
}

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
  font-size: 28px;
}
</style>