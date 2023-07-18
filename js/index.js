import Renderer from './renderer.js';
import Shader from './shader.js';
import vertexShaderSrc from './shader/Triangle/vertex.js';
import fragmentShaderSrc from './shader/Triangle/fragment.js';
import CirVertexShaderSrc from './shader/Circle/vertex.js';
import CirFragShaderSrc from './shader/Circle/fragment.js';
import Triangle from './triangle.js';
import Circle from './circle.js';
import modifyData from './data.js';
import {vec3, mat4, mat3} from 'https://cdn.skypack.dev/gl-matrix';
/* Canvas Setup Begins */
const renderer = new Renderer();
const gl = renderer.webGlContext();

const triShader = new Shader(gl, vertexShaderSrc, fragmentShaderSrc);
const circShader = new Shader(gl,CirVertexShaderSrc,CirFragShaderSrc);

/* Canvas Setup Ends */

// Color Dictionary
const Color = {
    'triangle' : new Float32Array([0.0, 0.0, 0.0, 1.0])
};

//---------Camera Utilities----------
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
//----------------FIGURE-----------------------

//----CSV Input--------
const myForm = document.getElementById("myForm");
const csvFile = document.getElementById("csvFile");

// The Dales dataset contains .txt files which contain '\r\n' hence splitting the lines is different
// The Vaihingen dataset contains .csv files which just have '\n' to denote line break
var fileExt = "csv"; 
var isDale = true;
function csvToArray(str, delimiter = " ") {

    // slice from start of text to the first \n index
    // use split to create an array from string by delimiter
    const headers = ["x","y","z", "alpha", "beta", "gamma", "class"];

    // slice from \n index + 1 to the end of the text
    // use split to create an array of each csv value row
    var rows;
    if(fileExt == "csv")
    {
        rows = str.slice(str.indexOf("\n") + 1).split("\n");
        isDale = false;
    }
    else
    {
        rows = str.slice(str.indexOf("\r\n") + 1).split("\r\n");
        isDale = true;
    }
    // Map the rows
    // split values from each row into an array
    // use headers.reduce to create an object
    // object properties derived from headers:values
    // the object passed as an element of the array
    const arr = rows.map(
        function (row) {
            const values = row.split(delimiter);
            for(var i=3; i<6; i+=1)
            {
                values[i] = Math.round(values[i]*100)/100;
            }
            const el = headers.reduce(function (object, header, index) {
                object[header] = values[index];
                return object;
            },{});
            return el;
        });
    
    // return the array
    var newarr = arr.slice(0, arr.length-1);
    return newarr;
}
var classes = [];
function merge(arr)
{
    //create a key with string

    const map = new Map();

    for(var i=0; i<arr.length; i+=1)
    {
        var key = "" + arr[i].alpha.toString() + " " + arr[i].beta.toString() + " " + arr[i].gamma.toString();
        if(classes.indexOf(arr[i].class)==-1)
        {
            console.log(arr[i]);
            classes.push(arr[i].class);
        }
        if(!map.has(key))
        {
            var vals = [0,0,0,0,0,0,0,0,0,0,0,0];
            vals[arr[i].class] = 1;
            map.set(key, vals);
        }
        else
        {
            var vals = map.get(key);
            vals[arr[i].class] += 1;
            map.set(key, vals);
        }
        // if(i==10)break;
    }

    for(let key of map.keys()){
        var total = 0;
        const vals = map.get(key);
        for(var i of vals)
        {
            total += i;
        }
        for(var i=0; i<9; i+=1)
        {
            vals[i] = Math.round(vals[i]*1000/total)/1000;
        }
        map.set(key, vals);
    }
    console.log(classes);
    return map;
}

fileForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const input = csvFile.files[0];
        fileExt = input.name.split(".")[1];

        fileNameNode.nodeValue = input.name;
        typeNode.nodeValue = fileExt == 'csv'? 'Vaihingen': 'Dales';

        const reader = new FileReader();

        reader.onload = function (e) {
            const text = e.target.result;
            const data = csvToArray(text);
            const vals = merge(data);
            Glyphs = [];
            Glyphs = update_figure(vals);
        };
    
    reader.readAsText(input);
});

function update_figure(map)
{
    const Glyphs = [];
    for(var [key, val] of map)
    {
        const probs = key.split(" ");
        var alpha = probs[0];
        var beta = probs[1];
        var posX = 1*(alpha) + (-1)*(1- alpha - beta);
        var posY = 1*alpha + (-1) * beta + (1-alpha- beta)*1;
        if(isDale) Glyphs.push(new Circle(gl, posX,posY, 0.01, val, 1));
        else Glyphs.push(new Circle(gl, posX,posY, 0.01, val, 0));
        
    }
    return Glyphs;
}
const Figures = [];

var Glyphs = [];


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

const screenshot = document.querySelector('#screenshot');
screenshot.addEventListener('click', () => {  
    triShader.use();
    Figures[0].draw(triShader, viewProjectionMat);
    
    circShader.use();
    for(let i=0; i< Glyphs.length; i+=1)
    {
        Glyphs[i].draw(circShader, viewProjectionMat);
    }
    
    renderer.getCanvas().toBlob((blob) => {
        saveBlob(blob, `screencapture-${renderer.getCanvas().width}x${renderer.getCanvas().height}.png`);
    });
});

const saveBlob = (function() {
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    return function saveData(blob, fileName) {
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
    };
}());

const resetScale = document.querySelector('#resetScale');
resetScale.addEventListener('click', ()=> {
    camera.zoom = 400;
    camera.x = -1;
    camera.y = -1;
    triShader.use();
    Figures[0].draw(triShader, viewProjectionMat);
    
    circShader.use();
    for(let i=0; i< Glyphs.length; i+=1)
    {
        Glyphs[i].draw(circShader, viewProjectionMat);
    }
});


var zoomValElement = document.querySelector('#zoomVal');
var zoomNode = document.createTextNode("");
zoomValElement.appendChild(zoomNode);

var fileNameElement = document.querySelector('#fileName');
var fileNameNode = document.createTextNode("");
fileNameElement.appendChild(fileNameNode);

var fileTypeElement = document.querySelector('#dataType');
var typeNode = document.createTextNode("");
fileTypeElement.appendChild(typeNode);

function animate()
{
    renderer.resizeCanvas();
    renderer.clear();
    
    updateViewProjection();

    zoomNode.nodeValue = camera.zoom;
    
    circShader.use();
    for(let i=0; i< Glyphs.length; i+=1)
    {
        Glyphs[i].draw(circShader, viewProjectionMat);
    }
    
    // Activated by pressing 'Escape' key
    if(terminate == false)
        window.requestAnimationFrame(animate);
    else
        window.cancelAnimationFrame(animate);
}

animate();