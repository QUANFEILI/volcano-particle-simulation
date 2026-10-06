"use strict";

var gl;
var program;

var positionBuffer;
var velocityBuffer;
var accelerationBuffer;
var colorBuffer;
var typeBuffer;

var positionLoc;
var velocityLoc;
var accelerationLoc;
var colorLoc;
var typeLoc;

var timeLoc;
var matrixLoc;

var positions = [];
var velocities = [];
var accelerations = [];
var colors = [];
var types = [];

var startTime;


// ========================================
// Initialize WebGL
// ========================================

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext("webgl");

    if (!gl)
    {
        alert("WebGL is not available");
        return;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(0.5, 0.5, 0.5, 1.0);

    initShaders();

    positionBuffer = gl.createBuffer();
    velocityBuffer = gl.createBuffer();
    accelerationBuffer = gl.createBuffer();
    colorBuffer = gl.createBuffer();
    typeBuffer = gl.createBuffer();

    createVolcano();
    createParticles();
    uploadData();

    startTime = performance.now();

    render();
};


// ========================================
// Create Volcano
// ========================================

function createVolcano()
{
    positions.push(
        -0.9, -0.9,
        -0.65, -0.45,
        -0.25, -0.05,
         0.25, -0.05,
         0.65, -0.45,
         0.9, -0.9
    );

    for (var i = 0; i < 6; i++)
    {
        velocities.push(0, 0);
        accelerations.push(0, 0);
        colors.push(0.35, 0.18, 0.08, 1.0);
        types.push(0.0);
    }
}


// ========================================
// Create Particles
// ========================================

function createParticles()
{
    // Streamer particles

    for (var i = 0; i < 100; i++)
    {
        var x = (Math.random() - 0.5) * 0.3;
        var y = -0.02;

        var vx = (Math.random() - 0.5) * 0.2;
        var vy = 0.4 + Math.random() * 0.3;

        positions.push(x, y);
        velocities.push(vx, vy);
        accelerations.push(0.0, 0.0);
        colors.push(0.5, 0.5, 0.5, 1.0);
        types.push(1.0);
    }


    // Ballistic particles

    for (var j = 0; j < 100; j++)
    {
        var bx = (Math.random() - 0.5) * 0.2;
        var by = 0.0;

        var bvx = (Math.random() - 0.5) * 1.0;
        var bvy = 0.8 + Math.random() * 0.8;

        positions.push(bx, by);
        velocities.push(bvx, bvy);
        accelerations.push(0.0, -0.8);

        colors.push(
            1.0,
            Math.random() * 0.5,
            0.0,
            1.0
        );

        types.push(2.0);
    }
}


// ========================================
// Upload Data
// ========================================

function uploadData()
{
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, velocityBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(velocities),
        gl.STATIC_DRAW
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, accelerationBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(accelerations),
        gl.STATIC_DRAW
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(colors),
        gl.STATIC_DRAW
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, typeBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(types),
        gl.STATIC_DRAW
    );
}


// ========================================
// Render
// ========================================

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT);

    var time =
        (performance.now() - startTime) / 1000.0;

    var matrix = mat4();

    gl.uniformMatrix4fv(
        matrixLoc,
        false,
        flatten(matrix)
    );

    gl.uniform1f(
        timeLoc,
        time
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.vertexAttribPointer(
        positionLoc,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.enableVertexAttribArray(positionLoc);


    gl.bindBuffer(gl.ARRAY_BUFFER, velocityBuffer);

    gl.vertexAttribPointer(
        velocityLoc,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.enableVertexAttribArray(velocityLoc);


    gl.bindBuffer(gl.ARRAY_BUFFER, accelerationBuffer);

    gl.vertexAttribPointer(
        accelerationLoc,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.enableVertexAttribArray(accelerationLoc);


    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    gl.vertexAttribPointer(
        colorLoc,
        4,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.enableVertexAttribArray(colorLoc);


    gl.bindBuffer(gl.ARRAY_BUFFER, typeBuffer);

    gl.vertexAttribPointer(
        typeLoc,
        1,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.enableVertexAttribArray(typeLoc);


    gl.drawArrays(
        gl.TRIANGLE_STRIP,
        0,
        6
    );

    gl.drawArrays(
        gl.POINTS,
        6,
        200
    );

    requestAnimFrame(render);
}


// ========================================
// Initialize Shaders
// ========================================

function initShaders()
{
    var vertexShaderSource = `

        attribute vec2 vPosition;
        attribute vec2 vVelocity;
        attribute vec2 vAcceleration;

        attribute vec4 vColor;
        attribute float vType;

        uniform float uTime;
        uniform mat4 uMatrix;

        varying vec4 fColor;

        void main()
        {
            vec2 position = vPosition;

            float t = uTime;

            if (vType > 0.5)
            {
                position =
                    vPosition
                    + vVelocity * t
                    + 0.5 * vAcceleration * t * t;
            }

            gl_Position =
                uMatrix * vec4(position, 0.0, 1.0);

            if (vType == 1.0)
            {
                gl_PointSize = 8.0;
            }
            else if (vType == 2.0)
            {
                gl_PointSize = 6.0;
            }

            fColor = vColor;
        }
    `;


    var fragmentShaderSource = `

        precision mediump float;

        varying vec4 fColor;

        void main()
        {
            gl_FragColor = fColor;
        }
    `;


    var vertexShader =
        compileShader(
            gl.VERTEX_SHADER,
            vertexShaderSource
        );

    var fragmentShader =
        compileShader(
            gl.FRAGMENT_SHADER,
            fragmentShaderSource
        );

    program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    gl.useProgram(program);

    positionLoc =
        gl.getAttribLocation(program, "vPosition");

    velocityLoc =
        gl.getAttribLocation(program, "vVelocity");

    accelerationLoc =
        gl.getAttribLocation(program, "vAcceleration");

    colorLoc =
        gl.getAttribLocation(program, "vColor");

    typeLoc =
        gl.getAttribLocation(program, "vType");

    timeLoc =
        gl.getUniformLocation(program, "uTime");

    matrixLoc =
        gl.getUniformLocation(program, "uMatrix");
}


// ========================================
// Compile Shader
// ========================================

function compileShader(type, source)
{
    var shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(
        shader,
        gl.COMPILE_STATUS
    ))
    {
        console.log(
            gl.getShaderInfoLog(shader)
        );

        return null;
    }

    return shader;
}
