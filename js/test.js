import Renderer from "../js/renderer.js";
import Shader from "./shader.js";
import CirFragShaderSrc from "./shader/Circle/fragment.js";
import CirVertexShaderSrc from "./shader/Circle/vertex.js";
import Circle from "./circle.js";

const renderer = new Renderer();
const gl = renderer.webGlContext();

const shader = new Shader(gl, CirVertexShaderSrc, CirFragShaderSrc);

const camera = {
    x: -1,
    y: -1,
    rotation: 0,
    zoom: 400
};

function makeCameraMatrix() {
    const zoomScale = 1 / camera.zoom;
    let cameraMat = m3.identity();
    cameraMat = m3.translate(cameraMat, camera.x, camera.y);
    cameraMat = m3.scale(cameraMat, zoomScale, zoomScale);
    return cameraMat;
}
let viewProjectionMat;

function updateViewProjection() {
    // same as ortho(0, width, height, 0, -1, 1)
    const projectionMat = m3.projection(gl.canvas.width, gl.canvas.height);
    const cameraMat = makeCameraMatrix();
    let viewMat = m3.inverse(cameraMat);
    viewProjectionMat = m3.multiply(projectionMat, viewMat);
}

let startInvViewProjMat;
let startCamera;
let startPos;
let startClipPos;

function moveCamera(e) {
    let mouseX = e.clientX;
    let mouseY = e.clientY;
    let render_area = renderer.getCanvas().getBoundingClientRect();
    mouseX = mouseX - render_area.left;
    mouseY = mouseY - render_area.top;

    const mouseCoord = renderer.mouseToClipCoord(mouseX, mouseY);
    const pos = m3.transformPoint(
        startInvViewProjMat,
        mouseCoord
    );
    // const pos = mouseCoord;
    camera.x = startCamera.x + startPos[0] - pos[0];
    camera.y = startCamera.y + startPos[1] - pos[1];
    animate();
}

const Glyphs = [];
const pos1 = [
    [0,0],
    [0.25,0],
    [0.5,0],
    [0.75,0],
    [1.0,0],
    [1.25,0],
    [1.5,0],
    [1.75,0],
    [2.0,0],
    [2.25,0],
    [2.5,0],
    [2.75,0],
    [3.0,0],
]
const pos2 = [
    [0,0.25],
    [0.25,0.25],
    [0.5,0.25],
    [0.75,0.25],
    [1.0,0.25],
    [1.25,0.25],
    [1.5,0.25],
    [1.75,0.25],
    [2.0,0.25],
    [2.25,0.25],
    [2.5,0.25],
    [2.75,0.25],
    [3.0,0.25],
]
const radius = 0.1;
var DMap = [0,  1,  2,  3,  4,  5,  6,  7,  8,  -1, -1, -1];
var VMap = [-1, 2,  8,  3,  -1, 0,  4,  -1, 5,  1,  6,  7];
for(var i=0; i<12; i++)
{
    var probD = [0,0,0,0,0,0,0,0,0,0,0];
    var probV = [0,0,0,0,0,0,0,0,0,0,0];
    probV[VMap[i]]=1;
    probD[DMap[i]]=1;
    if(VMap[i]!=-1)Glyphs.push(new Circle(gl, pos2[i][0], pos2[i][1], radius, probV,0));
    if(DMap[i]!=-1)Glyphs.push(new Circle(gl, pos1[i][0], pos1[i][1], radius, probD,1));
    
}

let terminate = false;
window.onload = () => 
{
    renderer.getCanvas().addEventListener('click', (event) =>
    {
        // Click coordinate conversion to Canvas coordinate System
        let mouseX = event.clientX;
        let mouseY = event.clientY;

        let render_area = renderer.getCanvas().getBoundingClientRect();
        mouseX = mouseX - render_area.left;
        mouseY = mouseY - render_area.top;

        const clipCoordinates = renderer.mouseToClipCoord(mouseX, mouseY);
    });

    renderer.getCanvas().addEventListener("wheel", (e)=> {
        e.preventDefault();
        let mouseX = e.clientX;
        let mouseY = e.clientY;

        let render_area = renderer.getCanvas().getBoundingClientRect();
        mouseX = mouseX - render_area.left;
        mouseY = mouseY - render_area.top;

        const [clipX, clipY] = renderer.mouseToClipCoord(mouseX, mouseY);

        // position before zooming
        const [preZoomX, preZoomY] = m3.transformPoint(
            m3.inverse(viewProjectionMat),
            [clipX, clipY]
        );

        // multiply the wheel movement by the current zoom level
        // so we zoom less when zoomed in and more when zoomed out
        const newZoom = camera.zoom * Math.pow(2, e.deltaY * -0.01);
        camera.zoom = Math.max(100, Math.min(30000, newZoom));

        updateViewProjection();

        // position after zooming
        const [postZoomX, postZoomY] = m3.transformPoint(
            m3.inverse(viewProjectionMat),
            [clipX, clipY]
        );

        // camera needs to be moved the difference of before and after
        camera.x += preZoomX - postZoomX;
        camera.y += preZoomY - postZoomY;
        animate();
    });
      
    function handleMouseUp(e) {
        animate();
        window.removeEventListener("mousemove", moveCamera);
        window.removeEventListener("mouseup", handleMouseUp);
    }

    renderer.getCanvas().addEventListener("mousedown", (e)=> {
        e.preventDefault();
        window.addEventListener("mousemove", moveCamera);
        window.addEventListener("mouseup", handleMouseUp);

        startInvViewProjMat = m3.inverse(viewProjectionMat);
        startCamera = Object.assign({}, camera);
        
        
        let mouseX = e.clientX;
        let mouseY = e.clientY;
        let render_area = renderer.getCanvas().getBoundingClientRect();
        mouseX = mouseX - render_area.left;
        mouseY = mouseY - render_area.top;
        
        
        startClipPos = renderer.mouseToClipCoord(mouseX, mouseY);
        startPos = m3.transformPoint(startInvViewProjMat, startClipPos);
        // startPos = startClipPos;
        animate();
    });

    document.addEventListener("keydown", (ev) => {
        if(ev.key == 'Escape')
        {
            terminate = true;
        }
    });
};


function animate()
{
    renderer.resizeCanvas();
    renderer.clear();
    
    updateViewProjection();

    shader.use();
    for(let i=0; i< Glyphs.length; i+=1)
    {
        Glyphs[i].draw(shader, viewProjectionMat);
    }
    
    // Activated by pressing 'Escape' key
    if(terminate == false)
        window.requestAnimationFrame(animate);
    else
        window.cancelAnimationFrame(animate);
}

animate();