precision mediump float;

float hash( float n )
{
    return fract(sin(n)*43758.5453);
}
float noise( in vec3 x )
{
    vec3 p = floor(x);
    vec3 f = fract(x);

    f = f*f*(3.0-2.0*f);
    float n = p.x + p.y*57.0 + 113.0*p.z;
    return mix(mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),
                   mix( hash(n+ 57.0), hash(n+ 58.0),f.x),f.y),
               mix(mix( hash(n+113.0), hash(n+114.0),f.x),
                   mix( hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);
}
//random function from http://madebyevan.com/webgl-path-tracing/webgl-path-tracing.js
float random(vec3 scale, float seed) {
	return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed); 
}
vec3 uniformlyRandomDirection(float seed) {
	float u = random(vec3(12.9898, 78.233, 151.7182), seed);
	float v = random(vec3(63.7264, 10.873, 623.6736), seed);
	float z = 1.0 - 2.0 * u;
	float r = sqrt(1.0 - z * z);
	float angle = 6.283185307179586 * v;
	return vec3(r * cos(angle), r * sin(angle), z);
}
// random vector in the unit sphere
// note: this is probably not statistically uniform, saw raising to 1/3 power somewhere but that looks wrong?
vec3 uniformlyRandomVector(float seed) {
	return uniformlyRandomDirection(seed) * sqrt(random(vec3(36.7539, 50.3658, 306.2759), seed));
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
// no use
uniform sampler2D wallNorm;
// Water normal map texture
uniform sampler2D waterNorm0;
uniform sampler2D waterNorm1;
// Pool tile texture
uniform sampler2D poolTex;

uniform highp float globTime;
//const setting
const int BOUNCE = 3;//max bounce time
const float EPSILON = 0.001;//tolerance
const float INFINITY = 10000.;
const int X = 0, Y = 1, Z = 2;
const int SAMPLE_NUM = 9;
float KA = 0., KD = 1./mtlNum, KS = 2./mtlNum, MAP = 3./mtlNum, ATTR = 1.;
float msample = sqrt(float(SAMPLE_NUM));
float s;//seed for random generator

//temporal vars should be uniforms
// Set water plane area lenght and the ratio of indices of refraction
float sqLen, eta;
WaterPlane water;

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

bool intersectWaterPlane(Ray eyeRay, WaterPlane plane, out float dist){
	// ray water intersect
	// P(t) = Ro + t * Rd
	// H(P) = n·P + D = 0
	// n·(Ro + t * Rd) + D = 0
	// t = -(D + n·Ro) / n·Rd
	vec3 n = normalize(plane.norm);
	dist = -(plane.D + dot(n, eyeRay.origin)) / dot(n, eyeRay.dir);
	if (dist < 0.) return false;
	// add displacement to the dist
	vec3 position = eyeRay.dir * dist + eyeRay.origin;
	dist += 2.0 * noise( 0.05 * position + 2.0 * globTime);
	return true;
}

// Map the hit position to texture coord
// Only works for the Y axis plane
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
	return normalize((texture2D(waterNorm0, uv0) + texture2D(waterNorm1, uv1)).xzy);
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

bool hitSphere(Ray eyeRay, out Hit hit, bool once){
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

// Only works for left and right box
vec2 mapXaxis(vec3 pos){
	pos.x = 0.0;//no use
	pos.y /= room.max.y - room.min.y;
	pos.z /= room.max.z - room.min.z;
	pos += 0.5;
	pos.y = 1.0 - pos.y;
	return pos.yz;
}

// Only works for top and bottom box
vec2 mapYaxis(vec3 pos){
	pos.x /= room.max.x - room.min.x;
	pos.z /= room.max.z - room.min.z;
	pos += 0.5;
	return pos.xz;
}

// Only works for front and back box
vec2 mapZaxis(vec3 pos){
	pos.x /= room.max.x - room.min.x;
	pos.y /= room.max.z - room.min.y;
	pos += 0.5;
	return pos.xy;
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

	//enable normal map
	// No use
	if(map.y > 0.){
		N = texture2D(wallNorm, mapXaxis(hit.pos)).zxy;
	}
	if(map.x > 0.){ // enable texture map
		ka = kd = texture2D(wallTex, mapXaxis(hit.pos)).rgb;
		//ka = texture2D(tex1, mapXaxis(hit.pos)).rgb; //here i just use one texture
		//ka = kd = vec3(0);
	}
	else if(illum == 0){
	}
	else if(illum == 3){ //specular colors on
		ks = texture2D(mtlTex, vec2(KS, mtlCoord)).xyz;
		ns = attr.y;
	}

	if (hit.mt == 1){
		// enable pool texture
		ka = kd = texture2D(poolTex, mapYaxis(hit.pos)).rgb;
	}
	// Add ambient light
	c += ambient(0.2) * ka;

	Hit sHit;
	vec3 L, R, offset;
	Ray shadowRay;
	for(int i = 0; i < LIGHT_NUM; i++){
		if (lights[i].isDirectional){
			L = normalize(-lights[i].posOrDir);
		}else{
			L = normalize(lights[i].posOrDir - hit.pos);//use point light
		}
		R = reflect(L, N);

		//shadow
		offset = vec3(randOffset(sampleCount), 0);
		vec3 lightPos = lights[i].posOrDir + uniformlyRandomVector(globTime - 53.0)*lights[i].size.x - hit.pos;
		shadowRay = Ray(normalize(lightPos), hit.pos);
		if(hitSphere(shadowRay, sHit, true))
			return c;

		c += diffuse(L, N, lights[i].Id ) * kd;
		c += specular(R, V, lights[i].Is, ns) *  ks;
	}
	return c;
}

int dummySetMtl0(Hit hit){//set material for bounding box
	if(abs(hit.norm.x) == 1.0){
		return 3;
	}
	if(hit.norm.y == -1.0){
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
	lights[0] = Light(vec3(-10, 9, -1), vec3(0.5, 0.5, 0), false, LIGHT_AREA, 1., 1.);
	lights[1] = Light(vec3(10, 10, 10), vec3(0.5, 0.5, 0), false, LIGHT_AREA, 1., 1.);

	// Initialize water plane
	sqLen = 10.;
	eta = 0.8;
	water = WaterPlane(vec3(0,1,0), 8.0, 4);
}

vec3 intersect(Ray eyeRay){//main ray bounce function
	vec3 color = vec3(0), ncolor = vec3(0);//accumulated color and ncolor for current object
	Hit hit;
	bool stop = false;
	float dist, alpha = 1.;

	for(int i = 0; i < BOUNCE; i++){
		if(hitSphere(eyeRay, hit, false)){//hit anything inside box
			ncolor = lightAt(hit, hit.norm, eyeRay.dir);//calculate color
			alpha = 0.5;
			color = i==0 ? ncolor : (color * alpha + ncolor * (1. - alpha));
			//fire new ray
			eyeRay.origin = hit.pos;
			eyeRay.dir = reflect(eyeRay.dir, hit.norm);
		}else{
			//hit bounding box
			if(intersectBox(eyeRay, room, dist)){//intersect room return the distance between ray origin and hit spot
				hit.pos = eyeRay.origin + dist * eyeRay.dir;
				hit.norm = normalForBox(hit.pos, room);
				hit.mt = dummySetMtl0(hit);//different merterial for different face
				ncolor = lightAt(hit, -hit.norm, eyeRay.dir);//calculate inner color
			}

			float mDist;
			// Hit water plane
			if (intersectWaterPlane(eyeRay, water, mDist) && dist > mDist){
				hit.pos = eyeRay.origin + mDist * eyeRay.dir;
				hit.norm = getWaterNorm(hit.pos);
				hit.mt = water.mt;
				ncolor = lightAt(hit, -hit.norm, eyeRay.dir);

				eyeRay.origin = hit.pos;
				eyeRay.dir = refract(eyeRay.dir, hit.norm, eta);
				color = i==0 ? ncolor : (color * alpha + ncolor * (1. - alpha));
				alpha = .8;
				continue;
			}else{
				color = i==0 ? ncolor : (color * alpha + ncolor * (1. - alpha));
				stop = true;
			}
		}

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
	if(sampleCount > float(2))
		gl_FragColor = vec4(mix(pColor,color,1./float(2)), 1);
		else
		gl_FragColor = vec4(mix(pColor,color,1./sampleCount), 1);//mix 2 color to achieve Antialiasing
	//gl_FragColor = vec4(texture2D(mtlTex, vec2(1. / 3., 3. /mtlNum)).rgb, 1);
}