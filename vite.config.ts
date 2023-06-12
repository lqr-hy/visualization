import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
  build: {
    target: 'esnext'
  },
  base: 'visualization',
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    glsl({
      // 设置 glsl 文件的文件名后缀
      include: '**/*.glsl'
    })
  ]
})
