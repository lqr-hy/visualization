uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;
varying float uElevation;

void main() {
  float mixStrenth = (uElevation + uColorOffset) * uColorMultiplier;
  vec3 uColor = mix(uDepthColor, uSurfaceColor, mixStrenth);

  gl_FragColor = vec4(uColor, 1.0);
}