
(function () {
  "use strict";

  var canvas, gl;
  var simProgram, renderProgram, quadBuffer;
  var fbos = [];
  var textures = [];
  var read = 0;
  var write = 1;
  var simW = 1;
  var simH = 1;
  var dpr = 1;

  var pointer = {
    x: 0.42,
    y: 0.42,
    px: 0.42,
    py: 0.42,
    tx: 0.42,
    ty: 0.42,
    vx: 0,
    vy: 0,
    speed: 0,
    moved: 0,
    lastMove: 0
  };

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function createShader(type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      var info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(info || "Shader compile error");
    }

    return shader;
  }

  function createProgram(vertexSource, fragmentSource) {
    var program = gl.createProgram();
    gl.attachShader(program, createShader(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      var info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(info || "Program link error");
    }

    return program;
  }

  function createTexture(width, height) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    return texture;
  }

  function createFBO(texture) {
    var fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return fbo;
  }

  var vertexSource = [
    "attribute vec2 aPosition;",
    "varying vec2 vUv;",
    "void main(){",
    "  vUv = aPosition * 0.5 + 0.5;",
    "  gl_Position = vec4(aPosition, 0.0, 1.0);",
    "}"
  ].join("\n");

  var simFragmentSource = [
    "precision mediump float;",
    "varying vec2 vUv;",
    "uniform sampler2D uPrev;",
    "uniform vec2 uResolution;",
    "uniform vec2 uPointer;",
    "uniform vec2 uPrevPointer;",
    "uniform vec2 uVelocity;",
    "uniform float uSpeed;",
    "uniform float uMoved;",
    "uniform float uTime;",
    "uniform float uMobile;",

    "float hash(vec2 p){",
    "  return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123);",
    "}",

    "float noise(vec2 p){",
    "  vec2 i = floor(p);",
    "  vec2 f = fract(p);",
    "  f = f*f*(3.0-2.0*f);",
    "  float a = hash(i);",
    "  float b = hash(i + vec2(1.0,0.0));",
    "  float c = hash(i + vec2(0.0,1.0));",
    "  float d = hash(i + vec2(1.0,1.0));",
    "  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);",
    "}",

    "float fbm(vec2 p){",
    "  float v = 0.0;",
    "  float a = 0.5;",
    "  for(int i=0;i<4;i++){",
    "    v += a * noise(p);",
    "    p *= 2.02;",
    "    a *= 0.5;",
    "  }",
    "  return v;",
    "}",

    "float sdSegment(vec2 p, vec2 a, vec2 b){",
    "  vec2 pa = p-a;",
    "  vec2 ba = b-a;",
    "  float h = clamp(dot(pa,ba)/max(dot(ba,ba),0.0001), 0.0, 1.0);",
    "  return length(pa - ba*h);",
    "}",

    "void main(){",
    "  vec2 texel = 1.0 / uResolution;",
    "  vec2 uv = vUv;",
    "  vec2 asp = vec2(uResolution.x/uResolution.y, 1.0);",

    "  float n1 = fbm(uv * 2.4 + vec2(uTime*.025, -uTime*.018));",
    "  float n2 = fbm(uv * 4.0 + vec2(-uTime*.018, uTime*.022));",
    "  vec2 curl = vec2(n1 - .5, n2 - .5);",

    "  vec2 flow = curl * (0.010 + uSpeed * 0.00014);",
    "  vec2 smear = normalize(uVelocity + vec2(0.0001)) * min(uSpeed * 0.0014, 0.018);",
    "  vec4 prev = texture2D(uPrev, uv - flow - smear);",

    "  float dissipation = mix(0.970, 0.982, uMobile);",
    "  vec3 col = prev.rgb * dissipation;",
    "  float alpha = prev.a * dissipation;",

    "  vec2 p = uv * asp;",
    "  vec2 a = uPrevPointer * asp;",
    "  vec2 b = uPointer * asp;",
    "  float d = sdSegment(p, a, b);",
    "  float distHead = length(p - b);",

    "  float speedNorm = clamp(uSpeed / 0.055, 0.0, 1.0);",
    "  float radius = mix(0.052, 0.120, speedNorm) * mix(0.68, 1.0, 1.0-uMobile);",
    "  float ribbon = exp(-(d*d)/(radius*radius));",
    "  float head = exp(-(distHead*distHead)/(radius*radius*1.85));",

    "  float organic = fbm((p - b) * 9.0 + vec2(uTime*.11, -uTime*.08));",
    "  ribbon *= smoothstep(0.08, 0.86, organic + ribbon * 0.55);",

    "  float hueShift = fract(uTime * 0.035 + uPointer.x * .21 + uPointer.y * .13);",
    "  vec3 blue = vec3(0.08, 0.58, 1.00);",
    "  vec3 cyan = vec3(0.08, 0.95, 0.78);",
    "  vec3 lime = vec3(0.76, 1.00, 0.10);",
    "  vec3 magenta = vec3(1.00, 0.10, 0.45);",
    "  vec3 amber = vec3(1.00, 0.55, 0.16);",

    "  vec3 c1 = mix(blue, cyan, smoothstep(0.0, .45, hueShift));",
    "  vec3 c2 = mix(magenta, lime, smoothstep(.25, .75, hueShift));",
    "  vec3 c3 = mix(amber, blue, smoothstep(.55, 1.0, hueShift));",
    "  vec3 smokeColor = normalize(c1*0.75 + c2*0.42 + c3*0.28);",

    "  float add = (ribbon * 0.135 + head * 0.070) * uMoved;",
    "  add *= mix(0.62, 1.0, 1.0-uMobile);",
    "  col += smokeColor * add;",
    "  alpha += add * 0.72;",

    "  // Camada atmosférica muito sutil, para não parecer efeito grudado no cursor.",
    "  vec2 center = vec2(0.48, 0.42) * asp;",
    "  float ambient = exp(-length(p-center) * 1.5) * 0.0025;",
    "  col += vec3(0.05, 0.45, 0.38) * ambient;",

    "  col = min(col, vec3(0.58));",
    "  alpha = clamp(alpha, 0.0, 0.48);",
    "  gl_FragColor = vec4(col, alpha);",
    "}"
  ].join("\n");

  var renderFragmentSource = [
    "precision mediump float;",
    "varying vec2 vUv;",
    "uniform sampler2D uTexture;",
    "uniform vec2 uResolution;",
    "uniform float uTime;",

    "float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }",

    "void main(){",
    "  vec2 texel = 1.0 / uResolution;",
    "  vec4 c = texture2D(uTexture, vUv) * 0.38;",
    "  c += texture2D(uTexture, vUv + texel*vec2( 2.0, 0.0)) * 0.13;",
    "  c += texture2D(uTexture, vUv + texel*vec2(-2.0, 0.0)) * 0.13;",
    "  c += texture2D(uTexture, vUv + texel*vec2( 0.0, 2.0)) * 0.13;",
    "  c += texture2D(uTexture, vUv + texel*vec2( 0.0,-2.0)) * 0.13;",
    "  c += texture2D(uTexture, vUv + texel*vec2( 3.5, 3.5)) * 0.05;",
    "  c += texture2D(uTexture, vUv + texel*vec2(-3.5, 3.5)) * 0.05;",

    "  float a = clamp(luma(c.rgb) * 1.55 + c.a * 0.45, 0.0, 0.70);",
    "  vec3 color = min(c.rgb * 1.45, vec3(0.66));",

    "  // Evita branco: sempre mantém matiz colorido.",
    "  color = mix(color, color * vec3(0.86, 1.0, 0.94), 0.28);",
    "  gl_FragColor = vec4(color, a);",
    "}"
  ].join("\n");

  function setUniforms(program, uniforms) {
    Object.keys(uniforms).forEach(function (name) {
      var loc = gl.getUniformLocation(program, name);
      var value = uniforms[name];

      if (loc == null) return;

      if (typeof value === "number") {
        gl.uniform1f(loc, value);
      } else if (value.length === 2) {
        gl.uniform2f(loc, value[0], value[1]);
      } else if (value.length === 3) {
        gl.uniform3f(loc, value[0], value[1], value[2]);
      }
    });
  }

  function bindQuad(program) {
    var loc = gl.getAttribLocation(program, "aPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    var displayW = Math.max(1, Math.floor(window.innerWidth * dpr));
    var displayH = Math.max(1, Math.floor(window.innerHeight * dpr));

    canvas.width = displayW;
    canvas.height = displayH;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    simW = Math.max(320, Math.min(960, Math.floor(displayW * 0.46)));
    simH = Math.max(220, Math.min(620, Math.floor(displayH * 0.46)));

    textures.forEach(function (t) { gl.deleteTexture(t); });
    fbos.forEach(function (f) { gl.deleteFramebuffer(f); });

    textures = [createTexture(simW, simH), createTexture(simW, simH)];
    fbos = [createFBO(textures[0]), createFBO(textures[1])];

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[0]);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[1]);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  function pointerMove(event) {
    var x = event.clientX / Math.max(1, window.innerWidth);
    var y = 1 - event.clientY / Math.max(1, window.innerHeight);

    pointer.tx = x;
    pointer.ty = y;
    pointer.lastMove = performance.now();
  }

  function initWebGLFluidSmoke() {
    if (prefersReducedMotion()) return;

    canvas = document.getElementById("nimo-webgl-fluid-canvas");

    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "nimo-webgl-fluid-canvas";
      canvas.className = "webgl-fluid-smoke nimo-webgl-fluid-smoke nimo-smoke-aurora-field";
      canvas.setAttribute("aria-hidden", "true");
      document.body.prepend(canvas);
    }

    gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      antialias: false,
      depth: false,
      stencil: false
    });

    if (!gl) {
      console.warn("[V19] WebGL indisponível para fumaça fluida.");
      return;
    }

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    simProgram = createProgram(vertexSource, simFragmentSource);
    renderProgram = createProgram(vertexSource, renderFragmentSource);

    quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]),
      gl.STATIC_DRAW
    );

    resize();

    pointer.x = pointer.tx;
    pointer.y = pointer.ty;
    pointer.px = pointer.x;
    pointer.py = pointer.y;
    pointer.lastMove = performance.now();

    document.addEventListener("pointermove", pointerMove, { passive: true });
    window.addEventListener("resize", resize, { passive: true });

    requestAnimationFrame(frame);
    console.info("[V19] WebGL Fluid Smoke OK");
  }

  function updatePointer(now) {
    pointer.px = pointer.x;
    pointer.py = pointer.y;

    var oldX = pointer.x;
    var oldY = pointer.y;

    pointer.x = lerp(pointer.x, pointer.tx, 0.085);
    pointer.y = lerp(pointer.y, pointer.ty, 0.085);

    pointer.vx = pointer.x - oldX;
    pointer.vy = pointer.y - oldY;
    pointer.speed = Math.sqrt(pointer.vx * pointer.vx + pointer.vy * pointer.vy);

    var idle = now - pointer.lastMove;
    pointer.moved = Math.max(pointer.moved * 0.92, idle < 220 ? 1 : 0);

    // Mantém atmosfera viva mesmo sem mouse, mas sem virar bolha.
    var t = now * 0.001;
    if (idle > 300) {
      pointer.tx += Math.cos(t * 0.37) * 0.00018;
      pointer.ty += Math.sin(t * 0.29) * 0.00015;
      pointer.moved = Math.max(pointer.moved, 0.10);
    }
  }

  function frame(now) {
    updatePointer(now);

    // Update simulation texture
    gl.viewport(0, 0, simW, simH);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[write]);
    gl.useProgram(simProgram);
    bindQuad(simProgram);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[read]);
    gl.uniform1i(gl.getUniformLocation(simProgram, "uPrev"), 0);

    setUniforms(simProgram, {
      uResolution: [simW, simH],
      uPointer: [pointer.x, pointer.y],
      uPrevPointer: [pointer.px, pointer.py],
      uVelocity: [pointer.vx, pointer.vy],
      uSpeed: pointer.speed,
      uMoved: pointer.moved,
      uTime: now * 0.001,
      uMobile: window.innerWidth < 720 ? 1 : 0
    });

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    var tmp = read;
    read = write;
    write = tmp;

    // Render to screen
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(renderProgram);
    bindQuad(renderProgram);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[read]);
    gl.uniform1i(gl.getUniformLocation(renderProgram, "uTexture"), 0);

    setUniforms(renderProgram, {
      uResolution: [simW, simH],
      uTime: now * 0.001
    });

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(frame);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWebGLFluidSmoke, { once: true });
  } else {
    initWebGLFluidSmoke();
  }

  window.initWebGLFluidSmoke = initWebGLFluidSmoke;
})();
