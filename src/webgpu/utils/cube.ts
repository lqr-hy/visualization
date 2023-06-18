import { mat4, vec3 } from 'gl-matrix'

interface Coordinate {
  x: number
  y: number
  z: number
}

export function getCubeMatrix(
  position: Coordinate,
  rotation: Coordinate,
  scale: Coordinate,
  sizes: { width: number; height: number }
) {
  // 生成初始的矩阵
  const modelViewMatrix = mat4.create()
  // 注意点: 顺序必须是平移 旋转 缩放
  // 参数1 输出值 参数2 目标值 参数三平移向量
  mat4.translate(
    modelViewMatrix,
    modelViewMatrix,
    vec3.fromValues(position.x, position.y, position.z)
  )

  mat4.rotateX(modelViewMatrix, modelViewMatrix, rotation.x)
  mat4.rotateY(modelViewMatrix, modelViewMatrix, rotation.y)
  mat4.rotateZ(modelViewMatrix, modelViewMatrix, rotation.z)

  mat4.scale(modelViewMatrix, modelViewMatrix, vec3.fromValues(scale.x, scale.y, scale.z))

  // 投影矩阵
  const projectionMatrix = mat4.create()
  // 创建位置 视角角度 视角比例 近平面 元平面
  mat4.perspective(projectionMatrix, Math.PI / 2, sizes.width / sizes.height, 1, 100)

  const projectionModeViewMatrix = mat4.create()
  // 顺序必须是projectionMatrix * modeVideMatrix
  mat4.multiply(projectionModeViewMatrix, projectionMatrix, modelViewMatrix)

  return projectionModeViewMatrix
}
