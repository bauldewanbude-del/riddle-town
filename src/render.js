
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const episode = process.argv[2] || "1";
const style = process.argv[3] || "hybrid";

const outputDir = path.resolve("out");
const tempDir = path.resolve("temp");

const episodes = {
  "1": [
    {
      title: "THE NEW STUDENT",
      text: "Nobody wanted to sit beside Alex. But nobody knew the secret he was hiding.",
      voice: "Nobody wanted to sit beside Alex. But nobody knew the secret he was hiding.",
      scene: "classroom"
    },
    {
      title: "THE STRANGE MESSAGE",
      text: "At midnight, Alex received a message from an unknown account. Do not go to school tomorrow.",
      voice: "At midnight, Alex received a message from an unknown account. It said, do not go to school tomorrow.",
      scene: "bedroom"
    },
    {
      title: "THE NEXT MORNING",
      text: "He ignored the warning. But when he entered the classroom, everyone was staring at him.",
      voice: "He ignored the warning. But when he entered the classroom, everyone was staring at him.",
      scene: "classroom"
    },
    {
      title: "THE EMPTY CLASSROOM",
      text: "His teacher was missing. Every desk was empty. Then his phone started ringing.",
      voice: "His teacher was missing. Every desk was empty. Then his phone started ringing.",
      scene: "empty"
    },
    {
      title: "TO BE CONTINUED...",
      text: "The message appeared again. This time, it showed a picture of Alex standing behind himself.",
      voice: "The message appeared again. This time, it showed a picture of Alex standing behind himself. To be continued.",
      scene: "hallway"
    }
  ],
  "2": [
    {
      title: "THE RETURN",
      text: "Alex returned to school. But something was terribly different.",
      voice: "Alex returned to school. But something was terribly different.",
      scene: "hallway"
    },
    {
      title: "THE WARNING",
      text: "A new message appeared. You should have listened.",
      voice: "A new message appeared. It said, you should have listened.",
      scene: "bedroom"
    },
    {
      title: "THE FOOTSTEPS",
      text: "Someone was following him. Every time he turned around, nobody was there.",
      voice: "Someone was following him. Every time he turned around, nobody was there.",
      scene: "hallway"
    },
    {
      title: "THE SECRET",
      text: "He discovered that the messages were coming from his own phone number.",
      voice: "He discovered that the messages were coming from his own phone number.",
      scene: "bedroom"
    },
    {
      title: "THE FINAL MESSAGE",
      text: "One last message appeared. Alex, I am right behind you.",
      voice: "One last message appeared. Alex, I am right behind you. To be continued.",
      scene: "hallway"
    }
  ]
};

function run(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024
  });

  if (result.status !== 0) {
    console.error(result.stderr || result.error);
    throw new Error(command + " failed");
  }

  return result.stdout.trim();
}

function wrapText(text, maxLength = 32) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const next = (line + " " + word).trim();

    if (next.length > maxLength && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }

  if (line) lines.push(line);
  return lines.join("\n");
}

function addBox(filters, x, y, w, h, color) {
  filters.push(
    `drawbox=x=${x}:y=${y}:w=${w}:h=${h}:color=${color}:t=fill`
  );
}

function addAvatar(filters, x, shirt, pants, skin, hair) {
  // Soft shadow
  addBox(filters, x - 90, 1370, 180, 24, "0x000000@0.30");

  // Legs
  addBox(filters, x - 65, 1190, 58, 190, pants);
  addBox(filters, x + 7, 1190, 58, 190, pants);

  // Shoes
  addBox(filters, x - 75, 1360, 72, 35, "0x242424");
  addBox(filters, x + 2, 1360, 72, 35, "0x242424");

  // Arms
  addBox(filters, x - 105, 880, 42, 300, skin);
  addBox(filters, x + 63, 880, 42, 300, skin);

  // Torso
  addBox(filters, x - 85, 875, 170, 320, shirt);

  // Neck
  addBox(filters, x - 25, 825, 50, 75, skin);

  // Blocky head
  addBox(filters, x - 82, 660, 164, 164, skin);

  // Hair
  addBox(filters, x - 85, 650, 170, 42, hair);
  addBox(filters, x - 85, 680, 35, 55, hair);
  addBox(filters, x + 50, 680, 35, 55, hair);

  // Eyes
  addBox(filters, x - 42, 730, 16, 18, "0x202020");
  addBox(filters, x + 25, 730, 16, 18, "0x202020");
}

