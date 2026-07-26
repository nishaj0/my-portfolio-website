export const SKY_VERTEX_SHADER = `
  varying vec3 vDirection;

  void main() {
    vDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const SKY_FRAGMENT_SHADER = `
  varying vec3 vDirection;

  void main() {
    float horizon = pow(1.0 - abs(vDirection.y), 2.8);
    float rightLift = smoothstep(-0.72, 0.92, vDirection.x);
    vec3 upper = mix(vec3(0.001, 0.001, 0.002), vec3(0.012, 0.013, 0.015), rightLift);
    vec3 lower = mix(vec3(0.015, 0.017, 0.019), vec3(0.07, 0.075, 0.08), rightLift);
    vec3 color = mix(upper, lower, horizon);
    gl_FragColor = vec4(color, 1.0);
  }
`;
