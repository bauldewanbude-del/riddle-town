
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const episode = process.argv[2] || "1";
const style = process.argv[3] || "story";

const outputDir = path.resolve("out");
const tempDir = path.resolve("temp");

const episodes = {
  "1": [
    {
      title: "THE NEW STUDENT",
      text: "Nobody wanted to sit beside Alex. But nobody knew the secret he was hiding.",
      voice: "Nobody wanted to sit beside Alex. But nobody knew the secret he was hiding."
    },
    {
      title: "THE STRANGE MESSAGE",
      text: "At midnight, Alex received a message from an unknown account. It said: Do not go to school tomorrow.",
      voice: "At midnight, Alex received a message from an unknown account. It said, do not go to school tomorrow."
    },
    {
      title: "THE NEXT MORNING",
      text: "He ignored the warning. But when he entered the classroom, everyone was staring at him.",
      voice: "He ignored the warning. But when he entered the classroom, everyone was staring at him."
    },
    {
      title: "THE EMPTY CLASSROOM",
      text: "His teacher was missing. Every desk was empty. Then his phone started ringing.",
      voice: "His teacher was missing. Every desk was empty. Then his phone started ringing."
    },
    {
      title: "TO BE CONTINUED...",
      text: "The message appeared again. This time, it showed a picture of Alex standing behind himself.",
      voice: "The message appeared again. This time, it showed a picture of Alex standing behind himself. To be continued."
    }
  ],
  "2": [
    {
      title: "THE RETURN",
      text: "Alex returned to school. But something was terribly different.",
      voice: "Alex returned to school. But something was terribly different."
    },
    {
      title: "THE WARNING",
      text: "A new message appeared. It said: You should have listened.",
      voice: "A new message appeared. It said, you should have listened."
    },
    {
      title: "THE FOOTSTEPS",
      text: "Someone was following him. Every time he turned around, nobody was there.",
      voice: "Someone was following him. Every time he turned around, nobody was there."
    },
    {
      title: "THE SECRET",
      text: "He discovered that the messages were coming from his own phone number.",
      voice: "He discovered that the messages were coming from his own phone number."
    },
    {
      title: "THE FINAL MESSAGE",
      text: "One last message appeared. Alex, I am right behind you.",
      voice: "One last message appeared. Alex, I am right behind you. To be continued."
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

function wrapText(text, maxLength = 25) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    if ((line + " " + word).trim().length > maxLength) {
      lines.push(line);
      line = word;
    } else {
      line = (line + " " + word).trim();
    }
  }

  if (line) lines.push(line);
  return lines.join("\n");
}

async function main() {
  if (!episodes[episode]) {
    throw new Error("Episode must be 1 or 2.");
  }

  if (!["story", "neon"].includes(style)) {
    throw new Error("Style must be story or neon.");
  }

  run("ffmpeg", ["-version"]);
  run("espeak-ng", ["--version"]);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(tempDir, { recursive: true });

  const scenes = episodes[episode];
  const concatFile = path.join(tempDir, "concat.txt");
  const segmentFiles = [];

  const font = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";
  const regularFont = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";

  const accent = style === "neon" ? "#00eaff" : "#ff5555";
  const background = style === "neon" ? "0x080d25" : "0x101014";

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const base = path.join(tempDir, `scene-${i + 1}`);

    const titleFile = base + "-title.txt";
    const bodyFile = base + "-body.txt";
    const audioFile = base + ".wav";
    const videoFile = base + ".mp4";

    fs.writeFileSync(titleFile, scene.title);
    fs.writeFileSync(bodyFile, wrapText(scene.text));

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

    const duration = Math.max(4, audioDuration + 1.2);

    const filters = [
      `drawtext=fontfile=${font}:textfile=${titleFile}:fontcolor=${accent}:fontsize=68:x=(w-text_w)/2:y=h*0.22:box=1:boxcolor=black@0.45:boxborderw=25`,
      `drawtext=fontfile=${regularFont}:textfile=${bodyFile}:fontcolor=white:fontsize=48:line_spacing=22:x=(w-text_w)/2:y=h*0.43:box=1:boxcolor=black@0.45:boxborderw=35`
    ].join(",");

    console.log(`Rendering scene ${i + 1}/${scenes.length}`);

    run("ffmpeg", [
      "-y",
      "-f", "lavfi",
      "-i", `color=c=${background}:s=1080x1920:r=30:d=${duration}`,
      "-i", audioFile,
      "-vf", filters,
      "-af", "apad",
      "-t", String(duration),
      "-c:v", "libx264",
      "-preset", "ultrafast",
      "-crf", "24",
      "-pix_fmt", "yuv420p",
      "-c:a", "aac",
      "-b:a", "128k",
      "-ar", "44100",
      "-shortest",
      videoFile
    ]);

    segmentFiles.push(videoFile);
  }

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
      
