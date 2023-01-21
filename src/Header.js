class Header {
	constructor() {
		this.header = `#VRML_SIM R2022b utf8

EXTERNPROTO "https://raw.githubusercontent.com/cyberbotics/webots/50c3f419b5da49a2af606297049ee91e8adbc92e/projects/objects/apartment_structure/protos/Wall.proto"

PROTO custom-room4 [
	field SFInt32			 X							  0
	field SFInt32			 Y							  0
	field SFInt32			 DIR						  0						   # [0, 1, 2, 3] = [N, E, S, W]
	field SFFloat 			 width 						  7.0
	field SFFloat 			 height 					  8.0
	field SFFloat 			 xScale 					  0.4
    field SFFloat 			 zScale 					  0.4
    field SFFloat 			 yScale 					  0.4
	field SFFloat 			 area4Width 				  7.0
	field SFFloat 			 area4Height 				  5.0
]
{
# IMPORTANT: translation 0 0 0 must be tile 0 of room 4
Solid {
  %{
	xStart = -(fields.width.value * (0.3 * fields.xScale.value) / 2.0)
	zStart = -(fields.height.value * (0.3 * fields.zScale.value) / 2.0)
	xRelPos = fields.X.value * 0.3 * fields.xScale.value
	zRelPos = fields.Y.value * 0.3 * fields.zScale.value
	area4XStart = math.floor(fields.area4Width.value / 2.0) * (0.3 * fields.xScale.value)
	area4ZStart = math.floor(fields.area4Height.value / 2.0) * (0.3 * fields.zScale.value)
	xCoord = xRelPos + xStart
	zCoord = zRelPos + zStart
	if (fields.DIR.value == 0)
	then
		zCoord = zCoord - 0.005
	elseif (DIR == 1)
	then
		xCoord = xCoord + 0.005
	elseif (DIR == 2)
	then
		zCoord = zCoord + 0.005
	elseif (DIR == 3)
	then
		xCoord = xCoord - 0.005
	end
	
	rotAngle = fields.DIR.value * -1.57
  }%
  translation %{=xCoord}% -0.03 %{=zCoord}%
  rotation 0 1 0 %{=rotAngle}%
  #name "%{=zStart}%,%{=area4ZStart}%,%{=zRelPos}%,"
  children [
	Solid {
		translation 0 0 0
		children [
			DEF Walls Group {
			  children [
		`;
	}
}

export default Header;