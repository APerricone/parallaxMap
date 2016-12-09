function v_add(a,b,r)
{
	if(r==undefined)
	{
		r = []; 
		r.length=a.length;
	}
	for(var i=0;i<r.length;i++) r[i] = a[i] + b[i];
	return r;
}

function v_sub(a,b,r)
{
	if(r==undefined)
	{
		r = []; 
		r.length=a.length;
	}
	for(var i=0;i<r.length;i++) r[i] = a[i] - b[i];
	return r;
}

function v_cross2(a) { return [a[1],-a[0]];}
function v_cross3(a,b) { return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function v_dot(a,b) 
{ 
	var r = 0;
	for(var i=0;i<a.length;i++) r+= a[i] * b[i];
	return r;
}

function v_normalize(a,r) 
{ 
	var l = Math.sqrt(v_dot(a,a)); 
	if(r==undefined)
	{
		r = []; 
		r.length=a.length;
	}
	for(var i=0;i<a.length;i++) r[i] = a[i] / l;
	return r;
}
