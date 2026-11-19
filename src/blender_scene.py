
import bpy
import math
import os
from mathutils import Vector

# RIDDLE TOWN - FIRST 3D ANIMATION
# 10-second classroom test

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

# Output settings
os.makedirs("out", exist_ok=True)

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE_NEXT"
scene.render.resolution_x = 1080
scene.render.resolution_y = 1920
scene.render.resolution_percentage = 100
scene.render.fps = 30
scene.frame_start = 1
scene.frame_end = 300

scene.render.image_settings.file_format = "FFMPEG"
scene.render.ffmpeg.format = "MPEG4"
scene.render.ffmpeg.codec = "H264"
scene.render.filepath = "out/riddle-town-3d-test.mp4"

# Materials
def material(name, color):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    return mat

blue = material("Alex Blue Shirt", (0.04, 0.25, 0.8))
skin = material("Skin", (0.85, 0.57, 0.38))
hair = material("Dark Hair", (0.045, 0.025, 0.02))
pants = material("Dark Pants", (0.08, 0.12, 0.2))
black = material("Black", (0.01, 0.01, 0.015))
white = material("White", (0.9, 0.9, 0.9))
wood = material("Desk Wood", (0.38, 0.19, 0.08))
wall = material("Classroom Wall", (0.65, 0.75, 0.85))
floor_mat = material("Floor", (0.25, 0.3, 0.36))
green = material("Blackboard", (0.025, 0.18, 0.12))
window_mat = material("Window Glass", (0.2, 0.55, 0.8))

# Cube creation
def cube(name, location, scale, mat, parent=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = scale

    bpy.ops.object.transform_apply(
        location=False, rotation=False, scale=True
    )

    if parent:
        obj.parent = parent
        obj.location = location
    else:
        obj.location = location

    obj.data.materials.append(mat)
    bevel = obj.modifiers.new("Soft Edges", "BEVEL")
    bevel.width = 0.04
    bevel.segments = 2
    obj.modifiers.new("Weighted Normals", "WEIGHTED_NORMAL")
    return obj

# Classroom
cube("Floor", (0, 0, -0.2), (12, 15, 0.4), floor_mat)
cube("Back Wall", (0, 5, 4), (12, 0.3, 8), wall)
cube("Left Wall", (-6, 0, 4), (0.3, 10, 8), wall)

# Blackboard
cube("Blackboard", (0, 4.75, 4.4), (4.5, 0.12, 2.2), green)

# Windows
for x in [-4.5, 4.5]:
    cube("Window", (x, 4.7, 4.5), (1.8, 0.12, 2.5), window_mat)
    cube("Window Frame", (x, 4.6, 4.5), (1.95, 0.08, 0.12), white)

# Desks
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

# Alex character root
root = bpy.data.objects.new("Alex Character", None)
scene.collection.objects.link(root)
root.location = (-4, -3, 0)

# Character body
cube("Alex Torso", (0, 0, 2.3), (1.1, 0.55, 1.3), blue, root)
cube("Alex Head", (0, 0, 3.35), (0.9, 0.8, 0.9), skin, root)
cube("Alex Hair", (0, 0.02, 3.82), (0.95, 0.83, 0.22), hair, root)

# Eyes
for x in [-0.2, 0.2]:
    cube("Alex Eye", (x, -0.41, 3.42), (0.09, 0.05, 0.1), black, root)

# Legs
left_leg = cube(
    "Alex Left Leg", (-0.28, 0, 1.4), (0.38, 0.45, 0.9), pants, root
)
right_leg = cube(
    "Alex Right Leg", (0.28, 0, 1.4), (0.38, 0.45, 0.9), pants, root
)

# Arms
left_arm = cube(
    "Alex Left Arm", (-0.72, 0, 2.3), (0.32, 0.4, 1.1), skin, root
)
right_arm = cube(
    "Alex Right Arm", (0.72, 0, 2.3), (0.32, 0.4, 1.1), skin, root
)

# Walking animation
for frame, x in [(1, -4), (100, -2), (180, 0), (240, 0)]:
    root.location.x = x
    root.keyframe_insert(data_path="location", frame=frame)

# Leg and arm movement
for frame in range(1, 181, 15):
    angle = math.radians(25) * math.sin(frame * 0.15)

    left_leg.rotation_euler[0] = angle
    right_leg.rotation_euler[0] = -angle
    left_arm.rotation_euler[0] = -angle
    right_arm.rotation_euler[0] = angle

    for obj in [left_leg, right_leg, left_arm, right_arm]:
        obj.keyframe_insert(data_path="rotation_euler", frame=frame)

# Smooth animation
if root.animation_data and root.animation_data.action:
    for fcurve in root.animation_data.action.fcurves:
        for key in fcurve.keyframe_points:
            key.interpolation = "BEZIER"

# Camera
bpy.ops.object.camera_add(location=(0, -19, 8))
camera = bpy.context.object
camera.name = "Riddle Town Camera"

target = Vector((0, 1, 2.8))
direction = target - camera.location
camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
camera.data.lens = 48
scene.camera = camera

# Lighting
bpy.ops.object.light_add(type="AREA", location=(0, -8, 10))
light = bpy.context.object
light.name = "Classroom Main Light"
light.data.energy = 1800
light.data.shape = "DISK"
light.data.size = 8
light.rotation_euler = (
    Vector((0, 1, 2)) - light.location
).to_track_quat("-Z", "Y").to_euler()

# World lighting
scene.world.color = (0.35, 0.35, 0.35)

# Render
scene.render.image_settings.color_mode = "RGB"
scene.render.ffmpeg.constant_rate_factor = "MEDIUM"
scene.render.ffmpeg.ffmpeg_preset = "GOOD"

scene.frame_set(1)

print("RIDDLE TOWN 3D SCENE READY!")
print("Rendering 10-second classroom animation...")

bpy.ops.render.render(animation=True)

print("3D VIDEO CREATED!")
