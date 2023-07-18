import { vec3, mat4} from 'https://cdn.skypack.dev/gl-matrix';
import Transform from './transform.js';



export default class Circle
{
    constructor(gl, centerX, centerY, radius, probs, type)
    {
        this.gl = gl;

        this.vertexAttributesBuffer = this.gl.createBuffer();
        if(!this.vertexAttributesBuffer)
        {
            throw new Error("Buffer for Circle's vertices could Not be allocated");
        }

        this.radius = radius;
        // this.radius = 0.02;
        this.vertexAttributesData = [];
        this.vertCount = 2;
        this.type = type;

        var bins = 16;
        var categories = probs;
        var pos = 0;
        var degreeCount=0;
        var epsilon = 360/bins;

        for(var i=0; i<bins; i+=1)
        {
            var j = i* Math.PI / (bins/2);
            var vert1 = [
                // X, Y, Z
                Math.cos(j)*this.radius, Math.sin(j)*this.radius,
            ];

            this.vertexAttributesData = this.vertexAttributesData.concat(vert1);
        }		

        this.vertexColorBuffer = this.gl.createBuffer();
        this.vertexColorData = [];
        
        var ColorArray =
         [
            [0.65, 0.81, 0.89, 1.0], 
            [0.12, 0.47, 0.71, 1.0], 
            [0.70, 0.87, 0.54, 1.0],
            [0.20, 0.63, 0.17, 1.0], 
            [0.98, 0.60, 0.60, 1.0], 
            [0.89, 0.10, 0.11, 1.0],
            [0.99, 0.75, 0.44, 1.0], 
            [1.00, 0.50, 0.00, 1.0], 
            [0.79, 0.70, 0.84, 1.0],
            [0.42, 0.24, 0.60, 1.0], 
            [1.00, 1.00, 0.60, 1.0], 
            [0.69, 0.35, 0.16, 1.0],
            [0.00, 0.00, 0.00, 1.0], 
            [0.39, 0.39, 0.39, 1.0]
        ];

        var VaiMapIndextoColor = [
            7, 10, 1, 6, 2, 5, 4, 11, 3
        ];

        var DaleMapIndextoColor = [
            12,1,3,6,8,7,2,9,5
        ];

        pos = 0;
        degreeCount=0;
        var colMap = {
            1 : [0, 1.0, 1.0, 1.0],
            2 : [1.0, 1.0, 1.0, 1.0],
            5 : [0, 0, 1.0, 1.0],
            8 : [0, 1.0, 0, 1.0]
        }
        for(var i=0; i<bins;)
        {
            if(categories[pos]*360 < epsilon)
            {
                pos += 1;
                continue;
            }
            var color;
            console.log(type);
            if(type==1) color = ColorArray[DaleMapIndextoColor[pos]];
            else color = ColorArray[VaiMapIndextoColor[pos]];
            
            this.vertexColorData = this.vertexColorData.concat(color);
            var j = i* 360 / (bins);
            i+=1;
            while(j-degreeCount < categories[pos]*360)
            {
                this.vertexColorData = this.vertexColorData.concat(color);
                j = i* 360 / (bins);    
                i+=1;
            }
            pos+=1;
            degreeCount=j;    
        }


        this.centerX = centerX;
        this.centerY = centerY;
    }

    draw(shader, viewProjectionMat)
    {
        let mat = m3.identity();
        mat = m3.translate(mat, this.centerX, this.centerY);

        mat = m3.multiply(viewProjectionMat, mat);
        // const modelUniform = shader.uniform("Model");
        // shader.setUniformMatrix3fv(modelUniform, this.transform.getModelMatrix());
        
        const projectionUniform = shader.uniform("ViewProjection");
        shader.setUniformMatrix3fv(projectionUniform, mat);

        let vertexData = new Float32Array(this.vertexAttributesData)
        let elementPerVertex = 2;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexAttributesBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexData, this.gl.STATIC_DRAW);

        const aPosition = shader.attribute("aPosition");
        this.gl.enableVertexAttribArray(aPosition);
        this.gl.vertexAttribPointer(aPosition, elementPerVertex, this.gl.FLOAT, false, 0,0)

        let vertexColor = new Float32Array(this.vertexColorData);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexColorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexColor, this.gl.STATIC_DRAW);
        const aColor = shader.attribute("a_color");
        this.gl.enableVertexAttribArray(aColor);
        this.gl.vertexAttribPointer(aColor, 4, this.gl.FLOAT, false, 0,0);

        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, vertexData.length/this.vertCount);
    }
};