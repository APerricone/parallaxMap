# parallaxMap
An experiment with parallax map

Here the source code of the  experiment visible at address: [aperricone.altervista.org/algorithms/parallaxMap/index.html](aperricone.altervista.org/algorithms/parallaxMap/index.html).

Here I implement the parallax map, trying to improve it, adding a better control on depth and UV management.

## TODO
 - ~~I plan to include a support to Depth write so it can be used with shadow map and with models overlapping.~~ Done in commit of 17/12/2016
 - I plan to include a sphere demo.
 - use instancing to render the cube.
 - create a example geometry shader

##The technique
This implementation of parallax map is based on convex hull, plus some extra planes:

 - plane 1: It is included in the convex hull, this is the plane where the texture depth 1 leans, It contains the triangle also.
 - plane 0: It is included in the convex hull also, this is the plane where the texture depth 0 leans, It must be parallel to plane 1, but for convex hull has the normal opposite the normal of plane 1, this is scaled in way that every point in plane 1 has distance -1.
 - plane U0 and plane U1: these planes are used to calculate the texture coordinate from the 3D position, the U coordinate is the distance from one of these planes divided by the length of its normal, there are not included in the convex hull, and they do not have the unitary normal.
 - plane V0 and plane V1, same as before but for the V coordinate.
 - limit planes, the other planes of the convex hull, for a triangle there are 3 of them. 

In this implementation the limit planes are 4.
Having these data the algorithm is:

 - Create a ray passing for the pixel, in this implementation it is from near plane to far plane.
 - intersect this ray with the convex hull, to find 2 points,
 - find the depth of these 2 points, using plane 0.
 - find the texture coordinates for these 2 points, using depth interpolate planeU0 and planeU1, then use the interpolated plane to find the U coordinate, the V is the same.
 - Intersect the texture values with the line between these points.
 - If there is collision find the 3D point of this intesection **NEW**
 - use the normal map and the diffuse map to color and illuminate the point
 - use the 3d position to update the depth value **NEW**
 - If there is no intersection discard this pixel.

This WebGL inplementation stores the planes in uniform variable, and use instancing to draw more then 1 polygon.
In a desktop implementation we can use geometry shader do calculate the planes from 6 points, with position and UV coordinates.  I will add this code soon.

##Regards,
Antonino Perricone
