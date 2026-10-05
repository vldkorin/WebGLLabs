'use strict';

const a = 1, b = 1, c = 1;

const uSegments = 60, vSegments = 40;
const uCurves = 30, vCurves = 40;


function snailPoint(u, v) {
    return [a * u * Math.sin(u) * Math.cos(v),
            b * u * Math.cos(u) * Math.cos(v),
            -c * u * Math.sin(v)];
}


function CreateSurfaceData() {
    const vertices = [];
    const uPolylines = [];
    const vPolylines = [];

    for (let i = 0; i < uCurves; i++) {
        const v = -Math.PI + 2 * Math.PI * i / (uCurves - 1);
        const first = vertices.length / 3;

        for (let j = 0; j <= uSegments; j++) {
            const u = 2 * Math.PI * j / uSegments;
            vertices.push( ...snailPoint(u, v) );
        }

        uPolylines.push({ first: first, count: uSegments + 1 });
    }

    for (let i = 0; i < vCurves; i++) {
        const u = 2 * Math.PI * i / (vCurves - 1);
        const first = vertices.length / 3;

        for (let j = 0; j <= vSegments; j++) {
            const v = -Math.PI + 2 * Math.PI * j / vSegments;
            vertices.push( ...snailPoint(u, v) );
        }

        vPolylines.push({ first: first, count: vSegments + 1 });
    }

    return { vertices: vertices, uPolylines: uPolylines, vPolylines: vPolylines };
}


// Constructor
function Model(name) {
    this.name = name;
    this.iVertexBuffer = gl.createBuffer();
    this.uPolylines = [];
    this.vPolylines = [];

    this.BufferData = function(data) {
        this.uPolylines = data.uPolylines;
        this.vPolylines = data.vPolylines;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vertices), gl.STREAM_DRAW);
    }

    this.DrawPolylines = function(polylines) {
        for (let i = 0; i < polylines.length; i++)
            gl.drawArrays(gl.LINE_STRIP, polylines[i].first, polylines[i].count);
    }

    this.Draw = function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);

        gl.uniform4fv(shProgram.iColor, [1, 1, 0, 1]);
        this.DrawPolylines(this.uPolylines);

        gl.uniform4fv(shProgram.iColor, [0, 0.7, 1, 1]);
        this.DrawPolylines(this.vPolylines);
    }
}