function buildScene(scene, filters) {
  // Background wall and floor
  addBox(filters, 0, 0, 1080, 1920, "0x8FA9C2");
  addBox(filters, 0, 1480, 1080, 440, "0x62636D");

  if (scene === "classroom" || scene === "empty") {
    // Classroom walls
    addBox(filters, 0, 0, 1080, 220, "0x526B8A");
    addBox(filters, 80, 250, 920, 850, "0xC7D8E8");

    // Windows
    addBox(filters, 100, 330, 210, 280, "0x77C9E9");
    addBox(filters, 770, 330, 210, 280, "0x77C9E9");

    addBox(filters, 200, 330, 12, 280, "0xFFFFFF");
    addBox(filters, 870, 330, 12, 280, "0xFFFFFF");

    // Blackboard
    addBox(filters, 345, 310, 390, 280, "0x245344");
    addBox(filters, 365, 330, 350, 240, "0x183D32");

    // Teacher's desk
    addBox(filters, 370, 1060, 340, 65, "0x80512E");
    addBox(filters, 400, 1125, 35, 180, "0x50301D");
    addBox(filters, 645, 1125, 35, 180, "0x50301D");

    if (scene === "classroom") {
      // Student desks
      addBox(filters, 80, 1190, 220, 55, "0x95623D");
      addBox(filters, 780, 1190, 220, 55, "0x95623D");

      addAvatar(filters, 350, "0x2676C8", "0x26364C", "0xE7AE83", "0x30201B");
      addAvatar(filters, 730, "0xB94C65", "0x292B49", "0xF0BC91", "0x3A211A");
    }
  }

  if (scene === "bedroom") {
    // Night bedroom
    addBox(filters, 0, 0, 1080, 1480, "0x26334F");

    // Window and moonlight
    addBox(filters, 690, 250, 290, 420, "0x18233C");
    addBox(filters, 720, 280, 230, 360, "0x8BB6DC");
    addBox(filters, 820, 350, 90, 90, "0xF8E7A6");

    // Bed
    addBox(filters, 90, 1100, 650, 210, "0x566B9B");
    addBox(filters, 90, 1040, 250, 100, "0xE7E7F1");
    addBox(filters, 90, 1290, 650, 65, "0x392C50");

    addAvatar(filters, 410, "0x2676C8", "0x26364C", "0xE7AE83", "0x30201B");

    // Glowing phone
    addBox(filters, 570, 1000, 65, 105, "0x12121B");
    addBox(filters, 580, 1010, 45, 75, "0x45D9F0");
  }

  if (scene === "hallway") {
    // Dark school corridor
    addBox(filters, 0, 0, 1080, 1480, "0x34445F");

    // Corridor perspective decorations
    addBox(filters, 0, 280, 1080, 25, "0x9BAFC7");
    addBox(filters, 0, 950, 1080, 20, "0x9BAFC7");

    // Lockers
    for (let i = 0; i < 5; i++) {
      addBox(filters, 40 + i * 205, 500, 145, 650, "0x526C8E");
      addBox(filters, 55 + i * 205, 520, 115, 12, "0xA7BDD3");
    }

    // Main character and mysterious silhouette
    addAvatar(filters, 380, "0x2676C8", "0x26364C", "0xE7AE83", "0x30201B");

    addBox(filters, 770, 850, 115, 390, "0x161A28");
    addBox(filters, 780, 730, 95, 120, "0x202637");
  }

  // Cinematic lower foreground
  addBox(filters, 0, 1480, 1080, 440, "0x242A38");
}

