#Operation
- mousemove
- keyborad UP forward
- DOWN backward

#Tech#

## Ray Tracing##

Shoot a ray from each pixel
Translate the ray direction from camera space to world space by rtrans matrix and rotate matrix

## Motion Blur##

Achieved by super sampling over time in fragment shader. Using velocity of mousemove event.

## 解决本地开启HTML图片无法显示问题

- 使用python -m SimpleHTTPServer在html文件所在文件下开启python服务器，通过localhost:8000/index.html即可正常访问
- 
## .mtl 文件参数说明
- 基本参数参见[Material template library](http://en.wikipedia.org/wiki/Wavefront_.obj_file#Material_template_library)
- 扩展参数map 表示是否使用texture map, norm map, bump map
