import {
  DoubleSide,
  ShaderMaterial
} from "three"

const vertString =
  `
varying vec3 vUv;
void main() {
    vUv = position;
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
}
`

const fragString =
  `
#define PI 3.14159265358979323846

varying vec3 vUv;
uniform vec2 uResolution;
uniform vec2 uSize;
uniform float uDelta;
uniform float uChange;

float rand(vec2 c) {
    return fract(sin(dot(c.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p, float freq) {
    float unit = uResolution.x / freq;
    vec2 ij = floor(p / unit);
    vec2 xy = mod(p, unit) / unit;
    xy = .5 * (1. - cos(PI * xy));
    float a = rand((ij + vec2(0., 0.)));
    float b = rand((ij + vec2(1., 0.)));
    float c = rand((ij + vec2(0., 1.)));
    float d = rand((ij + vec2(1., 1.)));
    float x1 = mix(a, b, xy.x);
    float x2 = mix(c, d, xy.x);
    return mix(x1, x2, xy.y);
}

float pNoise(vec2 p, int res) {
    float persistance = .5;
    float n = 0.;
    float normK = 0.;
    float f = 4.;
    float amp = 1.;
    int iCount = 0;
    for (int i = 0; i < 50; i++) {
        n += amp * noise(p, f);
        f *= 2.;
        normK += amp;
        amp *= persistance;
        if (iCount == res) break;
        iCount++;
    }
    float nf = n / normK;
    return nf * nf * nf * nf;
}

//
/* discontinuous pseudorandom uniformly distributed in [-0.5, +0.5]^3 */
vec3 random3(vec3 c) {
	float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
	vec3 r;
	r.z = fract(512.0*j);
	j *= .125;
	r.x = fract(512.0*j);
	j *= .125;
	r.y = fract(512.0*j);
	return r-0.5;
}

/* skew constants for 3d simplex functions */
const float F3 =  0.3333333;
const float G3 =  0.1666667;

/* 3d simplex noise */
float simplex3d(vec3 p) {
	 /* 1. find current tetrahedron T and it's four vertices */
	 /* s, s+i1, s+i2, s+1.0 - absolute skewed (integer) coordinates of T vertices */
	 /* x, x1, x2, x3 - unskewed coordinates of p relative to each of T vertices*/

	 /* calculate s and x */
	 vec3 s = floor(p + dot(p, vec3(F3)));
	 vec3 x = p - s + dot(s, vec3(G3));

	 /* calculate i1 and i2 */
	 vec3 e = step(vec3(0.0), x - x.yzx);
	 vec3 i1 = e*(1.0 - e.zxy);
	 vec3 i2 = 1.0 - e.zxy*(1.0 - e);

	 /* x1, x2, x3 */
	 vec3 x1 = x - i1 + G3;
	 vec3 x2 = x - i2 + 2.0*G3;
	 vec3 x3 = x - 1.0 + 3.0*G3;

	 /* 2. find four surflets and store them in d */
	 vec4 w, d;

	 /* calculate surflet weights */
	 w.x = dot(x, x);
	 w.y = dot(x1, x1);
	 w.z = dot(x2, x2);
	 w.w = dot(x3, x3);

	 /* w fades from 0.6 at the center of the surflet to 0.0 at the margin */
	 w = max(0.6 - w, 0.0);

	 /* calculate surflet components */
	 d.x = dot(random3(s), x);
	 d.y = dot(random3(s + i1), x1);
	 d.z = dot(random3(s + i2), x2);
	 d.w = dot(random3(s + 1.0), x3);

	 /* multiply d by w^4 */
	 w *= w;
	 w *= w;
	 d *= w;

	 /* 3. return the sum of the four surflets */
	 return dot(d, vec4(52.0));
}

/* const matrices for 3d rotation */
const mat3 rot1 = mat3(-0.37, 0.36, 0.85,-0.14,-0.93, 0.34,0.92, 0.01,0.4);
const mat3 rot2 = mat3(-0.55,-0.39, 0.74, 0.33,-0.91,-0.24,0.77, 0.12,0.63);
const mat3 rot3 = mat3(-0.71, 0.52,-0.47,-0.08,-0.72,-0.68,-0.7,-0.45,0.56);

/* directional artifacts can be reduced by rotating each octave */
float simplex3d_fractal(vec3 m) {
    return   0.5333333*simplex3d(m*rot1)
			+0.2666667*simplex3d(2.0*m*rot2)
			+0.1333333*simplex3d(4.0*m*rot3)
			+0.0666667*simplex3d(8.0*m);
}
//

void main() {
    // vec2 st = vUv.xy / uSize.xy + 0.5;
    // st.x = 1.0 - st.x;
    // st = smoothstep(vec2(-0.2), vec2(1.2), st);
    // //
    // // coordinate for noise
    // vec2 ncoord = vec2(st * uResolution.x * .25 - uResolution.y * .5);
    // ncoord.y -= uChange;
    // float test_noise = pNoise(ncoord, 4);// number: noise resolution
    // float r = step(1.0 - test_noise, 0.9);
    // float g = step(0.8 - test_noise, 0.6) * 0.5;
    // float b = step(test_noise, 0.22);
    // gl_FragColor = vec4(vec3(r, g, b), 1.0);

    vec2 p = vUv.xy/uSize.x;
    vec3 p3 = vec3(p, uChange*0.025);

    float value = simplex3d_fractal(p3*8.0+8.0);

    value = 0.5 + 0.5*value;
    // value *= smoothstep(0.0, 0.005, abs(0.6-p.x)); // hello, iq :)
    float r = step(1.0 - value, 0.6);
    float g = value * smoothstep(0.0, 0.005, abs(0.6-p.x)) * 1.5;
    g = step(g, ((cos(uChange) + 1.0) / 0.5 + 0.5) * 0.2); //  >> 0.5 - 0.7
    float b = step(value, 0.42);
    gl_FragColor = vec4(
      vec3(r*cos(uChange)*0.5+0.5,g*sin(uChange)*0.5+0.5,b*g*cos(uChange+1.0)*0.5+0.5),
      1.0);
}
`

export default class PictureShader {
  constructor(options) {
    this.options = options
    this.mesh = options.mesh
    this.scene = options.scene
    this.uniforms = options.uniforms
    this.mesh.material = new ShaderMaterial({
      fragmentShader: fragString,
      vertexShader: vertString,
      side: DoubleSide,
      transparent: true,
      uniforms: this.uniforms
    })
    this.mesh.material.needsUpdate = true
    this.active = false
  }

  update(delta) {
    if (this.active) {
      this.mesh.material.needsUpdate = true
      this.mesh.material.uniforms.uChange.value += delta
    }
  }
}
