import * as THREE from 'three'
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

const noiseglsl = /* glsl */ `
  float hash1(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453123);
  }

  vec3 hash3(vec3 p) {
    vec3 q = vec3(
      dot(p, vec3(127.1, 311.7, 74.7)),
      dot(p, vec3(269.5, 183.3, 246.1)),
      dot(p, vec3(113.5, 271.9, 124.6))
    );
    return fract(sin(q) * 43758.5453123);
  }

  float noise3(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash1(i + vec3(0.0,0.0,0.0)), hash1(i + vec3(1.0,0.0,0.0)), f.x),
          mix(hash1(i + vec3(0.0,1.0,0.0)), hash1(i + vec3(1.0,1.0,0.0)), f.x), f.y),
      mix(mix(hash1(i + vec3(0.0,0.0,1.0)), hash1(i + vec3(1.0,0.0,1.0)), f.x),
          mix(hash1(i + vec3(0.0,1.0,1.0)), hash1(i + vec3(1.0,1.0,1.0)), f.x), f.y),
      f.z);
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise3(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  // Returns (distance to nearest feature point, distance to 2nd nearest).
  // The gap between them is small right at cell boundaries - that's our
  // crack-line signal.
  vec2 voronoi(vec3 p) {
    vec3 ip = floor(p);
    vec3 fp = fract(p);
    float f1 = 8.0;
    float f2 = 8.0;
    for (int k = -1; k <= 1; k++) {
      for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
          vec3 g = vec3(float(i), float(j), float(k));
          vec3 o = hash3(ip + g);
          vec3 r = g + o - fp;
          float d = dot(r, r);
          if (d < f1) { f2 = f1; f1 = d; }
          else if (d < f2) { f2 = d; }
        }
      }
    }
    return vec2(sqrt(f1), sqrt(f2));
  }
`

const FiredGlazeMaterial = shaderMaterial(
  {
    uBaseColor: new THREE.Color('#7fa88f'),
    uRimColor: new THREE.Color('#2f4f42'),
    uSpeckleColor: new THREE.Color('#d8e8d0'),
    uCracked: 0,
    uSeed: 0,
    uCrackScale: 5.5,
  },
  /* glsl vertex */ `
    varying vec3 vNormalV;
    varying vec3 vViewPosition;
    varying vec3 vPos;
    varying float vCrackFactor;

    uniform float uCracked;
    uniform float uSeed;
    uniform float uCrackScale;

    ${noiseglsl}

    void main() {
      vPos = position;
      vec3 transformed = position;
      float crackFactor = 0.0;
      if (uCracked > 0.5) {
        vec2 vor = voronoi(position * uCrackScale + uSeed);
        float edge = vor.y - vor.x;
        crackFactor = 1.0 - smoothstep(0.0, 0.07, edge);
        transformed -= normal * crackFactor * 0.03;
      }
      vCrackFactor = crackFactor;
      vNormalV = normalMatrix * normal;
      vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  /* glsl fragment */ `
    varying vec3 vNormalV;
    varying vec3 vViewPosition;
    varying vec3 vPos;
    varying float vCrackFactor;

    uniform vec3 uBaseColor;
    uniform vec3 uRimColor;
    uniform vec3 uSpeckleColor;
    uniform float uCracked;
    uniform float uSeed;
    uniform float uCrackScale;

    ${noiseglsl}

    void main() {
      vec3 N = normalize(vNormalV);
      vec3 V = normalize(vViewPosition);
      float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.5);

      float n = fbm(vPos * 3.0 + uSeed);
      vec3 color = mix(uBaseColor * 0.9, uBaseColor * 1.08, n);

      // glaze pooling / darkening at edges & contours (view-angle fresnel)
      color = mix(color, uRimColor, fresnel * 0.55);

      // gravity pooling: glaze runs down and collects in lower crevices
      float heightPool = smoothstep(0.6, -0.7, vPos.y);
      color = mix(color, uRimColor, heightPool * 0.18);

      // speckle pass
      float speck = smoothstep(0.965, 0.995, hash1(floor(vPos * 90.0 + uSeed)));
      color = mix(color, uSpeckleColor, speck * 0.8);

      // Recompute the crack pattern per-fragment (not from the per-vertex
      // varying) so the lines stay crisp instead of blurring into blobs
      // across low-poly triangles.
      float crackLine = 0.0;
      if (uCracked > 0.5) {
        vec2 vorF = voronoi(vPos * uCrackScale + uSeed);
        float edgeF = vorF.y - vorF.x;
        crackLine = 1.0 - smoothstep(0.0, 0.035, edgeF);
        vec3 crackColor = uBaseColor * 0.12;
        color = mix(color, crackColor, clamp(crackLine * 1.6, 0.0, 1.0));
      }

      vec3 lightDir = normalize(vec3(0.4, 0.8, 0.6));
      float diff = max(dot(N, lightDir), 0.0);
      float glossFalloff = 1.0 - crackLine * 0.6;
      float lighting = 0.4 + 0.6 * diff * glossFalloff;
      color *= lighting;

      gl_FragColor = vec4(color, 1.0);
    }
  `,
)

extend({ FiredGlazeMaterial })

export default FiredGlazeMaterial
