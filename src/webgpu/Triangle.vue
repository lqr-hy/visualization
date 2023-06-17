<template>
  <canvas ref="webgpu"></canvas>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import fragment from './shader/red.frag.wgsl?raw'
import vertex from './shader/triangle.vert.wgsl?raw'

const sizes = {
  width: window.innerWidth - 240,
  height: window.innerHeight - 100
}

const webgpu = ref()


const initWebGPU = async () => {
  webgpu.value.width = sizes.width
  webgpu.value.height = sizes.height
  if (!navigator.gpu)
    throw new Error('browser no support webgpu')

  const adapter = await navigator.gpu.requestAdapter()
  // 当前浏览器支持的扩展功能
  adapter?.features.forEach(v => console.log(v))
  // 实际绘制功能
  const device = await adapter?.requestDevice({
    requiredFeatures: ['texture-compression-etc2'],
    requiredLimits: {}
  }) as GPUDevice

  const ctx = (webgpu.value as HTMLCanvasElement).getContext('webgpu') as GPUCanvasContext
  const format = navigator.gpu.getPreferredCanvasFormat()
  ctx.configure({
    device,
    format,
  })

  return { adapter, device, ctx, format }
}

const initPipeline = async (device: GPUDevice, format: GPUTextureFormat) => {
  const vertexShader = device.createShaderModule({
    code: vertex
  })

  const fragmentShader = device.createShaderModule({
    code: fragment
  })

  const pipeline = await device.createRenderPipelineAsync({
    vertex: {
      module: vertexShader,
      entryPoint: 'main',
    },
    fragment: {
      module: fragmentShader,
      entryPoint: 'main',
      // 必须设置目标颜色格式 
      targets: [
        {
          format
        }
      ]
    },
    primitive: {
      topology: 'triangle-list'
    },
    layout: 'auto'
  })

  return { pipeline }
}

const draw = (device: GPUDevice, pipeline: GPURenderPipeline, ctx: GPUCanvasContext) => {
  const encoder = device.createCommandEncoder()
  const renderPass = encoder.beginRenderPass({ // 渲染通道
    colorAttachments: [
      {
        view: ctx.getCurrentTexture().createView(),
        loadOp: 'clear', // 开始前清空画布
        clearValue: { r: 0, g: 0, b: 0, a: 1 }, // 清楚颜色的值
        storeOp: 'store' // 结束了保持原有状态
      }
    ]
  })
  renderPass.setPipeline(pipeline)
  renderPass.draw(3) // 等于顶点次数
  renderPass.end()
  const buffer = encoder.finish()
  device.queue.submit([buffer]) // 提交完成后gpu 开始工作
}

const run = async () => {
  const { device, format, ctx } = await initWebGPU()
  const { pipeline } = await initPipeline(device, format)
  draw(device, pipeline, ctx)
}

onMounted(() => {
  run()
})
</script>

<style lang="less" scoped></style>
