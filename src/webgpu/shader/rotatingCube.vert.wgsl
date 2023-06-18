@group(0) @binding(1) var<uniform> mvpMatrix : mat4x4<f32>;

// 自定义返回结果
struct VertexOutput {
   @builtin(position) Position : vec4<f32>,
   @location(0) fragPosition : vec4<f32>
};

@vertex
fn main(@location(0) position : vec4<f32>) -> VertexOutput {
    var out: VertexOutput;
    out.Position = mvpMatrix * position;
    out.fragPosition =  0.5 * (position + vec4(1.0, 1.0, 1.0, 1.0));
    return out;
}