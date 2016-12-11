vector = {};
vector.add = function(a,b,r)
{
	if(r==undefined)
	{
		r = []; 
		r.length=a.length;
	}
	for(var i=0;i<r.length;i++) r[i] = a[i] + b[i];
	return r;
}

vector.sub = function(a,b,r)
{
	if(r==undefined)
	{
		r = []; 
		r.length=a.length;
	}
	for(var i=0;i<r.length;i++) r[i] = a[i] - b[i];
	return r;
}

vector.cross2 = function(a) { return [a[1],-a[0]];}
vector.cross3 = function(a,b) { return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
vector.dot = function(a,b) 
{ 
	var r = 0;
	for(var i=0;i<a.length;i++) r+= a[i] * b[i];
	return r;
}

vector.normalize = function(a,r) 
{ 
	var l = Math.sqrt(vector.dot(a,a)); 
	if(r==undefined)
	{
		r = []; 
		r.length=a.length;
	}
	for(var i=0;i<a.length;i++) r[i] = a[i] / l;
	return r;
}
