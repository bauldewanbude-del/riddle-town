
import bpy
import math
import os
from mathutils import Vector

# ==========================================
# RIDDLE TOWN - BLENDER 5 3D CLASSROOM TEST
# ==========================================

# Clear scene
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

scene = bpy.context.scene

# Output folder
os.makedirs("out", exist_ok=True)
output_path = os.path.abspath("out/riddle-town-3d-test.mp4")

# Render settings
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 720
scene.render.resolution_y = 1280
scene.render.resolution_percentage = 100
scene.render.fps = 30
scene.frame_start = 1
scene.frame_end = 180

scene.render.image_settings.file_format = "FFMPEG"
scene.render.ffmpeg.format = "MPEG4"
scene.render.ffmpeg.codec = "H264"
scene.render.ffmpeg.constant_rate_factor = "MEDIUM"
scene.render.filepath = output_path

# Lighting and color
scene.render.image_settings.color_mode = "RGB"
scene.world.color = (0.25, 0.25, 0.25)

# Materials
def make_material(name, color):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    return mat

blue = make_material("Alex Blue Shirt", (0.04, 0.2, 0.8))
skin = make_material("Skin", (0.8, 0.48, 0.3))
hair = make_material("Dark Hair", (0.025, 0.012, 0.008))
pants = make_material("Dark Pants", (0.06, 0.09, 0.17))
black = make_material("Eyes", (0.005, 0.005, 0.005))
white = make_material("White", (0.9, 0.9, 0.9))
wood = make_material("Desk Wood", (0.38, 0.18, 0.07))
wall = make_material("Classroom Wall", (0.58, 0.7, 0.82))
floor_mat = make_material("Floor", (0.22, 0.25, 0.3))
green = make_material("Blackboard", (0.015, 0.12, 0.07))
glass = make_material("Window Glass", (0.12, 0.42, 0.65))

# Cube helper
def cube(name, location, scale, mat, parent=None):
    bpy.ops.mesh.primitive_cube_add(size=1)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = scale

    bpy.ops.object.transform_apply(
        location=False,
        rotation=False,
        scale=True
    )

    obj.location = location

    if parent:
        obj.parent = parent

    obj.data.materials.append(mat)

    bevel = obj.modifiers.new("Soft Edges", "BEVEL")
    bevel.width = 0.035
    bevel.segments = 2

    obj.modifiers.new("Weighted Normals", "WEIGHTED_NORMAL")

    return obj

# ==========================================
# CLASSROOM
# ==========================================

cube("Classroom Floor", (0, 0, -0.2), (12, 15, 0.4), floor_mat)
cube("Back Wall", (0, 5, 4), (12, 0.3, 8), wall)
cube("Left Wall", (-6, 0, 4), (0.3, 10, 8), wall)
cube("Right Wall", (6, 0, 4), (0.3, 10, 8), wall)

# Blackboard
cube("Blackboard", (0, 4.78, 4.3), (4.5, 0.12, 2.2), green)

# Windows
for x in [-4.5, 4.5]:
    cube("Window Glass", (x, 4.78, 4.5), (1.6, 0.1, 2.5), glass)
    cube("Window Frame", (x, 4.68, 5.78), (1.8, 0.08, 0.1), white)
    cube("Window Frame", (x, 4.68, 3.22), (1.8, 0.08, 0.1), white)
    cube("Window Divider", (x, 4.65, 4.5), (0.08, 0.08, 2.5), white)

# Student desks
for x in [-3.5, 0, 3.5]:
    cube("Desk Top", (x, 1.5, 1.5), (2, 1.2, 0.18), wood)

    for dx in [-0.8, 0.8]:
        for dy in [-0.4, 0.4]:
            cube(
                "Desk Leg",
                (x + dx, 1.5 + dy, 0.75),
                (0.12, 0.12, 1.5),
                wood
            )

# ==========================================
# ALEX CHARACTER
# ==========================================

root = bpy.data.objects.new("Alex Character", None)
scene.collection.objects.link(root)
root.location = (-4, -3, 0)

# Torso
cube("Alex Shirt", (0, 0, 2.25), (1.05, 0.55, 1.25), blue, root)

# Head and hair
cube("Alex Head", (0, 0, 3.2), (0.85, 0.8, 0.85), skin, root)
cube("Alex Hair", (0, 0.02, 3.65), (0.9, 0.83, 0.22), hair, root)

# Eyes
for x in [-0.2, 0.2]:
    cube("Alex Eye", (x, -0.41, 3.25), (0.09, 0.05, 0.1), black, root)

# Legs
left_leg = cube(
    "Alex Left Leg",
    (-0.27, 0, 1.35),
    (0.38, 0.45, 0.9),
    pants,
    root
)

right_leg = cube(
    "Alex Right Leg",
    (0.27, 0, 1.35),
    (0.38, 0.45, 0.9),
    pants,
    root
)

# Arms
left_arm = cube(
    "Alex Left Arm",
    (-0.68, 0, 2.25),
    (0.3, 0.4, 1.05),
    skin,
    root
)

right_arm = cube(
    "Alex Right Arm",
    (0.68, 0, 2.25),
    (0.3, 0.4, 1.05),
    skin,
    root
)

# ==========================================
# WALKING ANIMATION
# ==========================================

for frame, x in [
    (1, -4),
    (60, -3),
    (120, -1),
    (180, 0)
]:
    root.location.x = x
    root.keyframe_insert(
        data_path="location",
        frame=frame
    )

# Swing arms and legs
for frame in range(1, 181, 10):
    angle = math.radians(22) * math.sin(frame * 0.15)

    left_leg.rotation_euler[0] = angle
    right_leg.rotation_euler[0] = -angle

    left_arm.rotation_euler[0] = -angle
    right_arm.rotation_euler[0] = angle

    for obj in [left_leg, right_leg, left_arm, right_arm]:
        obj.keyframe_insert(
            data_path="rotation_euler",
            frame=frame
        )

# ==========================================
# CAMERA
# ==========================================

bpy.ops.object.camera_add(location=(0, -17, 7))
camera = bpy.context.object
camera.name = "Riddle Town Camera"

target = Vector((0, 1, 2.5))
direction = target - camera.location

camera.rotation_euler = direction.to_track_quat(
    "-Z", "Y"
).to_euler()

camera.data.lens = 48
scene.camera = camera

# ==========================================
# LIGHTING
# ==========================================

bpy.ops.object.light_add(
    type="AREA",
    location=(0, -7, 10)
)

light = bpy.context.object
light.name = "Classroom Main Light"
light.data.energy = 1800
light.data.shape = "DISK"
light.data.size = 8

light.rotation_euler = (
    Vector((0, 1, 2)) - light.location
).to_track_quat("-Z", "Y").to_euler()

# Additional soft light
bpy.ops.object.light_add(
    type="AREA",
    location=(-5, 1, 6)
)

fill_light = bpy.context.object
fill_light.name = "Classroom Fill Light"
fill_light.data.energy = 700
fill_light.data.size = 6

fill_light.rotation_euler = (
    Vector((0, 0, 2)) - fill_light.location
).to_track_quat("-Z", "Y").to_euler()

# ==========================================
# RENDER
# ==========================================

scene.frame_set(1)

print("RIDDLE TOWN 3D SCENE READY!")
print("Rendering Alex's classroom animation...")
print("Output:", output_path)

bpy.ops.render.render(animation=True)

print("RIDDLE TOWN 3D VIDEO CREATED!")
