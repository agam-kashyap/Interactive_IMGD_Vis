const vertexShaderSrc = `
    attribute vec3 aPosition;
    
    uniform mat3 ViewProjection;
    
    void main() {
        gl_Position = vec4(ViewProjection * aPosition,1.0);
        gl_PointSize = 5.0;
    }
`;

export default vertexShaderSrc;