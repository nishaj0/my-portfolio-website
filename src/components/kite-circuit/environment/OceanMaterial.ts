export const OCEAN_VERTEX_SHADER = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const OCEAN_FRAGMENT_SHADER = `
  uniform float uTime;
  uniform float uMotion;
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  vec2 waveSlope(vec2 point, vec2 direction, float scale, float speed, float phase) {
    float wave = dot(point, direction) * scale + uTime * uMotion * speed + phase;
    return direction * cos(wave) * scale;
  }

  vec3 scrollingNormal(vec2 worldPosition) {
    vec2 majorDirection = normalize(vec2(0.82, 0.57));
    vec2 minorDirection = normalize(vec2(-0.42, 0.91));
    vec2 slope = waveSlope(worldPosition, majorDirection, 0.18, 0.42, 0.0) * 0.34;
    slope += waveSlope(worldPosition, minorDirection, 0.35, 0.68, 1.4) * 0.16;
    slope += waveSlope(worldPosition, normalize(vec2(0.18, -0.98)), 0.82, 1.16, 2.1) * 0.045;
    slope += waveSlope(worldPosition, normalize(vec2(-0.96, -0.27)), 1.46, 1.62, 0.7) * 0.018;
    return normalize(vec3(-slope.x, 1.0, -slope.y));
  }

  void main() {
    vec3 normal = scrollingNormal(vWorldPosition.xz);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    vec3 lightDirection = normalize(vec3(-0.26, 0.86, 0.34));
    vec3 reflected = reflect(-lightDirection, normal);
    float fresnel = pow(1.0 - max(dot(viewDirection, normal), 0.0), 4.6);
    float specular = pow(max(dot(reflected, viewDirection), 0.0), 156.0);
    float railGlint = pow(max(dot(reflect(normalize(vec3(0.0, 0.34, -1.0)), normal), viewDirection), 0.0), 92.0);
    float fineRipples = sin(vWorldPosition.z * 2.8 + uTime * uMotion * 1.7) * sin(vWorldPosition.x * 1.9 - uTime * uMotion) * 0.5 + 0.5;
    vec3 horizon = vec3(0.018, 0.021, 0.026) * pow(1.0 - max(viewDirection.y, 0.0), 2.0);
    vec3 ocean = vec3(0.00005, 0.00007, 0.0001) + horizon;
    ocean += vec3(specular * 0.22 + railGlint * 0.045 + fresnel * 0.035 + pow(fineRipples, 16.0) * 0.008);
    gl_FragColor = vec4(ocean, 1.0);
  }
`;
