
/**
 * 常量
 */
const a = 'ARRAY_BUFFER',
      c = 'COLOR_BUFFER_BIT',
      d = 'DEPTH_BUFFER_BIT',
      f = 'FLOAT',
      s = 'STENCIL_BUFFER_BIT',
      st = 'STATIC_DRAW',
      p = 'POINTS';
/**
 * 获取项目索引
 * @param {Array} arr 
 * @param {*} item 
 */
function findIndex(arr, item) {
  if(!arr) {
    return;
  }
  var i = 0,
      lens = arr.length;
  for(;i < lens; i++) {
    if(arr[i] === item) {
      return i;
    }
  }
  return -1;
}

function initVertex(gl, ps) {
  var verticles = new Float32Array(ps),
  n = ps.length / 2,
  buffer = gl.createBuffer(),
  a_position,
  a_pointsize,
  u_fragcolor;
  gl.bindBuffer(gl[a], buffer);
  gl.bufferData(gl[a], verticles, gl[st]);
  if((a_position = gl.getAttribLocation(gl.program, 'a_position')) < 0) {
    console.log('Failed to get attribute address');
    return -1;
  }
  if((a_pointsize = gl.getAttribLocation(gl.program, 'a_pointsize')) < 0) {
    console.log('Failed to get attribute address');
    return -1;
  }
  if(!(u_fragcolor = gl.getUniformLocation(gl.program, 'u_fragcolor'))) {
    console.log('Failed to get uniform');
    return -1;
  }
  gl.vertexAttribPointer(a_position, 2, gl[f], false, 0, 0);
  gl.enableVertexAttribArray(a_position);
  gl.vertexAttrib1f(a_pointsize, 10.0);
  gl.uniform4f(u_fragcolor, 1.0, 0, 0, 1);//颜色未发生变换

  return n;
}

function Three(opts) {
 var canvas = document.getElementById(opts.dom);
 this.canvas = canvas;
 this.gl = getWebGLContext(canvas);
 if(!this.gl) {
    console.log('browser not support webgl');
    return;
 }
 this._bind();
 this._opts = Object.assign(this._opts || {}, opts);
 this.init(opts.background);
}
Three.prototype.init = function(background) {
  /**
    * 指定canvas背景色，
    * 指定一次就存储在webGL系统，直到下次调用clearColor方法重新指定背景色
    * @param 颜色介于 0.0-1.0，超过该范围，值被截断
  */
  if(background) {
    var color = background.split(',');
    this.gl.clearColor(color[0], color[1], color[2], color[3]);
  }
   /**
     * 清空canvas，
     * 本质是告诉WebGL清空颜色缓冲区
     * webGL有颜色、深度和模板缓冲区。模板缓冲区很少使用
     * COLOR_BUFFER_BIT:颜色缓冲区--gl.clearColor
     * DEPTH_BUFFER_BIT:深度缓冲区--gl.clearDepth
     * STENCIL_BUFFER_BIT:模板缓冲区--gl.clearStencil
  */
  this.gl.clear(this.gl[c]);
}
// 事件绑定
Three.prototype._bind = function() {
  var that = this;
  that.canvas.addEventListener('mousedown', function(e) {
    that.fire('mousedown', e);
  })
}
/**WebGL语言与C语言类似，为强类型，就是在声明时，必须指定变量的数据类型
   * 着色器以字符串形式嵌入到js代码中，分为顶点着色器和片段着色器
   * 着色器声明时必须包含一个main()函数，前面加void关键字表示函数无返回值，且main函数不能添加参数
   * 着色器内使用等号操作符为变量赋值
   * 顶点着色器内置gl_Position和gl_PointSize变量
   */
