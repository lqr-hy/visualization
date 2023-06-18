@group(0) @binding(0) var<uniform> color : vec4<f32>;

@fragment
fn main(@location(0) fragPosition: vec4<f32>) -> @location(0) vec4<f32> {
    var a = color; // 没有实际意义 因为管道传入的color 必须使用
    return fragPosition;
}