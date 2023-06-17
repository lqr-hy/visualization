<template>
  <canvas ref="webgpu"></canvas>
  <input type="color" value="#FFFF00" />
  <input type="range" min="-0.5" max="0.5" step="0.1" value="0" />
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import fragmentShader from './shader/colorTriangle.frag.wgsl?raw'
import vertexShader from './shader/colorTriangle.vert.wgsl?raw'

const sizes = {
  width: window.innerWidth - 240,
  height: window.innerHeight - 100
}

const webgpu = ref()

const initWebGPU = async () => {
  webgpu.value.width = sizes.width
  webgpu.value.height = sizes.height
  if (!navigator.gpu) throw new Error('browser no support webgpu')

  const adapter = await navigator.gpu.requestAdapter()
  // 当前浏览器支持的扩展功能
  // adapter?.features.forEach(v => console.log(v))
  // 实际绘制功能
  const device = (await adapter?.requestDevice({
    requiredFeatures: ['texture-compression-etc2'],
    requiredLimits: {}
  })) as GPUDevice

  const ctx = (webgpu.value as HTMLCanvasElement).getContext('webgpu') as GPUCanvasContext
  const format = navigator.gpu.getPreferredCanvasFormat()
  ctx.configure({
    device,
    format
  })

  return { adapter, device, ctx, format }
}

const initPipeline = async (device: GPUDevice, format: GPUTextureFormat) => {
  const vertex = new Float32Array([0, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0])
  // 创造给gpu使用的buffer
  const vertexBuffer = device.createBuffer({
    size: vertex.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST // 设置buffer用途  必须填 表示可以被写入数据 GPUBufferUsage.COPY_DST
  })
  // 将数据写入gpu 将vertex数据拷贝给vertexBuffer 但是是byte
  device.queue.writeBuffer(vertexBuffer, 0, vertex)

  // 颜色
  const color = new Float32Array([1, 0, 0, 1])
  // GPUBufferUsage.UNIFORM / STORAGE Uniform 适合只读的小数据 最大只有64kb
  const colorBuffer = device.createBuffer({
    size: color.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  })
  device.queue.writeBuffer(colorBuffer, 0, color)

  const pipeline = await device.createRenderPipelineAsync({
    vertex: {
      module: device.createShaderModule({
        code: vertexShader
      }),
      entryPoint: 'main',
      buffers: [
        {
          arrayStride: 3 * 4, // 每十二个字节传入shader
          attributes:
            // [{ // 每个节点中从0开始的三个float32数字 作为参数传入 shaderLocation0
            //   shaderLocation: 0,
            //   offset: 0,
            //   format: 'float32x2'
            // }, { //
            //   shaderLocation: 1,
            //   offset: 2 * 4,
            //   format: 'float32'
            // }]
            [
              {
                // 每个节点中从0开始的三个float32数字 作为参数传入 shaderLocation0
                shaderLocation: 0,
                offset: 0,
                format: 'float32x3'
              }
            ]
        }
      ]
    },
    fragment: {
      module: device.createShaderModule({
        code: fragmentShader
      }),
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

  const group = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        // 组合buffer
        binding: 0, // 绑定buffer位置
        resource: {
          buffer: colorBuffer
        }
      }
    ]
  })

  const colorObj = {
    color,
    colorBuffer,
    group
  }

  const vertexObj = {
    vertex,
    vertexBuffer,
    vertexCount: 3
  }

  return { pipeline, vertexObj, colorObj }
}

const draw = (
  device: GPUDevice,
  pipeline: GPURenderPipeline,
  ctx: GPUCanvasContext,
  vertexObj: any,
  colorObj: any
) => {
  const encoder = device.createCommandEncoder()
  const renderPass = encoder.beginRenderPass({
    // 渲染通道
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
  // 设置传入的buffer
  renderPass.setVertexBuffer(0, vertexObj.vertexBuffer)
  // 第一个索引与group 里面的binding 位置一致
  renderPass.setBindGroup(0, colorObj.group)
  renderPass.draw(vertexObj.vertexCount) // 等于顶点次数
  renderPass.end()
  const buffer = encoder.finish()
  device.queue.submit([buffer]) // 提交完成后gpu 开始工作
}

const run = async () => {
  const { device, format, ctx } = await initWebGPU()
  const { pipeline, vertexObj, colorObj } = await initPipeline(device, format)
  draw(device, pipeline, ctx, vertexObj, colorObj)

  document.querySelector('input[type="color"]')?.addEventListener('input', (e: Event) => {
    // get hex color string
    const color = (e.target as HTMLInputElement).value
    // parse hex color into rgb
    const r = +('0x' + color.slice(1, 3)) / 255
    const g = +('0x' + color.slice(3, 5)) / 255
    const b = +('0x' + color.slice(5, 7)) / 255
    // write colorBuffer with new color
    device.queue.writeBuffer(colorObj.colorBuffer, 0, new Float32Array([r, g, b, 1]))
    draw(device, pipeline, ctx, vertexObj, colorObj)
  })
  // update vertexBuffer
  document.querySelector('input[type="range"]')?.addEventListener('input', (e: Event) => {
    // get input value
    const value = +(e.target as HTMLInputElement).value
    console.log(value)
    // chagne vertex 0/3/6
    vertexObj.vertex[0] = 0 + value
    vertexObj.vertex[3] = -0.5 + value
    vertexObj.vertex[6] = 0.5 + value
    // write vertexBuffer with new vertex
    device.queue.writeBuffer(vertexObj.vertexBuffer, 0, vertexObj.vertex)
    draw(device, pipeline, ctx, vertexObj, colorObj)
  })
}

onMounted(() => {
  run()
})
</script>

<style lang="less" scoped>
input {
  position: fixed;
  top: 1em;
  right: 1em;
  display: flex;
  flex-direction: column;
  gap: 1em;
  text-align: right;
  width: 100px;
}

input {
  &:nth-child(2) {
    top: 3em;
  }
}
</style>
