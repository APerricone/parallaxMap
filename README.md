# parallaxMap
An experiment with parallax map

Here the source code of the  experiment visible at address: [aperricone.altervista.org/algorithms/parallaxMap/index.html](aperricone.altervista.org/algorithms/parallaxMap/index.html).

Here implement the parallax map, trying to improve it, adding a better control on depth and UV management.

## TODO
 - ~~I plan to include a support to Depth write so it can be used with shadow map and with model overlapping.~~ Done in commit of 17/12/2016
 - I plan to include a Sphere demo.
 - In a desktop version the plane uniform parameter can be stored in a vertex buffer.

##The technique
This implementation of parallax map is based on planes, every triangle carries 9 planes:

 - plane 1: the plane where the texture depth 1 leans, It contains the triangle also.
 - plane 0: the plane where the texture depth 0 leans, Usually it is parallel to plane 1.
 - plane U0 and plane U1: these planes are used to calculate the texture coordinate from the 3D position, the U coordinate is the distance from one of these planes divided by the length of its normal.
 - plane V0 and plane V1, as before but for the V coordinate.
 - limit planes, there are 2D planes used to check if the UV coordinate are inside the valid range. 

In this implementation the limit planes are unused because the limit are set to 0 and 1, and the base geometry is a quadrilateral instead of a triangle.
Having these date the algorithm is:

 - Create a ray from camera, to pixel
 - intersect this ray with plane 0 and plane 1 
 - found the texture coordinates for these 2 points.
 - Intersect the texture values the line between these points.
 - If intersect, check if the texture coordinates of intersection is inside the limit planes, if it is outside discard this intersection.
 - It it is inside calculate the 3D point of this intesection **NEW**
 - use the normal map and the diffuse map to color the point
 - use the 3d position to update the depth value **NEW**
 - If there is no intersection discard this pixel.


##Regards,
Antonino Perricone
