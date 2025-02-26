import * as Tone from "tone";

window.addEventListener("load", () => {
  let clicked = false;
  let beat = 0;
  let playing = false;
  let selected = 0;
  const steps = new Array(16);

  const output = document.getElementById("output")!;
  output.innerText = "Click here";
  function draw() {
    let text = "";
    for (let i = 0; i < 16; i++) {
      const note = steps[i];
      let noteStr = note ? Tone.Frequency(note, "midi").toNote().toString() : "---";
      if (noteStr.length == 2) noteStr = `${noteStr[0]}-${noteStr[1]}`;
      text += `${i == beat ? ">" : " "} ${i.toString(16).toUpperCase()} ${i == selected ? `[${noteStr}]` : ` ${noteStr}`}\n`;
    }
    output.innerText = text;
  }

  output.addEventListener("click", async () => {
    if (clicked) return;
    clicked = true;

    Tone.setContext(new Tone.Context({ latencyHint: "interactive", lookAhead: 0 }));

    console.log("Starting Tone...");
    await Tone.start();
    console.log("Started Tone");

    const transport = Tone.getTransport()
    transport.bpm.value = 120;
    transport.scheduleRepeat(tick, "16n");

    const synth = new Tone.PolySynth().toDestination();

    const noteActive: Map<string, boolean> = new Map();

    window.addEventListener("keydown", event => {
      if (event.key == " ") {
        if (playing) {
          playing = false;
          transport.stop();
        } else {
          playing = true;
          transport.start();
        }
      } else if (event.key == "Enter") {
        if (!steps[selected]) {
          steps[selected] = 60;
        } else {
          steps[selected] = null;
        }
        draw();
      } else if (event.key == "ArrowUp") {
        if (selected > 0) {
          selected--;
          draw();
        }
      } else if (event.key == "ArrowDown") {
        if (selected < 15) {
          selected++;
          draw();
        }
      } else if (event.key == "ArrowLeft") {
        if (steps[selected] && steps[selected] > 12) {
          steps[selected]--;
          draw();
        }
      } else if (event.key == "ArrowRight") {
        if (steps[selected] && steps[selected] < 127) {
          steps[selected]++;
          draw();
        }
      } else {
        var note = keyToNote(event.key);
        if (note && !noteActive.get(note)) {
          noteActive.set(note, true);
          synth.triggerAttack(note);
        }
      }
    });

    window.addEventListener("keyup", event => {
      var note = keyToNote(event.key);
      if (note && noteActive.get(note)) {
        noteActive.set(note, false);
        synth.triggerRelease(note);
      }
    });

    function tick(time: Tone.Unit.Seconds) {
      beat = (beat + 1) % 16;
      if (steps[beat])
        synth.triggerAttackRelease(Tone.Frequency(steps[beat], "midi").toNote(), "16n", time);
      draw();
    }

    draw();
  });
});

function keyToNote(key: string): string | null {
  switch (key) {
    case "z": return "C4";
    case "s": return "C#4";
    case "x": return "D4";
    case "d": return "D#4";
    case "c": return "E4";
    case "v": return "F4";
    case "g": return "F#4";
    case "b": return "G4";
    case "h": return "G#4";
    case "n": return "A4";
    case "j": return "A#4";
    case "m": return "B4";
    case ",": return "C5";
    default: return null;
  }
}