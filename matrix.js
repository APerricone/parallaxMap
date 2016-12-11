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
