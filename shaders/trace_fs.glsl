precision mediump float;

// Perlin noise code
vec3 mod289(vec3 x){
	return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 mod289(vec4 x){
	return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 permute(vec4 x){
	return mod289(((x*34.0)+1.0)*x);
}
vec4 taylorInvSqrt(vec4 r){
	return 1.79284291400159 - 0.85373472095314 * r;
}
vec3 fade(vec3 t) {
	return t*t*t*(t*(t*6.0-15.0)+10.0);
}
// Classic Perlin noise, periodic variant
float pnoise(vec3 P, vec3 rep)
{
	vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
	vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
	Pi0 = mod289(Pi0);
	Pi1 = mod289(Pi1);
	vec3 Pf0 = fract(P); // Fractional part for interpolation
	vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
	vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
	vec4 iy = vec4(Pi0.yy, Pi1.yy);
	vec4 iz0 = Pi0.zzzz;
	vec4 iz1 = Pi1.zzzz;

	vec4 ixy = permute(permute(ix) + iy);
	vec4 ixy0 = permute(ixy + iz0);
	vec4 ixy1 = permute(ixy + iz1);

	vec4 gx0 = ixy0 * (1.0 / 7.0);
	vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
	gx0 = fract(gx0);
	vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
	vec4 sz0 = step(gz0, vec4(0.0));
	gx0 -= sz0 * (step(0.0, gx0) - 0.5);
	gy0 -= sz0 * (step(0.0, gy0) - 0.5);

	vec4 gx1 = ixy1 * (1.0 / 7.0);
	vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
	gx1 = fract(gx1);
	vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
	vec4 sz1 = step(gz1, vec4(0.0));
	gx1 -= sz1 * (step(0.0, gx1) - 0.5);
	gy1 -= sz1 * (step(0.0, gy1) - 0.5);

	vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
	vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
	vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
	vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
	vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
	vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
	vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
	vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

	vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
	g000 *= norm0.x;
	g010 *= norm0.y;
	g100 *= norm0.z;
	g110 *= norm0.w;
	vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111,	g111)));
	g001 *= norm1.x;
	g011 *= norm1.y;
	g101 *= norm1.z;
	g111 *= norm1.w;

	float n000 = dot(g000, Pf0);
	float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
	float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
	float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
	float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
	float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
	float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
	float n111 = dot(g111, Pf1);

	vec3 fade_xyz = fade(Pf0);
	vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
	vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
	float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
	return 2.2 * n_xyz;
}

//data structures
struct Camera{
	vec3 pos,rotv;
	float fov_factor;//tan( radians( fov /2.0) ) ;
	vec2 res;
};
struct Ray{
	vec3 dir;
	vec3 origin;
};
struct Sphere{
	vec3 pos;
	float rad;
	int mt;
};
struct Box{
	vec3 min,max;
	int mt;
};

// Water plane equation:
// H(P) = Ax+By+Cz+D = n·P + D = 0
struct WaterPlane{
	vec3 norm;
	float D;
	int mt;
};

/*struct Material{ //BRDF or something
	//here we use ka,kd,ks for test
	vec3 ka,kd,ks;
	float ns;
};*/
struct Hit{
	vec3 pos;
	vec3 norm;
	vec2 uv;//texture coord
	int mt;//point to
};
const int LIGHT_AREA = 1;
struct Light{
	vec3 posOrDir;//positional light use pos while directional light use direction
	vec3 size;//radius for sphere light
	bool isDirectional;
	int type;//sphere light or area light
	float Is;//specular intensity
	float Id;//diffuse intensity
};

uniform Camera camera;
uniform mat3 trans;
uniform float sampleCount;
uniform float mtlNum;
uniform sampler2D pTex;//previous render result
uniform sampler2D mtlTex;
// Wall texture and normal map
uniform sampler2D wallTex;
uniform sampler2D wallNorm;
// Water normal map texture
uniform sampler2D waterNorm0;
uniform sampler2D waterNorm1;

