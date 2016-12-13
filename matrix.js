matrix = {};
var square = [0,1,4,9,16,25,36,49,64,81,100];
matrix.transpose = function(m,rr)
{
	if(rr==undefined)
	{
		rr = []; 
		rr.length=m.length;
	}
	var rows = square.indexOf(rr.length);
	if(rows==-1) throw "Invalid parameter, the parameter must be a square matrix."
    for(var r=0;r<rows;r++)
        for(var c=0;c<rows;c++)
            rr[r*rows+c]=m[c*rows+r];
    return rr;
}

matrix.inverse = function(m,rr)
{
	if(rr==undefined)
	{
		rr = []; 
		rr.length=m.length;
	}
	var rows = square.indexOf(rr.length);
	if(rows==-1) throw "Invalid parameter, the parameter must be a square matrix."
	if(rr.length!=16) throw "Not implemented, Inverse is implemente only 4x4 matrices."
	rr[ 0] =  m[ 5]*m[10]*m[15] - m[ 5]*m[11]*m[14] - m[ 9]*m[ 6]*m[15] + m[ 9]*m[ 7]*m[14] + m[13]*m[ 6]*m[11] - m[13]*m[ 7]*m[10];
	rr[ 1] = -m[ 1]*m[10]*m[15] + m[ 1]*m[11]*m[14] + m[ 9]*m[ 2]*m[15] - m[ 9]*m[ 3]*m[14] - m[13]*m[ 2]*m[11] + m[13]*m[ 3]*m[10];
	rr[ 2] =  m[ 1]*m[ 6]*m[15] - m[ 1]*m[ 7]*m[14] - m[ 5]*m[ 2]*m[15] + m[ 5]*m[ 3]*m[14] + m[13]*m[ 2]*m[ 7] - m[13]*m[ 3]*m[ 6];
	rr[ 3] = -m[ 1]*m[ 6]*m[11] + m[ 1]*m[ 7]*m[10] + m[ 5]*m[ 2]*m[11] - m[ 5]*m[ 3]*m[10] - m[ 9]*m[ 2]*m[ 7] + m[ 9]*m[ 3]*m[ 6];
	rr[ 4] = -m[ 4]*m[10]*m[15] + m[ 4]*m[11]*m[14] + m[ 8]*m[ 6]*m[15] - m[ 8]*m[ 7]*m[14] - m[12]*m[ 6]*m[11] + m[12]*m[ 7]*m[10];
	rr[ 5] =  m[ 0]*m[10]*m[15] - m[ 0]*m[11]*m[14] - m[ 8]*m[ 2]*m[15] + m[ 8]*m[ 3]*m[14] + m[12]*m[ 2]*m[11] - m[12]*m[ 3]*m[10];
	rr[ 6] = -m[ 0]*m[ 6]*m[15] + m[ 0]*m[ 7]*m[14] + m[ 4]*m[ 2]*m[15] - m[ 4]*m[ 3]*m[14] - m[12]*m[ 2]*m[ 7] + m[12]*m[ 3]*m[ 6];
	rr[ 7] =  m[ 0]*m[ 6]*m[11] - m[ 0]*m[ 7]*m[10] - m[ 4]*m[ 2]*m[11] + m[ 4]*m[ 3]*m[10] + m[ 8]*m[ 2]*m[ 7] - m[ 8]*m[ 3]*m[ 6];
	rr[ 8] =  m[ 4]*m[ 9]*m[15] - m[ 4]*m[11]*m[13] - m[ 8]*m[ 5]*m[15] + m[ 8]*m[ 7]*m[13] + m[12]*m[ 5]*m[11] - m[12]*m[ 7]*m[ 9];
	rr[ 9] = -m[ 0]*m[ 9]*m[15] + m[ 0]*m[11]*m[13] + m[ 8]*m[ 1]*m[15] - m[ 8]*m[ 3]*m[13] - m[12]*m[ 1]*m[11] + m[12]*m[ 3]*m[ 9];
	rr[10] =  m[ 0]*m[ 5]*m[15] - m[ 0]*m[ 7]*m[13] - m[ 4]*m[ 1]*m[15] + m[ 4]*m[ 3]*m[13] + m[12]*m[ 1]*m[ 7] - m[12]*m[ 3]*m[ 5];
	rr[11] = -m[ 0]*m[ 5]*m[11] + m[ 0]*m[ 7]*m[ 9] + m[ 4]*m[ 1]*m[11] - m[ 4]*m[ 3]*m[ 9] - m[ 8]*m[ 1]*m[ 7] + m[ 8]*m[ 3]*m[ 5];
	rr[12] = -m[ 4]*m[ 9]*m[14] + m[ 4]*m[10]*m[13] + m[ 8]*m[ 5]*m[14] - m[ 8]*m[ 6]*m[13] - m[12]*m[ 5]*m[10] + m[12]*m[ 6]*m[ 9];
	rr[13] =  m[ 0]*m[ 9]*m[14] - m[ 0]*m[10]*m[13] - m[ 8]*m[ 1]*m[14] + m[ 8]*m[ 2]*m[13] + m[12]*m[ 1]*m[10] - m[12]*m[ 2]*m[ 9];
	rr[14] = -m[ 0]*m[ 5]*m[14] + m[ 0]*m[ 6]*m[13] + m[ 4]*m[ 1]*m[14] - m[ 4]*m[ 2]*m[13] - m[12]*m[ 1]*m[ 6] + m[12]*m[ 2]*m[ 5];
	rr[15] =  m[ 0]*m[ 5]*m[10] - m[ 0]*m[ 6]*m[ 9] - m[ 4]*m[ 1]*m[10] + m[ 4]*m[ 2]*m[ 9] + m[ 8]*m[ 1]*m[ 6] - m[ 8]*m[ 2]*m[ 5];
	var det = m[0]*rr[0]+m[1]*rr[4]+m[2]*rr[8]+m[3]*rr[12];
	if(det!=0)
	{
		for(var i = 0; i<16; i++)
			rr[i] /= det;
	}
	return rr;
	
}

