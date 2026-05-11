'use client';

import React, { useEffect, useRef, useState } from 'react';

const FRAGMENT_SHADER = `
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uNoise;
uniform float uInteraction;

// Hash function for noise
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

// 2D Noise
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// Organic pattern generation
float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 5; ++i) {
        v += a * noise(p);
        p = rot * p * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 p = (gl_FragCoord.xy * 2.0 - uResolution.xy) / min(uResolution.x, uResolution.y);
    
    // Mouse Interaction
    float dist = distance(uv, uMouse);
    float mouseEffect = smoothstep(0.4, 0.0, dist) * uInteraction;
    p += (uv - uMouse) * mouseEffect * 0.5;

    float t = uTime * 0.2;
    
    // Warping
    vec2 q = vec2(fbm(p + vec2(0.0, 0.0)), fbm(p + vec2(5.2, 1.3)));
    vec2 r = vec2(fbm(p + 4.0 * q + vec2(1.7, 9.2) + 0.15 * t), fbm(p + 4.0 * q + vec2(8.3, 2.8) + 0.126 * t));
    float f = fbm(p + 4.0 * r);

    // Color Palette (Enark Red & Black)
    vec3 color1 = vec3(0.05, 0.0, 0.0); // Deep Dark
    vec3 color2 = vec3(0.86, 0.15, 0.15); // Enark Red
    vec3 color3 = vec3(1.0, 1.0, 1.0); // Highlight White
    
    vec3 color = mix(color1, color2, clamp((f * f) * 4.0, 0.0, 1.0));
    color = mix(color, color3, clamp(length(q), 0.0, 1.0) * 0.1);
    color = mix(color, color2, clamp(length(r.x), 0.0, 1.0) * 0.2);

    // Add Grain
    float grain = hash(uv + fract(uTime)) * 0.08;
    color += grain;

    // Scanlines
    float scanline = sin(gl_FragCoord.y * 1.5) * 0.04;
    color -= scanline;

    // Vignette
    float vignette = 1.0 - smoothstep(0.5, 1.5, length(uv - 0.5));
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
}
`;

const VERTEX_SHADER = `
attribute vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

export default function SpectraNoise() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const interactionRef = useRef(0);

  useEffect(() => {
    // Detect touch device
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    // Create program
    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Set up geometry
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const timeLoc = gl.getUniformLocation(program, 'uTime');
    const resLoc = gl.getUniformLocation(program, 'uResolution');
    const mouseLoc = gl.getUniformLocation(program, 'uMouse');
    const interactLoc = gl.getUniformLocation(program, 'uInteraction');

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isTouchDevice) {
        mouseRef.current = {
          x: e.clientX / window.innerWidth,
          y: 1.0 - (e.clientY / window.innerHeight)
        };
        interactionRef.current = 1.0;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();

    let startTime = Date.now();
    const render = () => {
      const time = (Date.now() - startTime) * 0.001;
      
      gl.uniform1f(timeLoc, time);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform2f(mouseLoc, mouseRef.current.x, mouseRef.current.y);
      gl.uniform1f(interactLoc, isTouchDevice ? 0.0 : interactionRef.current);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isTouchDevice]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
      style={{ filter: 'contrast(1.2) brightness(0.8)' }}
    />
  );
}
