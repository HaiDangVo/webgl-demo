import { DoubleSide, ShaderMaterial } from "three"

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

vec2 rotate2D (vec2 _st, float _angle) {
    _st -= 0.5;
    _st =  mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle)) * _st;
    _st += 0.5;
    return _st;
}

vec2 rotateTilePattern(vec2 _st){

    //  Scale the coordinate system by 2x2
    _st *= 2.0;

    //  Give each cell an index number
    //  according to its position
    float index = 0.0;
    index += step(1., mod(_st.x,2.0));
    index += step(1., mod(_st.y,2.0))*2.0;

    //      |
    //  2   |   3
    //      |
    //--------------
    //      |
    //  0   |   1
    //      |

    // Make each cell between 0.0 - 1.0
    _st = fract(_st);

    // Rotate each cell according to the index
    if(index == 1.0){
        //  Rotate cell 1 by 90 degrees
        _st = rotate2D(_st,PI*0.5);
    } else if(index == 2.0){
        //  Rotate cell 2 by -90 degrees
        _st = rotate2D(_st,PI*-0.5);
    } else if(index == 3.0){
        //  Rotate cell 3 by 180 degrees
        _st = rotate2D(_st,PI);
    }

    return _st;
}

void main() {
    vec2 st = vUv.xy / uSize.xy + 0.5;
    st.x = 1.0 - st.x;
    st = smoothstep(vec2(-0.2), vec2(1.2), st);
    //
    float vdist = 1.-step(st.x,.1);
    vdist *= 1.-step(1.-st.x,.1);
    float hdist = 1.-step(st.y,.1);
    hdist *= 1.-step(1.-st.y,.1);
    float adist = vdist*hdist;
    //
    // coordinate for noise
    vec2 ncoord = vec2(st * uResolution.x * .65 - uResolution.y * .5);
    ncoord.y -= uChange;
    float test_noise = pNoise(ncoord, 4);// number: noise resolution
    float r = step(1.0 - test_noise, 0.9);
    float g = step(0.8 - test_noise, 0.6) * 0.5;
    float b = step(test_noise, 0.22);
    gl_FragColor = vec4(vec3(r, g, b), 1.0);
    // // position afftected by noise
    // vec2 dist = vec2(st.x + test_noise, st.y);
    // // calc mask moving
    // float move = uDelta*3.-(dist.x+dist.y);
    // float moveStep = step(move,uDelta);
    // float moveStepEnd = step(move+.65,uDelta);
    // // fire effect
    // // another noise for fire
    // vec2 nfcoord = vec2(st * uResolution.x * 3.2 - uResolution.y * 3.2);
    // nfcoord.y -= uChange * 12.;
    // nfcoord.x += uChange;
    // float ftest_noise = pow(pNoise(nfcoord, 64),.25);
    // vec2 fdist = vec2(dist.x + ftest_noise, dist.y);
    // float mdt = 1.-distance(fdist,vec2(move+.125));
    // // edge burning effect
    // float moveSmooth = smoothstep(uDelta-.12*uDelta,uDelta+.12*uDelta,move);
    // float outerMove = smoothstep(uDelta-.04*uDelta,uDelta+.04*uDelta,move-(0.1*uDelta+0.02));
    // moveSmooth = 1.-moveSmooth;
    // outerMove = 1.-outerMove;
    // vec4 fcolor = vec4(moveSmooth);
    // fcolor += vec4(moveSmooth,moveSmooth*0.4-0.3*uDelta,0.,moveSmooth);
    // fcolor += vec4(0.,0.,1.-outerMove,outerMove);
    // //

    // gl_FragColor = fcolor;
    // // gl_FragColor = vec4(adist*fcolor) * max((mdt*6.),0.);
    // // gl_FragColor = vec4(vec3(vdist*hdist),1.);
    // // gl_FragColor = vec4(vec3(test_noise), 1.);
    // // gl_FragColor = vec4(vec3(moveStep), 1.);
    // // gl_FragColor = vec4(vec3(moveSmooth), 1.);
    // // gl_FragColor += vec4(moveStep)*(mdt*6.);
    // //
    // // float temp = max((pow(mdt,.5)),0.);
    // // gl_FragColor = vec4(-temp+1.);
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
  }

  update(delta) {
    this.mesh.material.needsUpdate = true
    this.mesh.material.uniforms.uChange.value += delta
  }
}