Three.prototype.vertexPoint ='attribute vec4 a_position;\n'
+'attribute float a_pointsize;\n'
+'void main() {\n'
//gl_Position，控制点的显示位置。必须项，否则着色器无法工作，为vec4数据类型
//vec4类型是包含4个浮点类型的矢量
//着色器内部包含vec4内置函数，可将三个浮点数转为vec4类型
//齐次坐标
+'gl_Position = a_position;\n'
//gl_PointSize，表示点的尺寸。float数据类型
+'gl_PointSize = a_pointsize;\n'
+'}';

Three.prototype.fragPoint = 'precision mediump float;\n'//?精度声明
  +'uniform vec4 u_fragcolor;\n'
  +'void main() {\n'
  //片元着色器唯一的内置变量，控制像素在屏幕上显示的最终颜色。
  //vec4数据类型，4个浮点数分别代表RGBA
  + 'gl_FragColor = u_fragcolor;\n'
  + '}';

// 一次绘制一个点
Three.prototype.drawPoint = function(ps) {
    //默认值
    var pos = ps.pos || [0,0],
    color = ps.color || [1,0,0,1],
    size = ps.size || '10.0',
    isShader = true,
    a_position,
    a_pointsize,
    u_fragcolor;
  if(!this.gl.program) {
    // 初始化着色器
    isShader = initShaders(this.gl, this.vertexPoint, this.fragPoint);
    if(!isShader) {
      console.log('browser support webgl shader');
      return;
    }
  }
  // 获取attribute变量和uniform变量存储地址
  if(!a_position) {
    a_position = this.gl.getAttribLocation(this.gl.program, 'a_position');
    if(a_position < 0) {
      console.log('invalid value');
      return;
    }
  }
  if(!a_pointsize) {
    a_pointsize = this.gl.getAttribLocation(this.gl.program, 'a_pointsize');
    if(a_pointsize < 0) {
        console.log('invalid value');
        return;
    }
  }
  if(!u_fragcolor) {
    u_fragcolor = this.gl.getUniformLocation(this.gl.program, 'u_fragcolor');
    if(!u_fragcolor) {
        console.log('invalid value');
        return;
    }
  }
  // 传输数据至attribute变量和uniform变量
  this.gl.vertexAttrib3f(a_position,pos[0],pos[1],0);
  this.gl.vertexAttrib1f(a_pointsize, size);
  this.gl.uniform4f(u_fragcolor,color[0], color[1], color[2], color[3]);

  /**
   * drawArrays(mode, first, count)，绘制操作
   * @param mode，绘制方式，常量有gl.POINTS gl.LINES gl.LINE_STRIP gl.LINE_LOOP gl.TRIANGLES gl.TRIANGLE_STRIP gl.TRIANGLE_FAN
   * @param first，从哪个顶点开始绘制，整数型，0，代表从第一个开始
   * @param count,指定绘制需要用到多少个顶点，整数型
   */
  //调用drawArrays函数，即执行着色器
  this.gl.drawArrays(this.gl[p], 0, 1);
}

// 一次绘制多个点
Three.prototype.multiPoints = function(data) {
   if(!data || !data.ps) {
     return;
   }
   var isShader = true,
       n = 0;
   if(!this.gl.program) {
     if(!(isShader = initShaders(this.gl, this.vertexPoint, this.fragPoint))) {
       console.log('Failed to create shaders');
       return;
     }
   }  
  //  设置绘制点位置
   if((n = initVertex(this.gl, data.ps)) < 0) {
     console.log('Failed to set points in buffer');
     return;
   }
   this.init();
   this.gl.drawArrays(this.gl[p], 0, n);
}
// 事件监听器
Three.prototype.on = function(type, listener) {
  if(!this.canvas[type]) {
    this.canvas[type] = [];
  }
  if(findIndex(this.canvas[type], listener) < 0 && typeof listener === 'function') {
    this.canvas[type].push(listener);
  }
}
// 事件通知者
Three.prototype.fire = function(type, value) {
  if(!this.canvas[type]) {
    return;
  }
  var i = 0,
      arr = this.canvas[type],
      lens = arr.length;
  for(; i < lens; i++) {
    arr[i].call(this.canvas, value);
  }
}