uniform highp float globTime;
//const setting
const int BOUNCE = 3;//max bounce time
const float EPSILON = 0.001;//tolerance
const float INFINITY = 10000.;
const int X = 0, Y = 1, Z = 2;
const int SAMPLE_NUM = 16;
float KA = 0., KD = 1./mtlNum, KS = 2./mtlNum, MAP = 3./mtlNum, ATTR = 1.;
float msample = sqrt(float(SAMPLE_NUM));
float s;//seed for random generator

//temporal vars should be uniforms
const float sqLen = 10.;
const WaterPlane water = WaterPlane(vec3(0,1,0), -8.0, 4);

const int LIGHT_NUM = 2;
Light lights[LIGHT_NUM];

const Box room = Box(vec3(-10, -10, -20), vec3(10, 10, 20), 1);

const int SPHERE_NUM = 5;
Sphere sphere[SPHERE_NUM];

//some uti
mat3 getRotMat(float degree, int choice){
	float rad = radians(degree);
	if(choice == X)
		return 	mat3(1, 0, 0, 0, cos(rad), -sin(rad), 0, sin(rad), cos(rad));
	else if ( choice == Y )
		return mat3(cos(rad), 0, sin(rad), 0, 1, 0, -sin(rad), 0, cos(rad));
	else return mat3(1, 0, 0, 0, 1, 0, 0, 0, 1);
}

//random function from [Antialiasing by Justaway]
void srand(vec2 p){
	s =sin(dot(p,vec2(423.62431,321.54323)));
}
float rand(){
	s=fract(s*32322.65432+0.12333);
	return abs(fract(s));
}

vec2 randOffset(float sampleCount){
	sampleCount = mod(sampleCount,float(SAMPLE_NUM));
	vec2 offset = vec2(floor(sampleCount/msample),mod(sampleCount,msample));
	offset += vec2(rand(), rand());
	offset /= msample;
	return offset;
}

bool intersectBox(Ray eyeRay,Box box, out float dist){//ray box intersect
	vec3 tMin = (box.min - eyeRay.origin) / eyeRay.dir;
	vec3 tMax = (box.max - eyeRay.origin) / eyeRay.dir;
	vec3 t1 = min(tMin, tMax);
	vec3 t2 = max(tMin, tMax);
	float tNear = max(max(t1.x, t1.y), t1.z);
	float tFar = min(min(t2.x, t2.y), t2.z);
	dist = tFar;
	if(tNear <= tFar && tFar >= 0.)
		return true;
	return false;
}

vec3 normalForBox(vec3 hit, Box box){
	if(hit.x < box.min.x + EPSILON ) return vec3(-1.0, 0.0, 0.0);//box left
	else if(hit.x > box.max.x -  EPSILON) return vec3(1.0, 0.0, 0.0);//box right
	else if(hit.y < box.min.y +  EPSILON ) return vec3(0.0, -1.0, 0.0);//box bottom
	else if(hit.y > box.max.y - EPSILON) return vec3(0.0, 1.0, 0.0);//box top
	else if(hit.z < box.min.z + EPSILON ) return vec3(0.0, 0.0, -1.0);//box front
	else return vec3(0.0, 0.0, 1.0);//box back
	return vec3(0.0, 0.0, 1.0);
}

bool intersectWaterPlane(WaterPlane plane, Ray eyeRay, out float dist){
	// ray water intersect
	// P(t) = Ro + t * Rd
	// H(P) = n·P + D = 0
	// n·(Ro + t * Rd) + D = 0
	// t = -(D + n·Ro) / n·Rd
	if (dot(plane.norm, eyeRay.dir) > -0.00000001)
		return false;

	vec3 n = normalize(plane.norm);
	float t = -(plane.D + dot(n, eyeRay.origin)) / dot(n, eyeRay.dir);
	dist = length(eyeRay.dir * t);
	vec3 position = eyeRay.dir * t + eyeRay.origin;

	// add displacement to the dist
	dist += 2.0 * pnoise( 0.05 * position + vec3( 2.0 * globTime ), vec3( 100.0 ) );
	return true;
}

// Map the hit position to texture coord
vec2 texCordWater(vec3 pos){
	vec2 uv;
	uv = 0.5 * vec2((pos.x + sqLen) / sqLen, (pos.z + sqLen) / sqLen);
	return uv;
}

