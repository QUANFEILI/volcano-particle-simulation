"use strict";

var gl;
var program;

var positionBuffer;
var velocityBuffer;
var accelerationBuffer;
var colorBuffer;
var phaseBuffer;
var typeBuffer;

var positionLoc;
var velocityLoc;
var accelerationLoc;
var colorLoc;
var phaseLoc;
var typeLoc;

var timeLoc;
var matrixLoc;

var positions = [];
var velocities = [];
var accelerations = [];
var colors = [];
var phases = [];
var types = [];

var started = false;
var startTime;

var streamerCount = 500;
var ballisticCount = 250;


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
    phaseBuffer = gl.createBuffer();
    typeBuffer = gl.createBuffer();

    createVolcano();
    createParticles();
    uploadData();

    document.getElementById("startButton").onclick =
        startSimulation;

    render();
};


// ========================================
// Start Simulation
// ========================================

function startSimulation()
{
    started = true;
    startTime = performance.now();

    gl.clearColor(
        0.65, 0.65, 0.65, 1.0
    );
}


// ========================================
// Create Volcano
// ========================================

function createVolcano()
{
    positions.push(
        -1.0, -1.0,
        -0.10, 0.0,
         0.10, 0.0,
         1.0, -1.0
    );

    for (var i = 0; i < 4; i++)
    {
        velocities.push(0.0, 0.0);
        accelerations.push(0.0, 0.0);

        colors.push(
            1.0, 0.0, 0.0, 1.0
        );

        phases.push(0.0);
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
        var sx =
            (Math.random() - 0.5) * 0.18;

        var sy = 0.0;

        var svx =
            (Math.random() - 0.5) * 0.08;

        var svy =
            0.22 + Math.random() * 0.18;

        positions.push(sx, sy);

        velocities.push(svx, svy);

        // Streamer particles have no acceleration.
        accelerations.push(0.0, 0.0);

        colors.push(
            0.75, 0.75, 0.75, 1.0
        );

        phases.push(
            Math.random() * 5.0
        );

        types.push(1.0);
    }


    // ----------------------------------------
    // Ballistic particles
    // ----------------------------------------

    for (var j = 0; j < ballisticCount; j++)
    {
        var bx =
            (Math.random() - 0.5) * 0.18;

        var by = 0.0;

        var bvx =
            (Math.random() - 0.5) * 0.9;

        var bvy =
            0.55 + Math.random() * 0.65;

        positions.push(bx, by);

        velocities.push(bvx, bvy);

        // Gravity
        accelerations.push(0.0, -0.65);

        colors.push(
            Math.random(),
            Math.random(),
            Math.random(),
            1.0
        );

        phases.push(
            Math.random() * 3.0
        );

        types.push(2.0);
    }
}


// ========================================
// Upload Data
// ========================================

function uploadData()
{
    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        positionBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW
    );


    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        velocityBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(velocities),
        gl.STATIC_DRAW
    );


    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        accelerationBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(accelerations),
        gl.STATIC_DRAW
    );


    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        colorBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(colors),
        gl.STATIC_DRAW
    );


    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        phaseBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(phases),
        gl.STATIC_DRAW
    );


    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        typeBuffer
    );

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

    if (started)
    {
        var time =
            (performance.now() - startTime) / 1000.0;

        gl.uniform1f(
            timeLoc,
            time
        );

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
        gl.TRIANGLE_STRIP,
        0,
        4
    );
}


// ========================================
// Draw Particles
// ========================================

function drawParticles()
{
    gl.drawArrays(
        gl.POINTS,
        4,
        streamerCount + ballisticCount
    );
}


// ========================================
// Set Attributes
// ========================================

function setAttributes()
{
    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        positionBuffer
    );

    gl.vertexAttribPointer(
        positionLoc,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.enableVertexAttribArray(positionLoc);


    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        velocityBuffer
    );

    gl.vertexAttribPointer(
        velocityLoc,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.enableVertexAttribArray(velocityLoc);


    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        accelerationBuffer
    );

    gl.vertexAttribPointer(
        accelerationLoc,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.enableVertexAttribArray(accelerationLoc);


    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        colorBuffer
    );

    gl.vertexAttribPointer(
        colorLoc,
        4,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.enableVertexAttribArray(colorLoc);


    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        phaseBuffer
    );

    gl.vertexAttribPointer(
        phaseLoc,
        1,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.enableVertexAttribArray(phaseLoc);


    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        typeBuffer
    );

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
        attribute float vPhase;
        attribute float vType;

        uniform float uTime;
        uniform mat4 uMatrix;

        varying vec4 fColor;

        void main()
        {
            vec2 position = vPosition;

            if (vType > 0.5)
            {
                float t;

                if (vType < 1.5)
                {
                    t = mod(
                        uTime + vPhase,
                        4.5
                    );
                }
                else
                {
                    t = mod(
                        uTime + vPhase,
                        3.0
                    );
                }

                position =
                    vPosition
                    + vVelocity * t
                    + 0.5 * vAcceleration * t * t;
            }

            gl_Position =
                uMatrix *
                vec4(position, 0.0, 1.0);

            if (vType == 1.0)
            {
                gl_PointSize = 4.0;
            }
            else if (vType == 2.0)
            {
                gl_PointSize = 4.0;
            }
            else
            {
                gl_PointSize = 1.0;
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

    gl.attachShader(
        program,
        vertexShader
    );

    gl.attachShader(
        program,
        fragmentShader
    );

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

    phaseLoc =
        gl.getAttribLocation(
            program,
            "vPhase"
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


    var matrix = mat4();

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
};


// ========================================
// Finish attribute setup after shaders
// ========================================

var oldInit = window.onload;
