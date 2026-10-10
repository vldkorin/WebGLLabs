'use strict';

const a = 1, b = 1, c = 1;

let uSegments = 100;
let vSegments = 60;

function snailPoint(u, v) {
    return [a * u * Math.sin(u) * Math.cos(v),
            b * u * Math.cos(u) * Math.cos(v),
            -c * u * Math.sin(v)];
}

function CreateSurfaceData() {
    const vertices = [];
    const indices = [];

    for (let i = 0; i <= uSegments; i++) {
        const u = 2 * Math.PI * i / uSegments;
        for (let j = 0; j <= vSegments; j++) {
            const v = -Math.PI + 2 * Math.PI * j / vSegments;
            vertices.push( ...snailPoint(u, v) );
        }
    }

    for (let i = 0; i < uSegments; i++) {
        for (let j = 0; j < vSegments; j++) {
            const i0 = i * (vSegments + 1) + j;
            const i1 = i0 + 1;
            const i2 = i0 + vSegments + 1;
            const i3 = i2 + 1;
            indices.push(i0, i2, i1);
            indices.push(i1, i2, i3);
        }
    }

    return { vertices: vertices, indices: indices };
}

// Constructor
function Model(name) {
    this.name = name;
    this.iVertexBuffer = gl.createBuffer();
    this.iIndexBuffer = gl.createBuffer();
    this.count = 0;

    this.BufferData = function(data) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vertices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data.indices), gl.STATIC_DRAW);

        this.count = data.indices.length;
    }

    this.Draw = function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    }
}
