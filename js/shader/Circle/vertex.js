const CirVertexShaderSrc = `
    attribute vec2 aPosition;
    attribute vec4 a_color;

    varying vec4 v_color;
    uniform mat3 ViewProjection;

    void main() {
        gl_Position = vec4(ViewProjection * vec3(aPosition,1),1.0);
        gl_PointSize = 5.0;
        v_color = a_color;
    }


`;

export default CirVertexShaderSrc;