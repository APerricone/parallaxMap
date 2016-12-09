//#extension GL_EXT_frag_depth : enable
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D sDepthTxt;
uniform sampler2D sNormalTxt;


uniform mat4 uInvMatrix;

uniform vec4 uPlane0; //TODO: split in uPlane0 and uPlane1
uniform vec4 vPlane0; //TODO: split in vPlane0 and vPlane1
uniform vec4 uPlane1; //TODO: split in uPlane0 and uPlane1
uniform vec4 vPlane1; //TODO: split in vPlane0 and vPlane1

uniform vec4 plane0;
uniform vec4 plane1;

uniform vec2 uScreenSize;

//varying vec3 txt1;
//varying vec3 txt0;

vec3 linePlane(vec3 a,vec3 b,vec4 plane)
{
	// dot(vec4(P,-1),plane) = 0
	// P = a + t * (b-a)
	// found plane . (a+t*(b-a),-1) = 0
	// plane . (a,-1) + plane . (t*(b-a),0) = 0
	// plane . (a,-1) + t * plane . ((b-a),0) = 0
	// t = - plane . (a,-1) / plane . (b-a,0) 
	vec3 dir = b-a;
	float t = -dot(plane,vec4(a,-1.0)) / dot(plane,vec4(dir,0.0));
	return mix(a,b,t);
}

float GetCollision(float v0,float v1,float u0,float u1)
{
	// v0 + (v1-v0)t = u0 + (u1-u0)t
	// (v1-v0-u1+u0)*t = u0-v0
	return (u0-v0)/(v1-v0-u1+u0);
}
#define EPS 1e-10
#define N_STEP 16.0
#define STEP (1.0/N_STEP)
void main() 
{
	vec2 screenPos = (gl_FragCoord.xy/uScreenSize)*2.0-vec2(1.0);
	vec4 posA = uInvMatrix * vec4( screenPos,0,1 ); 
	vec4 posB = uInvMatrix * vec4( screenPos,1,1 ); 
	posA/=posA.w;
	posB/=posB.w;
	vec3 pos0 = linePlane(posA.xyz,posB.xyz,plane0);
	vec3 pos1 = linePlane(posA.xyz,posB.xyz,plane1);
	vec3 txt0 = vec3(dot(uPlane0,vec4(pos0,1)),dot(vPlane0,vec4(pos0,1)),pos0.z);
	vec3 txt1 = vec3(dot(uPlane1,vec4(pos1,1)),dot(vPlane1,vec4(pos1,1)),pos1.z);
	
	
	vec3 result = vec3(-0.5);
	float t,nt;
	float h0, h1; 
	vec3 uv0,uv1;
	t=nt=1.0;
	uv0=uv1=txt1;
	h0=h1=texture2D(sDepthTxt,txt1.xy).x; 	
	for(int i=0;i<int(N_STEP);i++)
	{
		t=nt;
		uv1 = uv0;
		h1=h0;
		nt = t- STEP;
		uv0 = mix(txt0,txt1,nt);
		h0 = texture2D(sDepthTxt,uv0.xy).x; 
		float r = GetCollision(h0,h1,nt,t);
		if( r>=0.0-EPS && r<=1.0+EPS)
		{
			result = mix(uv0,uv1,r);
			//gl_FragDepthEXT = result.z;
			//if(result.x>=0.0 && result.y>=0.0 && result.x<=1.0 && result.y<=1.0 )
			if(all(greaterThanEqual(result.xy,vec2(0.0))) && all(lessThanEqual(result.xy,vec2(1.0))))
				break;
			else
				result = vec3(1.5);
		}
	}
	
	if(all(greaterThanEqual(result.xy,vec2(0.0))) && all(lessThanEqual(result.xy,vec2(1.0))))
	{
		vec3 n = texture2D(sNormalTxt,result.xy).xyz * vec3(2.0) - vec3(1.0);
		float l = clamp(dot(n,vec3(0.4,-0.8,0.3)),0.0,1.0);
		l = l * 0.8 + 0.2;
		gl_FragColor = vec4(l,l,l,1);
		//gl_FragColor = texture2D(sNormalTxt,result.xy); 
	}
	else
		discard;
		//gl_FragColor = vec4(result,1); 
	//gl_FragColor = vec4(h0,h0,h0,1.0);
	//gl_FragColor = vec4(txt1.xy,0,1.0);
}

