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

    return { vertices: vertices,
             indices: indices,
             normals: CalculateNormals(vertices, indices) };
}

function CalculateNormals(vertices, indices) {
    const normals = new Array(vertices.length).fill(0);

    for (let t = 0; t < indices.length; t += 3) {
        const p0 = indices[t] * 3;
        const p1 = indices[t + 1] * 3;
        const p2 = indices[t + 2] * 3;

        const ax = vertices[p1] - vertices[p0];
        const ay = vertices[p1 + 1] - vertices[p0 + 1];
        const az = vertices[p1 + 2] - vertices[p0 + 2];

        const bx = vertices[p2] - vertices[p0];
        const by = vertices[p2 + 1] - vertices[p0 + 1];
        const bz = vertices[p2 + 2] - vertices[p0 + 2];

        const cx = ay * bz - az * by;
        const cy = az * bx - ax * bz;
        const cz = ax * by - ay * bx;

        const len = Math.sqrt(cx * cx + cy * cy + cz * cz);
        if (len === 0) continue;

        const area = len / 2;
        const nx = cx / len * area;
        const ny = cy / len * area;
        const nz = cz / len * area;

        for (const p of [p0, p1, p2]) {
            normals[p] += nx;
            normals[p + 1] += ny;
            normals[p + 2] += nz;
        }
    }

    for (let p = 0; p < normals.length; p += 3) {
        const len = Math.sqrt(normals[p] * normals[p] +
                              normals[p + 1] * normals[p + 1] +
                              normals[p + 2] * normals[p + 2]);
        if (len === 0) {
            normals[p + 2] = 1;
            continue;
        }
        normals[p] /= len;
        normals[p + 1] /= len;
        normals[p + 2] /= len;
    }

    return normals;
}

// Constructor
function Model(name) {
    this.name = name;
    this.iVertexBuffer = gl.createBuffer();
    this.iNormalBuffer = gl.createBuffer();
    this.iIndexBuffer = gl.createBuffer();
    this.count = 0;

    this.BufferData = function(data) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vertices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.normals), gl.STATIC_DRAW);

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
