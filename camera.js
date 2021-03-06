
/** @constructor */
function Camera()
{
	var _ortho = true;
	var _pos = [0,0,0];
	var _look = [0,0,-1];
	var _up = [0,1,0];
	var _nearPlane = -1;
	var _farPlane = 1;
	var _heightOrFov = 2;
	var _aspectRatio = 1;
	var _needCalcProj = false, _needCalcView = false;
	var id = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
	var _projection = new Float32Array(id);
	var _view = new Float32Array(id);
	var _viewProj = new Float32Array(id);
	var _invViewProj = new Float32Array(id);

	function UpdateMatrices()
	{
		if(_needCalcView)
		{
			var at = vector.normalize(vector.sub(_pos,_look));

			_at = at;
			var rg = vector.normalize(vector.cross3(_up,at));
			var up = vector.normalize(vector.cross3(at,rg));
			_upC = up;
			_rg = rg;
			_view[0] = rg[0];
			_view[1] = up[0];
			_view[2] = at[0];
			_view[3] = 0.;
			_view[4] = rg[1];
			_view[5] = up[1];
			_view[6] = at[1];
			_view[7] = 0.;
			_view[8] = rg[2];
			_view[9] = up[2];
			_view[10] = at[2];
			_view[11] = 0.;

			_view[12] = -vector.dot(rg, _pos);
			_view[13] = -vector.dot(up, _pos);
			_view[14] = -vector.dot(at, _pos);
			_view[15] = 1.;
		}
		if(_needCalcProj)
		{
			var t = 2. / _heightOrFov;
			var r = t / _aspectRatio;
			var d = (_farPlane - _nearPlane);
			var z, tz;
			if(_ortho)
			{
				z = 2. / d;
				tz = (_farPlane + _nearPlane) / d;
				_projection[11] = 0;
				_projection[15] = 1;
			} else
			{
				//r *= m_nearPlane;
				//t *= m_nearPlane;
				z = (_farPlane + _nearPlane) / d;
				tz = (2 * _farPlane * _nearPlane) / d;
				_projection[11] = -1;
				_projection[15] = 0;
			}
			_projection[0] = r;
			_projection[5] = t;
			_projection[10] = -z;
			_projection[14] = -tz;
		}
		if(_needCalcProj || _needCalcView)
		{
			matrix.multiply(_view,_projection,_viewProj);
			matrix.inverse(_viewProj,_invViewProj)
		}
		_needCalcProj = false;
		_needCalcView = false;
	}
	
	this.__defineGetter__('projection', function() { UpdateMatrices(); return _projection;});
	this.__defineGetter__('view', function() { UpdateMatrices(); return _view; });
	this.__defineGetter__('viewProj', function() { UpdateMatrices(); return _viewProj; });
	this.__defineGetter__('invViewProj', function() { UpdateMatrices(); return _invViewProj; });
	function setOrtho(v)
	{ 
		_needCalcProj |= _ortho != v;  
		_ortho = v; 
	}
	this.__defineGetter__('ortho', function() { return _ortho; });
	this.__defineSetter__('ortho', setOrtho );
	this.__defineGetter__('persp', function() { return !_ortho; });
	this.__defineSetter__('persp', function(v) { setOrtho(!v); });
	function floatDiff(a,b) { var v = b-a; return (v>=1e-3) || (v<=-1e-3);}
	this.__defineGetter__('height', function() { return _heightOrFov; });
	function setHeight(v)
	{
		_needCalcProj|=floatDiff(_heightOrFov,v);  
		_heightOrFov=v; 
	}
	this.__defineSetter__('height', setHeight );

	this.__defineGetter__('fovRad', function() { return Math.atan(_heightOrFov)*2;; });
	this.__defineSetter__('fovRad', function(v) { setHeight(Math.tan(v/2)); });
	this.__defineGetter__('fovDeg', function() { return Math.atan(_heightOrFov)*360/Math.PI; });
	this.__defineSetter__('fovDeg', function(v) { setHeight(Math.tan(v*Math.PI/360)); });

	this.__defineGetter__('nearPlane', function() { return _nearPlane; });
	this.__defineSetter__('nearPlane', function(v) { _needCalcProj |= floatDiff(_nearPlane,v);  _nearPlane=v;  });
	this.__defineGetter__('farPlane', function() { return _farPlane; });
	this.__defineSetter__('farPlane', function(v) { _needCalcProj |= floatDiff(_farPlane,v);  _farPlane=v;  });

	this.__defineGetter__('aspectRatio', function() { return _aspectRatio; });
	this.__defineSetter__('aspectRatio', function(v) { _needCalcProj |= floatDiff(_aspectRatio,v);  _aspectRatio=v;  });
	this.setAspectRatio = function(w,h) { this.aspectRatio = w/h; }
	
	this.__defineGetter__('pos', function() { return _pos; });
	this.__defineSetter__('pos', function(v) 
	{ 
		if(!Array.isArray(v)) throw "Invalid value";
		if(v.length!=3) throw "Invalid value";
		_needCalcView|=
			floatDiff(_pos[0],v[0]) || 
			floatDiff(_pos[1],v[1]) || 
			floatDiff(_pos[2],v[2]); 
		_pos = v;
	});
	this.__defineGetter__('look', function() { return _look; });
	this.__defineSetter__('look', function(v) 
	{ 
		if(!Array.isArray(v)) throw "Invalid value";
		if(v.length!=3) throw "Invalid value";
		_needCalcView|=
			floatDiff(_look[0],v[0]) || 
			floatDiff(_look[1],v[1]) || 
			floatDiff(_look[2],v[2]); 
		_look= v;
	});
	this.__defineGetter__('up', function() { return _up; });
	this.__defineSetter__('up', function(v) 
	{ 
		if(!Array.isArray(v)) throw "Invalid value";
		if(v.length!=3) throw "Invalid value";
		_needCalcView|=
			floatDiff(_up[0],v[0]) || 
			floatDiff(_up[1],v[1]) || 
			floatDiff(_up[2],v[2]); 
		_up= v;
	});
	
}

function Transform(mat,vect)
{
	var ris= [0,0,0,0];
	for(var i=0;i<4;i++)
		for(var j=0;j<4;j++)
		{
			ris[j] += mat[i*4+j] * vect[i];
		}	
	return ris;
}

Camera.prototype.get3D = function(px,py,pz)
{
	if(Array.isArray(px)) px[3]=1; else px=[px,py,pz,1];
	var ris= Transform(this.invViewProj,px)
	for(var i=0;i<3;i++) ris[i] /= ris[3];
	ris.length = 3;
	return ris;
}

Camera.prototype.get2D = function(px,py,pz)
{
	if(Array.isArray(px)) px[3]=1; else px=[px,py,pz,1];
	var ris= Transform(this.viewProj,px)
	for(var i=0;i<3;i++) ris[i] /= ris[3];
	ris.length = 3;
	return ris;
}