matrix.multiply = function(a,b,rr)
{
	if(rr==undefined)
	{
		rr = []; 
		rr.length=a.length;
	}
	var rows = square.indexOf(rr.length);
	if(rows==-1) throw "Invalid parameter, the parameter must be a square matrix."
	var i = 0;
	for(var j = 0; j < rows; j++)
		for(var k = 0; k < rows; k++)
		{
			rr[i] = 0;
			for(var l = 0; l < rows; l++)
			{
				rr[i] += a[l + j * rows] * b[l * rows + k];
			}
			i++;
		}
	return rr;
}

function myIsArray(v)
{
	if(typeof(v)!="object") return false;
	return (v.length!=undefined);
}

matrix.identity = function(n)
{
	var rr = [];
	if(myIsArray(n))
	{
		rr = n;
		n = square.indexOf(rr.length);
	}
	else
	{
		rr.length=n*n;
	}
	if(n<1) throw "invalid parameter";
	var i=0;
	for(var j=0;j<n;j++)
		for(var k=0;k<n;k++)
	{
		rr[i] = j==k? 1 : 0;
		i++;
	}
	return rr;
}

matrix.rotate_x = function(a,rr)
{
	if(rr==undefined)
	{
		rr = [1,0,0, 0,1,0, 0,0,1]; 
	}
	if(!myIsArray(rr))
	{
		rr = matrix.identity(rr);
	}
	var rows = square.indexOf(rr.length);
	if(rows==-1) throw "Invalid parameter, the parameter must be a square matrix."
	if(rows<3) throw "Invalid parameter, the parameter must be a square matrix."
	var sa = Math.sin(a);
	var ca = Math.cos(a);	
	rr[1*rows+1] = ca;
	rr[2*rows+2] = ca;
	rr[1*rows+2] = -sa;
	rr[2*rows+1] = sa;
	return rr;
}

matrix.rotate_y = function(a,rr)
{
	if(rr==undefined)
	{
		rr = [1,0,0, 0,1,0, 0,0,1]; 
	}
	if(!myIsArray(rr))
	{
		rr = matrix.identity(rr);
	}
	var rows = square.indexOf(rr.length);
	if(rows==-1) throw "Invalid parameter, the parameter must be a square matrix."
	if(rows<3) throw "Invalid parameter, the parameter must be a square matrix."
	var sa = Math.sin(a);
	var ca = Math.cos(a);	
	rr[0*rows+0] = ca;
	rr[2*rows+2] = ca;
	rr[0*rows+2] = -sa;
	rr[2*rows+0] = sa;
	return rr;
}

matrix.rotate_z = function(a,rr)
{
	if(rr==undefined)
	{
		rr = [1,0,0, 0,1,0, 0,0,1]; 
	}
	if(!myIsArray(rr))
	{
		rr = matrix.identity(rr);
	}
	var rows = square.indexOf(rr.length);
	if(rows==-1) throw "Invalid parameter, the parameter must be a square matrix or the size of the matrix."
	if(rows<3) throw "Invalid parameter, rotation along axe is defined only on 3 dimension or more."
	var sa = Math.sin(a);
	var ca = Math.cos(a);	
	rr[0*rows+0] = ca;
	rr[1*rows+1] = ca;
	rr[0*rows+1] = -sa;
	rr[1*rows+0] = sa;
	return rr;
}

matrix.lookAt = function(_at,_up,rr)
{
	if(!myIsArray(rr))
	{
		rr = matrix.identity(rr==undefined? 3 : rr);
	}
	var rows = square.indexOf(rr.length);
	if(rows==-1) throw "Invalid parameter, the parameter must be a square matrix or the size of the matrix."
	if(_up==undefined)
	{
		_up=[0,1,0];
	}
	
	var at = vector.normalize(_at);
	var rg = vector.normalize(vector.cross3(_up,_at));
	var up = vector.normalize(vector.cross3(at,rg));
	rr[0+0*rows] = rg[0];
	rr[1+0*rows] = up[0];
	rr[2+0*rows] = at[0];
	rr[0+1*rows] = rg[1];
	rr[1+1*rows] = up[1];
	rr[2+1*rows] = at[1];
	rr[0+2*rows] = rg[2];
	rr[1+2*rows] = up[2];
	rr[2+2*rows] = at[2];
	return rr;
}

