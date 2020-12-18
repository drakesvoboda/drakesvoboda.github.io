import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';
import Clock from '../clock';
import { debounce } from '../throttle';

const FRAME_RATE = 20;

function loadImage(url, callback) {
  var image = new Image();
  image.src = url;
  image.onload = callback;
  return image;
}

function loadImages(urls, callback) {
  var images = [];
  var imagesToLoad = urls.length;

  // Called each time an image finished loading.
  var onImageLoad = function () {
    --imagesToLoad;
    // If all the images are loaded call the callback.
    if (imagesToLoad === 0) {
      callback(images);
    }
  };

  for (var ii = 0; ii < imagesToLoad; ++ii) {
    var image = loadImage(urls[ii], onImageLoad);
    images.push(image);
  }
}

function Uniform(name, suffix, program, gl) {
  this.name = name;
  this.suffix = suffix;
  this.gl = gl;
  this.program = program;
  this.location = gl.getUniformLocation(program, name);
}

Uniform.prototype.set = function (...values) {
  let method = 'uniform' + this.suffix;
  let args = [this.location].concat(values);
  this.gl[method].apply(this.gl, args);
};

function Rect(gl) {
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, Rect.verts, gl.STATIC_DRAW);
}

Rect.prototype.render = function (gl) {
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

function clamp(number, lower, upper) {
  if (number === number) {
    if (upper !== undefined) {
      number = number <= upper ? number : upper;
    }
    if (lower !== undefined) {
      number = number >= lower ? number : lower;
    }
  }
  return number;
}

var Fake3d = (function ($) {
  class Fake3d {
    constructor(container) {

      Rect.verts = new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        1, 1,
      ]);

      this.container = container;
      this.canvas = document.createElement('canvas');
      this.container.appendChild(this.canvas);
      this.gl = this.canvas.getContext('webgl');
      this.ratio = window.devicePixelRatio;
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
      this.mouseX = 0;
      this.mouseY = 0;

      this.mouseTargetX = 0;
      this.mouseTargetY = 0;

      this.imageOriginal = this.container.getAttribute('data-imageOriginal');
      this.imageDepth = this.container.getAttribute('data-imageDepth');
      this.vth = this.container.getAttribute('data-verticalThreshold');
      this.hth = this.container.getAttribute('data-horizontalThreshold');

      this.imageURLs = [
        this.imageOriginal,
        this.imageDepth
      ];

      this.textures = [];

      this.startTime = new Date().getTime(); // Get start time for animating

      this.createScene();
      this.addTexture();
      this.mouseMove();
    }

    addShader(source, type) {
      let shader = this.gl.createShader(type);
      this.gl.shaderSource(shader, source);
      this.gl.compileShader(shader);
      let isCompiled = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
      if (!isCompiled) {
        throw new Error('Shader compile error: ' + this.gl.getShaderInfoLog(shader));
      }
      this.gl.attachShader(this.program, shader);
    }

    resizeHandler() {
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
      this.width = this.container.offsetWidth;
      this.height = this.container.offsetHeight;

      this.canvas.width = this.width * this.ratio;
      this.canvas.height = this.height * this.ratio;
      this.canvas.style.width = this.width + 'px';
      this.canvas.style.height = this.height + 'px';
      let a1, a2;
      if (this.height / this.width < this.imageAspect) {
        a1 = 1;
        a2 = (this.height / this.width) / this.imageAspect;
      } else {
        a1 = (this.width / this.height) * this.imageAspect;
        a2 = 1;
      }
      this.uResolution.set(this.width, this.height, a1, a2);
      this.uRatio.set(1 / this.ratio);
      this.uThreshold.set(this.hth, this.vth);
      this.gl.viewport(0, 0, this.width * this.ratio, this.height * this.ratio);
    }

    resize() {
      this.resizeHandler();
      window.addEventListener('resize', debounce(this.resizeHandler.bind(this), 750));
    }

    createScene() {
      this.gl.enable(this.gl.BLEND);
      this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);

      this.program = this.gl.createProgram();

      this.addShader(vertex, this.gl.VERTEX_SHADER);
      this.addShader(fragment, this.gl.FRAGMENT_SHADER);

      this.gl.linkProgram(this.program);
      this.gl.useProgram(this.program);


      this.uResolution = new Uniform('resolution', '4f', this.program, this.gl);
      this.uMouse = new Uniform('mouse', '2f', this.program, this.gl);
      this.uRatio = new Uniform('pixelRatio', '1f', this.program, this.gl);
      this.uThreshold = new Uniform('threshold', '2f', this.program, this.gl);
      // create position attrib
      this.billboard = new Rect(this.gl);
      this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
      this.gl.enableVertexAttribArray(this.positionLocation);
      this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    }

    addTexture() {
      let that = this;
      let gl = that.gl;
      loadImages(this.imageURLs, that.start.bind(this));
    }

    start(images) {
      let that = this;
      let gl = that.gl;

      this.imageAspect = images[0].naturalHeight / images[0].naturalWidth;
      for (var i = 0; i < images.length; i++) {
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // Upload the image into the texture.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
        this.textures.push(texture);
      }

      // lookup the sampler locations.
      let u_image0Location = this.gl.getUniformLocation(this.program, 'image0');
      let u_image1Location = this.gl.getUniformLocation(this.program, 'image1');

      // set which texture units to render with.
      this.gl.uniform1i(u_image0Location, 0); // texture unit 0
      this.gl.uniform1i(u_image1Location, 1); // texture unit 1

      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[0]);
      this.gl.activeTexture(this.gl.TEXTURE1);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[1]);


      // start application
      this.resize();
      this.render();
    }

    mouseMove() {
      let that = this;

      function addEvent(obj, evt, fn) {
        if (obj.addEventListener) {
          obj.addEventListener(evt, fn, false);
        }
        else if (obj.attachEvent) {
          obj.attachEvent("on" + evt, fn);
        }
      }

      addEvent(document, 'mousemove', function (e) {
        let halfX = that.windowWidth / 2;
        let halfY = that.windowHeight / 2;

        that.mouseTargetX = (halfX - e.clientX) / halfX;
        that.mouseTargetY = (halfY - e.clientY) / halfY;
      });

      addEvent(document, "mouseout", function (e) {
        that.mouseTargetX = 0;
        that.mouseTargetY = 0;
      });
    }

    render() {
      this.clock = new Clock(function () {
        let now = new Date().getTime();
        let currentTime = (now - this.startTime) / 1000;

        // inertia
        this.mouseX += (this.mouseTargetX - this.mouseX) * 0.05;
        this.mouseY += (this.mouseTargetY - this.mouseY) * 0.05;

        this.uMouse.set(this.mouseX, this.mouseY);

        // render
        this.gl.clearColor(0, 0, 0, 0);
        this.billboard.render(this.gl);
      }.bind(this), FRAME_RATE);

      this.clock.start();
    }

    pause() {
      this.clock.stop();
    }

    play() {
      this.clock.start();
    }

    destroy() {
      this.pause();
      this.clock = null;
      this.gl = null;
      this.canvas = null;
      this.program = null;
      this.uResolution = null;
      this.uMouse = null;
      this.uRatio = null;
      this.uThreshold = null;
    }
  }

  Fake3d.makeJQueryPlugin = function () {
    if (!$) return;

    (function ($) {
      $.event.special.destroyed = {
        remove: function (o) {
          if (o.handler) {
            o.handler()
          }
        }
      }
    })(jQuery)

    $.fn.fake3d = function (options) {
      $(this).each(function () {
        this.fake3d = new Fake3d($(this).get(0));

        var that = this;

        $(this).on('destroyed', function () {
          that.fake3d.destroy();
          that.fake3d = null;
        })
      });

      return $(this);
    };
  };

  // try making plugin
  Fake3d.makeJQueryPlugin();

  return Fake3d;
}(jQuery));

export default Fake3d;
