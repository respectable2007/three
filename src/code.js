var mycanvas;
var gl;

//Shaders
var VSHADER_SOURCE = null;
var FSHADER_SOURCE = null;


function main()
{
    mycanvas = document.getElementById("mycanvas");
    var gl = mycanvas.getContext("experimental-webgl");

    loadShaderFile(gl, 'src/vshader.vert', gl.VERTEX_SHADER);
    loadShaderFile(gl, 'src/fshader.frag', gl.FRAGMENT_SHADER);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);  
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function start(gl) 
{
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) 
    {
        console.log("Problem whit shaders");
    }

   
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, 1);
    
}

function loadShaderFile(gl, fileName, shader) {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() 
    {
        if (request.readyState === 4 && request.status !== 404) {
            onLoadShader(gl, request.responseText, shader);
        }
    }

    request.open('GET', fileName, true);
    request.send(); // Send the request
}

function onLoadShader(gl, fileString, type) 
{
    console.log("on load shader");
    if (type == gl.VERTEX_SHADER) 
    { // The vertex shader is loaded
        VSHADER_SOURCE = fileString;
    } 
    else
        if (type == gl.FRAGMENT_SHADER) 
        { // The fragment shader is loaded
            FSHADER_SOURCE = fileString;
        }

    // Start rendering, after loading both shaders
    if (VSHADER_SOURCE && FSHADER_SOURCE) start(gl);
}