// Get the water norm from the two normal texture
vec3 getWaterNorm(vec3 pos){
	vec2 uv = texCordWater(pos);
	vec2 uv0 = vec2(mod(uv.x + 0.3 * globTime, 1.0), mod(uv.y + 0.1 * globTime, 1.0));
	vec2 uv1 = vec2(mod(uv.x + 0.2 * globTime, 1.0), mod(uv.y - 0.2 * globTime, 1.0));
	return normalize((texture2D(waterNorm0, uv0) + texture2D(waterNorm1, uv1)).xyz);
}

bool intersectSphere(Sphere sphere, Ray eyeRay, out float dist) {
	vec3 c = sphere.pos - eyeRay.origin;
	float b = dot(eyeRay.dir, c);
	if(b < 0.0)
	return false;
	float d = dot(c, c) - b*b;
	if(d < 0.0 || d > sphere.rad * sphere.rad)
	return false;
	dist = b- sqrt(sphere.rad * sphere.rad- d);
	return true;
}

bool hitSomething(Ray eyeRay, out Hit hit, bool once){
	float mDist = INFINITY, dist = INFINITY;
	vec3 objPos;
	//hit spheres
	for(int i = 0; i < SPHERE_NUM; i++){
		intersectSphere(sphere[i], eyeRay, dist);
		if(dist < mDist){
			if(once) //shadow ray
				return true;
			mDist = dist;
			objPos = sphere[i].pos;
			hit.mt = sphere[i].mt;
		}
	}

	if(mDist == INFINITY)//hit nothing
		return false;
	hit.pos = eyeRay.origin + mDist * eyeRay.dir;
	hit.norm = normalize(hit.pos - objPos);
	return true;
}

float ambient(float coe){
	return coe;
}
float diffuse(vec3 L, vec3 N, float Id){
	return max(dot(L, N), 0.) * Id;
}
float specular(vec3 R, vec3 V, float Is, float Ns){
	return pow(max(dot(R, V), 0.), Ns) * Is;
}

//simple map test for wall!!!
vec2 mapfoo(vec3 pos){
	pos.x = 0.0;//no use
	pos.y /= room.max.y - room.min.y;
	pos.z /= room.max.z - room.min.z;
	pos += 0.5;
	pos.y = 1.0 - pos.y;
	return pos.yz;
}

vec3 lightAt(Hit hit, vec3 N, vec3 V)//calculate light at a object point
{
	vec3 c = vec3(0);
	vec3 ka = vec3(0), kd = vec3(0), ks = vec3(0), attr = vec3(0, 1, 0), map = vec3(0);
	float ns; //specular power
	int illum = 0;
	float mtlCoord = float(hit.mt) / mtlNum;//change material index to uv coord
	attr = texture2D(mtlTex, vec2(ATTR, mtlCoord)).xyz;//x->illum y->ns z->texture
	illum = int(attr.x);

	//map
	map = texture2D(mtlTex, vec2(MAP, mtlCoord)).xyz;

	ka = texture2D(mtlTex, vec2(KA, mtlCoord)).xyz;
	kd = texture2D(mtlTex, vec2(KD, mtlCoord)).xyz;

	if(map.y > 0.){//enable normal map
		N = texture2D(wallNorm, mapfoo(hit.pos)).rgb;
	}
	if(map.x > 0.){ // enable texture map
		ka = kd = texture2D(wallTex, mapfoo(hit.pos)).rgb;
		//ka = texture2D(tex1, mapfoo(hit.pos)).rgb; //here i just use one texture
		//ka = kd = vec3(0);
	}
	else if(illum == 0){
	}
	else if(illum == 3){ //specular colors on
		ks = texture2D(mtlTex, vec2(KS, mtlCoord)).xyz;
		ns = attr.y;
	}

	// Add ambient light
	c += ambient(0.2) * ka;

	Hit sHit;
	vec3 L, R, offset;
	Ray shadowRay;
	for(int i = 0; i < LIGHT_NUM; i++){
		L = normalize(lights[i].posOrDir - hit.pos);//use point light
		R = reflect(-L, N);
		c += diffuse(L, N, lights[i].Id ) * kd;
		c += specular(R, V, lights[i].Is, ns) *  ks;

		//shadow
		offset = vec3(randOffset(sampleCount), 0);
		shadowRay = Ray(normalize(lights[i].posOrDir + offset*lights[i].size - hit.pos), hit.pos);
		if(hitSomething(shadowRay, sHit, true))
			return c;
	}
	return c;
}

