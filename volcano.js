"use strict";

var gl;
var program;

var positionBuffer;
var velocityBuffer;
var accelerationBuffer;
var colorBuffer;
var startTimeBuffer;
var typeBuffer;

var positionLoc;
var velocityLoc;
var accelerationLoc;
var colorLoc;
var startTimeLoc;
var typeLoc;

var timeLoc;
var matrixLoc;

var positions = [];
var velocities = [];
var accelerations = [];
var colors = [];
var startTimes = [];
var types = [];

var startSimulation = false;

var streamerCount = 900;
var ballisticCount = 700;
var volcanoCount = 5;

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

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    initShaders();

    positionBuffer = gl.createBuffer();
    velocityBuffer = gl.createBuffer();
    accelerationBuffer = gl.createBuffer();
    colorBuffer = gl.createBuffer();
    startTimeBuffer = gl.createBuffer();
    typeBuffer = gl.createBuffer();

    createVolcano();
    createParticles();
    uploadData();

    document.getElementById("startButton").onclick = function()
    {
        startSimulation = true;
        startTime = performance.now();

        gl.clearColor(
            0.65,
            0.65,
            0.65,
            1.0
        );
    };

    render();
};


// ========================================
// Create Volcano
// ========================================

function createVolcano()
{
    // Center of the mountain.
    positions.push(
        0.0, -4.0
    );

    colors.push(
        0.65, 0.0, 0.0, 1.0
    );

    // Simple straight-line mountain shape.
    positions.push(
        -4.0, -4.0,
        -0.8,  0.0,
         0.8,  0.0,
         4.0, -4.0
    );

    // One solid color for the whole volcano.
    colors.push(
        0.65, 0.0, 0.0, 1.0,
        0.65, 0.0, 0.0, 1.0,
        0.65, 0.0, 0.0, 1.0,
        0.65, 0.0, 0.0, 1.0
    );

    for (var i = 0; i < volcanoCount; i++)
    {
        velocities.push(0.0, 0.0);
        accelerations.push(0.0, 0.0);
        startTimes.push(0.0);
        types.push(0.0);
    }
}


// ========================================
// Create Particles
// ========================================

function createParticles()
{
    // ----------------------------------------
    // Streamer particles
    // ----------------------------------------

    for (var i = 0; i < streamerCount; i++)
    {
        positions.push(
            randomRange(-0.18, 0.18),
            0.0
        );

        velocities.push(
            randomRange(-0.20, 0.20),
            randomRange(1.1, 1.8)
        );

        accelerations.push(
            0.0, 0.0
        );

        colors.push(
            randomRange(0.70, 0.90),
            randomRange(0.70, 0.90),
            randomRange(0.70, 0.90),
            1.0
        );

        startTimes.push(
            randomRange(0.0, 4.0)
        );

        types.push(1.0);
    }


    // ----------------------------------------
    // Ballistic particles
    // ----------------------------------------

    for (var j = 0; j < ballisticCount; j++)
    {
        var angle =
            randomRange(
                50.0,
                130.0
            ) * Math.PI / 180.0;

        var speed =
            randomRange(
                2.2,
                3.8
            );

        positions.push(
            randomRange(-0.12, 0.12),
            0.0
        );

        velocities.push(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );

        accelerations.push(
            0.0, -2.0
        );

        colors.push(
            Math.random(),
            Math.random(),
            Math.random(),
            1.0
        );

        startTimes.push(
            randomRange(0.0, 4.0)
        );

        types.push(2.0);
    }
}


// ========================================
// Random number
// ========================================

function randomRange(min, max)
{
    return min + Math.random() * (max - min);
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

    gl.bindBuffer(gl.ARRAY_BUFFER, startTimeBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(startTimes),
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

    if (startSimulation)
    {
        var time =
            (performance.now() - startTime) / 1000.0;

        gl.uniform1f(
            timeLoc,
            time
        );

        setAttributes();

        drawVolcano();
        drawParticles();
    }

    requestAnimFrame(render);
}


// ========================================
// Draw Volcano
// ========================================

function drawVolcano()
{
    gl.drawArrays(
        gl.TRIANGLE_FAN,
        0,
        volcanoCount
    );
}


// ========================================
// Draw Particles
// ========================================

function drawParticles()
{
    gl.drawArrays(
        gl.POINTS,
        volcanoCount,
        streamerCount + ballisticCount
    );
}


// ========================================
// Set Attributes
// ========================================

function setAttributes()
{
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

    gl.bindBuffer(gl.ARRAY_BUFFER, startTimeBuffer);
    gl.vertexAttribPointer(
        startTimeLoc,
        1,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(startTimeLoc);

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
        attribute float vStartTime;
        attribute float vType;

        uniform float uTime;
        uniform mat4 uMatrix;

        varying vec4 fColor;

        void main()
        {
            vec2 position = vPosition;

            if (vType > 0.5)
            {
                float t =
                    mod(
                        uTime + vStartTime,
                        4.0
                    );

                position =
                    vPosition
                    + vVelocity * t
                    + 0.5 * vAcceleration * t * t;
            }

            gl_Position =
                uMatrix *
                vec4(position, 0.0, 1.0);

            gl_PointSize = 3.0;

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
        gl.getAttribLocation(
            program,
            "vPosition"
        );

    velocityLoc =
        gl.getAttribLocation(
            program,
            "vVelocity"
        );

    accelerationLoc =
        gl.getAttribLocation(
            program,
            "vAcceleration"
        );

    colorLoc =
        gl.getAttribLocation(
            program,
            "vColor"
        );

    startTimeLoc =
        gl.getAttribLocation(
            program,
            "vStartTime"
        );

    typeLoc =
        gl.getAttribLocation(
            program,
            "vType"
        );

    timeLoc =
        gl.getUniformLocation(
            program,
            "uTime"
        );

    matrixLoc =
        gl.getUniformLocation(
            program,
            "uMatrix"
        );

    var matrix =
        scale4x4(
            0.25,
            0.25,
            1.0
        );

    gl.uniformMatrix4fv(
        matrixLoc,
        false,
        flatten(matrix)
    );
}


// ========================================
// Compile Shader
// ========================================

function compileShader(type, source)
{
    var shader =
        gl.createShader(type);

    gl.shaderSource(
        shader,
        source
    );

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
