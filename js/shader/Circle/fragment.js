const CirFragShaderSrc = `
    precision mediump float;
    varying vec4 v_color;
    void main () {
        gl_FragColor = v_color;
    }
`;

export default CirFragShaderSrc;