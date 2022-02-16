class Texture {
  constructor(textureTarget, fileName) {
    this._textureTarget = textureTarget;
    this._fileName = fileName;
    this._textureObj = null;


  }

  onLoad(image) {
    this._textureObj = gl.createTexture();
    
    gl.bindTexture( gl.TEXTURE_2D, this._textureObj );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.texParameterf(this._textureTarget, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameterf(this._textureTarget, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameterf(this._textureTarget, gl.TEXTURE_WRAP_S,     gl.REPEAT);
    gl.texParameterf(this._textureTarget, gl.TEXTURE_WRAP_T,     gl.REPEAT);
    
    gl.bindTexture(this._textureTarget, null);
  }

  load() {
    var image = new Image();
    const _ = this;
    image.onload = function() { 
      _.onLoad(this) 
    }
    //image.src = "SA2011_black.gif"
    image.src = "bricks.jpg";

    //var image = document.getElementById(this._fileName);
    //this.onLoad(image);

    return true;
  }

  bind(textureUnit) {
    gl.activeTexture( textureUnit );
    gl.bindTexture( this._textureTarget, this._textureObj );
  }
}