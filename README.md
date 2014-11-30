#Operate
mousemove
keyborad UP forward, DOWN backward
#Tech#
##Ray Tracing##
Shoot a ray from each pixel
Translate the ray direction from camera space to world space by rtrans matrix and rotate matrix
##Motion Blur##
Achieved by super sampling over time in fragment shader. Using velocity of mousemove event.