async function main() {
  if (!episodes[episode]) {
    throw new Error("Episode must be 1 or 2.");
  }

  if (!["story", "neon", "hybrid"].includes(style)) {
    throw new Error("Style must be story, neon or hybrid.");
  }

  run("ffmpeg", ["-version"]);
  run("espeak-ng", ["--version"]);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(tempDir, { recursive: true });

  const scenes = episodes[episode];
  const segmentFiles = [];

  const font = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";
  const regularFont = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";

  const accent =
    style === "neon" ? "0x00E5FF" : "0xFFE07A";

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const base = path.join(tempDir, `scene-${i + 1}`);

    const titleFile = base + "-title.txt";
    const bodyFile = base + "-body.txt";
    const audioFile = base + ".wav";
    const videoFile = base + ".mp4";

    fs.writeFileSync(titleFile, scene.title, "utf8");
    fs.writeFileSync(bodyFile, wrapText(scene.text), "utf8");

    console.log(`Creating narration ${i + 1}/${scenes.length}`);

    run("espeak-ng", [
      "-v", "en-us",
      "-s", "145",
      "-p", "40",
      "-w", audioFile,
      scene.voice
    ]);

    const audioDuration = Number(run("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      audioFile
    ]));

    const duration = Math.max(5, audioDuration + 1.5);

    const filters = [];

    buildScene(scene.scene, filters);

    if (style === "neon") {
      filters.push("eq=contrast=1.15:saturation=1.25");
    } else {
      filters.push("eq=contrast=1.08:saturation=1.08");
    }

    // Cinematic scene title
    filters.push(
      `drawtext=fontfile=${font}:textfile=${titleFile}:fontcolor=${accent}:fontsize=58:x=(w-text_w)/2:y=145:box=1:boxcolor=0x101522@0.85:boxborderw=28:fix_bounds=1`
    );

    // Dialogue subtitle panel
    filters.push(
      `drawbox=x=35:y=1510:w=1010:h=300:color=0x080D19@0.88:t=fill`
    );

    filters.push(
      `drawtext=fontfile=${regularFont}:textfile=${bodyFile}:fontcolor=white:fontsize=43:line_spacing=18:x=(w-text_w)/2:y=1590:fix_bounds=1`
    );

    console.log(`Rendering hybrid scene ${i + 1}/${scenes.length}`);

    run("ffmpeg", [
      "-y",
      "-f", "lavfi",
      "-i", `color=c=0x202B40:s=1080x1920:r=30:d=${duration}`,
      "-i", audioFile,
      "-vf", filters.join(","),
      "-af", "apad",
      "-t", String(duration),
      "-c:v", "libx264",
      "-preset", "ultrafast",
      "-crf", "23",
      "-pix_fmt", "yuv420p",
      "-c:a", "aac",
      "-b:a", "128k",
      "-ar", "44100",
      "-shortest",
      videoFile
    ]);

    segmentFiles.push(videoFile);
  }

  const concatFile = path.join(tempDir, "concat.txt");

  fs.writeFileSync(
    concatFile,
    segmentFiles.map(file =>
      `file '${file.replace(/'/g, "'\\''")}'`
    ).join("\n")
  );

  const finalVideo = path.join(
    outputDir,
    `riddle-town-episode-${episode}-${style}.mp4`
  );

  console.log("Combining scenes...");

  run("ffmpeg", [
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", concatFile,
    "-c", "copy",
    "-movflags", "+faststart",
    finalVideo
  ]);

  console.log("VIDEO CREATED SUCCESSFULLY!");
  console.log(finalVideo);
}

main().catch(error => {
  console.error("VIDEO RENDER FAILED:", error);
  process.exit(1);
});
      