int dummySetMtl0(Hit hit){//set material for bounding box
	if(abs(hit.norm.x) == 1.0){
		return 3;
	}
	if(abs(hit.norm.y) == 1.0){
		return 1;
	}
	return 2;
}
void Initialization(){
	// Initialize spheres
	sphere[0] = Sphere(vec3(0, 0, -15), 1.,0);
	sphere[1] = Sphere(vec3(1, 1, 1), 1.,0);
	sphere[2] = Sphere(vec3(3, -2, -2), 1.,0);
	sphere[3] = Sphere(vec3(-5, 0, -2), 1.,0);
	sphere[4] = Sphere(vec3(5, -2, -2), 1.,0);

	// Initialize lights
	lights[0] = Light(vec3(-10, 9, -1), vec3(0, 2, 1), false, LIGHT_AREA, 1., 1.);
	lights[1] = Light(vec3(10, 10, 10), vec3(1, -2, 0), false, LIGHT_AREA, 1., 1.);
}

vec3 intersect(Ray eyeRay){//main ray bounce function
	vec3 color = vec3(0), ncolor = vec3(0);//accumulated color and ncolor for current object
	Hit hit;
	bool stop = false;
	float dist;

	for(int i = 0; i < BOUNCE; i++){
		if(hitSomething(eyeRay, hit, false)){//hit anything inside box
			ncolor = lightAt(hit, hit.norm, eyeRay.dir);//calculate color
		}
		else{//hit bounding box
			if(intersectBox(eyeRay, room, dist)){//intersect room return the distance between ray origin and hit spot
				hit.pos = eyeRay.origin + dist * eyeRay.dir;
				hit.norm = normalForBox(hit.pos, room);
				hit.mt = dummySetMtl0(hit);//different merterial for different face
				ncolor = lightAt(hit, -hit.norm, eyeRay.dir);//calculate inner color
			}

			float mDist;
			// Hit water plane
			if (intersectWaterPlane(water, eyeRay, mDist) && dist > mDist){
				hit.pos = eyeRay.origin + mDist * eyeRay.dir;
				hit.norm = getWaterNorm(hit.pos);
				hit.mt = water.mt;
				// Mix color with bounding box
				// ncolor = lightAt(hit, hit.norm, eyeRay.dir);
				ncolor = 0.3 * ncolor + 0.7 * lightAt(hit, -hit.norm, eyeRay.dir);
			}else{
			}
				stop = true;
		}

		color = i==0 ? ncolor : color * 0.5 +  ncolor * 0.5;
		//fire new ray
		eyeRay.origin = hit.pos;
		eyeRay.dir = reflect(eyeRay.dir, hit.norm);
		if(stop) break;
	}
	return color;
}

void main(void) {
	vec3 color = vec3(0) , pColor;//color for current frame and previous frame
	vec2 offset;//random offset to do Antialiasing
	vec2 seed = gl_FragCoord.xy/camera.res+globTime;//2 dimentional seed
	//init operation
	srand(seed);//feed random generator

	// Initialize spheres, lights and other objects
	Initialization();
	//fire random ray
	offset = randOffset(sampleCount);//random offset to do Antialiasing
	Ray eyeRay = Ray(trans*vec3((gl_FragCoord.xy+offset-camera.res/2.)/camera.res.yy * camera.fov_factor,1),camera.pos);//fire eye ray
	eyeRay.dir = normalize(eyeRay.dir);

	color = intersect(eyeRay);//calculate current frame pixel color
	pColor = texture2D(pTex, gl_FragCoord.xy/camera.res).rgb;//pixel color from pevious frame
	// gl_FragColor = vec4(color, 1.);
	gl_FragColor = vec4(mix(pColor,color,1./sampleCount), 1);//mix 2 color to achieve Antialiasing
	//gl_FragColor = vec4(texture2D(mtlTex, vec2(1. / 3., 3. /mtlNum)).rgb, 1);
}