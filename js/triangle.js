import {vec3, mat4, mat3} from 'https://cdn.skypack.dev/gl-matrix';
import Transform from './transform.js';

export default class Triangle
{
    constructor(gl,color)
    {
        this.color =color;
        this.gl = gl;

        this.vertexAttributesBuffer = this.gl.createBuffer();
        if(!this.vertexAttributesBuffer)
        {
            throw new Error("Buffer for Triangle's Vertices could not be allocated");
        }

        this.vertexAttributesData = new Float32Array([
             0.0, -1.0, 1.0,
             1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0,
        ]);

        this.vertexIndices = new Uint16Array([
            0, 1, 
            1, 2,
            2, 0,
        ]);

        this.transform = new Transform();
    }

    draw(shader, viewProjectionMat)
    {       
        let mat = m3.identity();
        mat = m3.translate(mat, 0,0);
        
        mat = m3.multiply(viewProjectionMat, mat);
        const projectionUniform = shader.uniform("ViewProjection");
        shader.setUniformMatrix3fv(projectionUniform, viewProjectionMat);

        let vertexData = new Float32Array(this.vertexAttributesData)
        let elementPerVertex = 3;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexAttributesBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexData, this.gl.DYNAMIC_DRAW);

        const aPosition = shader.attribute("aPosition");
        this.gl.enableVertexAttribArray(aPosition);
        this.gl.vertexAttribPointer(aPosition, elementPerVertex, this.gl.FLOAT, false, 0,0)

        const u_color = shader.uniform("u_color");
        this.gl.uniform4fv(u_color, this.color);

        const indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndices, this.gl.DYNAMIC_DRAW);
        
        this.gl.drawElements(this.gl.LINES, this.vertexIndices.length, this.gl.UNSIGNED_SHORT, indexBuffer);
    }

    updateCamera(camera)
    {
        this.eye = vec3.fromValues(camera.eye.x, camera.eye.y, camera.eye.z);
        this.center = vec3.fromValues(camera.center.x, camera.center.y, camera.center.z);
        this.up = vec3.fromValues(camera.up.x, camera.up.y, camera.up.z);
    }
};