// A separate additive specular layer, evaluated in the base image's UV space.
export const waterGlitterShader = `
  uniform sampler2D uWaterMask;
  uniform vec2 uSunPosition;
  uniform float uGlitterLength;
  uniform float uGlitterStrength;

  float glitterHash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float glitterNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 s = f * f * (3.0 - 2.0 * f);
    return mix(mix(glitterHash(i), glitterHash(i + vec2(1.0, 0.0)), s.x),
      mix(glitterHash(i + vec2(0.0, 1.0)), glitterHash(i + vec2(1.0)), s.x), s.y);
  }

  vec3 waterGlitter(vec2 uv, float time) {
    // Sample the mask AFTER parallax, at precisely the base texture's UV.
    // Linear filtering is thresholded to keep the inset bank edges dark.
    float water = smoothstep(.5, .95, texture2D(uWaterMask, uv).r);
    if (water == 0.0) return vec3(0.0);

    float y = (uv.y - uSunPosition.y) / uGlitterLength + .5;
    float axis = uSunPosition.x + (uv.y - .5) * .18;
    float width = mix(.075, .045, smoothstep(.1, .95, y));
    float path = exp(-pow((uv.x - axis) / width, 2.0));
    float trail = path * smoothstep(.02, .20, y)
      * (1.0 - smoothstep(.80, 1.0, y));

    // Independently advected wave fields create uneven clusters. Fine waves
    // provide thousands of tiny, horizontally stretched specular candidates.
    float wave1 = glitterNoise(uv * vec2(180.0, 45.0) + vec2(time * .4, time * .13));
    float wave2 = glitterNoise(uv * vec2(420.0, 90.0) - vec2(time * .7, time * .21));
    float fine = glitterNoise(uv * vec2(1150.0, 720.0) + vec2(time * .31, -time * .48));
    float wavePeaks = smoothstep(.38, .82, wave1 * wave2);
    float tinyHighlights = smoothstep(.60, .94, fine);
    float sparkles = wavePeaks * tinyHighlights;
    // No continuous glow: even the bright trail center contains only peaks.
    float glitter = sparkles * trail * water * uGlitterStrength;
    return vec3(1.0, .965, .89) * glitter;
  }
`;
