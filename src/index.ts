import * as Tone from "tone";

window.addEventListener("load", () => {
  // rest
  const outputE = document.getElementById("output")! as HTMLPreElement;
  function show(msg: string) { outputE.innerText = msg }
  const currentStepE = document.getElementById("currentStep")! as HTMLDivElement;
  const inputE = document.getElementById("input")! as HTMLInputElement;
  const sendE = document.getElementById("send")! as HTMLButtonElement;
  inputE.disabled = true;
  sendE.disabled = true;
  const midiE = document.getElementById("midi")! as HTMLButtonElement;
  midiE.disabled = true;
  const showScriptE = document.getElementById("show-script")! as HTMLButtonElement;
  showScriptE.disabled = true;
  const scriptE = document.getElementById("script")! as HTMLTextAreaElement;
  scriptE.disabled = true;
  const runScriptE = document.getElementById("run-script")! as HTMLButtonElement;
  runScriptE.disabled = true;
  const startE = document.getElementById("start")! as HTMLButtonElement;
  startE.addEventListener("click", async () => {
    Tone.setContext(new Tone.Context({ latencyHint: "interactive", lookAhead: 0 }));

    show("starting...");
    await Tone.start();
    show("started!");

    startE.disabled = true;
    inputE.disabled = false;
    sendE.disabled = false;
    midiE.disabled = false;

    // scripting start
    showScriptE.disabled = false;
    scriptE.disabled = false;
    runScriptE.disabled = false;
    let scriptShown = false;
    showScriptE.addEventListener("click", () => {
      if (scriptShown) {
        showScriptE.textContent = "Show scripting";
        scriptShown = false;
        scriptE.style.visibility = "hidden";
        runScriptE.style.visibility = "hidden";
      } else {
        showScriptE.textContent = "Hide scripting";
        scriptShown = true;
        scriptE.style.visibility = "visible";
        runScriptE.style.visibility = "visible";
      }
    });
    runScriptE.addEventListener("click", () => {
      const content = (scriptE.value || "").split("\n");
      content.forEach(line => process(line));
      show(`executed ${content.length} lines`);
    });
    // scripting end

    let midiInstrument = 0;
    let currentStep = 0;
    let currentPart = 0;
    let currentPattern = 0;
    let patterns: (string | null)[][][] = [[]];
    let patternInstruments: number[][] = [[0]];
    let song: number[] = [];
    let playingSong = false;
    let songIx = 0;
    const firstPattern = newPattern();
    patterns[0].push(firstPattern);
    
    function showStatus() {
      currentStepE.innerText = `midi ${midiInstrument} | part ${currentPart} | pattern ${currentPattern} | step ${currentStep}${playingSong ? ` | song ${songIx}` : ""}`;
    }
    showStatus();

    function createDrumsSampler(sample: string): Tone.Sampler {
      return new Tone.Sampler({
        urls: {
          "C4": "kick.mp3",
          "D4": "snare.mp3",
          "E4": "hihat.mp3",
          "F4": "tom1.mp3",
          "G4": "tom2.mp3",
          "A4": "tom3.mp3",
        },
        baseUrl: `https://tonejs.github.io/audio/drum-samples/${sample}/`,
      });
    }
    const instruments = [
      createDrumsSampler("4OP-FM"),
      createDrumsSampler("Bongos"),
      createDrumsSampler("CR78"),
      createDrumsSampler("KPR77"),
      createDrumsSampler("Kit3"),
      createDrumsSampler("Kit8"),
      createDrumsSampler("LINN"),
      createDrumsSampler("R8"),
      createDrumsSampler("Stark"),
      createDrumsSampler("Techno"),
      createDrumsSampler("TheCheebacabra1"),
      createDrumsSampler("TheCheebacabra2"),
      createDrumsSampler("acoustic-kit"),
      createDrumsSampler("breakbeat13"),
      createDrumsSampler("breakbeat8"),
      createDrumsSampler("breakbeat9"),
      new Tone.PolySynth(Tone.Synth), // 16
    ];
    instruments.forEach(i => i.toDestination());

    const transport = Tone.getTransport()
    transport.bpm.value = 120;
    transport.swing = 0;
    transport.scheduleRepeat(tick, "16n");
    transport.stop();

    inputE.addEventListener("keyup", event => { if (event.key == "Enter") process(inputE.value) });
    sendE.addEventListener("click", _ => process(inputE.value));

    function process(msg_: string) {
      try {
        const msg = msg_.trim();
        if (msg == "start song") {
          if (song.length == 0) {
            show("song is empty");
          } else {
            currentStep = 0;
            songIx = 0;
            playingSong = true;
            transport.start();
            show("started song");
          }
        } else if (msg == "stop song") {
          playingSong = false;
          transport.stop();
          songIx = 0;
          show("stopped song");
        } else if (msg == "start") {
          currentStep = 0;
          transport.start();
          show("started pattern");
        } else if (msg == "stop") {
          transport.stop();
          currentStep = 0;
          show("stopped pattern");
        } else if (msg.startsWith("bpm")) {
          const bpm = msg.substring(3).trim();
          if (bpm.length > 0) transport.bpm.value = +bpm;
          show(`bpm: ${transport.bpm.value}`);
        } else if (msg.startsWith("midi")) {
          const bpm = msg.substring(4).trim();
          if (bpm.length > 0) midiInstrument = +bpm;
          show(`midi instrument: ${midiInstrument}`);
        } else if (msg.startsWith("swingdiv")) {
          const swingDiv = msg.substring(8).trim();
          if (swingDiv.length > 0) transport.swingSubdivision = swingDiv as Tone.Unit.Subdivision;
          show(`swing subdivision: ${transport.swingSubdivision}`);
        } else if (msg.startsWith("swing")) {
          const swing = msg.substring(5).trim();
          if (swing.length > 0) transport.swing = +swing;
          show(`swing: ${transport.swing}`);
        } else if (msg.startsWith("part")) {
          const ix = msg.substring(4).trim();
          if (ix.length > 0) {
            currentPart = +ix;
            currentPattern = 0;
            if (!patterns[currentPart]) {
              patterns[currentPart] = [newPattern()];
              patternInstruments[currentPart] = [0];
            }
          }
          show(`current part: ${currentPart}`);
        } else if (msg.startsWith("set pattern")) {
          const ix = msg.substring(11).trim();
          if (ix.length > 0) {
            currentPattern = +ix;
            if (!patterns[currentPart][currentPattern])
              patterns[currentPart][currentPattern] = newPattern();
          }
          show(`current pattern: ${currentPattern}`);
        } else if (msg.startsWith("patterns")) {
          const ps: string[] = new Array(patterns[currentPart].length);
          for (let p = 0; p < patterns[currentPart].length; p++) {
            let pattern = patterns[currentPart][p];
            if (!pattern) {
              pattern = newPattern();
              patternInstruments[currentPart][p] = 0;
              patterns[currentPart][p] = pattern;
            }
            ps[p] = `${p == currentPattern ? ">" : " "}${p}: ${patternStr(pattern)} (I${patternInstruments[currentPart][p]})`;
          }
          show(`patterns:\n${ps.join("\n")}`);
        } else if (msg.startsWith("pattern")) {
          const newNotes = msg.substring(7).trim();
          if (newNotes.length > 0) {
            const parsed = newNotes.split(" ").map(n => n == "-" ? null : n);
            patterns[currentPart][currentPattern] = parsed;
            while (patterns[currentPart][currentPattern].length < 16)
              patterns[currentPart][currentPattern] = patterns[currentPart][currentPattern].concat(patterns[currentPart][currentPattern]);
            while (patterns[currentPart][currentPattern].length > 16) patterns[currentPart][currentPattern].pop();
          }
          show(`pattern: ${patternStr(patterns[currentPart][currentPattern])}`);
        } else if (msg.startsWith("instrument")) {
          const ix = msg.substring(10).trim();
          if (ix.length > 0) patternInstruments[currentPart][currentPattern] = +ix;
          show(`current instrument: ${patternInstruments[currentPart][currentPattern]}`);
        } else if (msg.startsWith("queue")) {
          const cmd = msg.substring(5).trim();
          queue.push(cmd);
          show(`queued: ${cmd}`)
        } else if (msg.startsWith("song")) {
          const newSong = msg.substring(5).trim();
          if (newSong.length > 0)
            song = newSong.split(" ").map(n => +n.trim());
          show(`song: ${song.join(" ")}`);
        } else if (msg.startsWith("copy part")) {
          const args = msg.substring(9).trim().split(" ").map(a => +a);
          const src = args[0];
          const tgt = args[1];
          patterns[tgt] = patterns[src].map(p => p.slice());
          patternInstruments[tgt] = patternInstruments[src].slice();
          show(`copied part ${src} to ${tgt}`);
        } else if (msg == "" || msg.startsWith("--")) {
          // do nothing
        } else {
          show(`invalid message: ${msg}`);
        }
      } catch (err) {
        show(`error: ${err}`);
      }
      inputE.value = "";
      showStatus();
    }

    let queue: string[] = [];

    function tick(time: Tone.Unit.Seconds) {
      showStatus();

      // perform queued commands
      if (currentStep == 0) {
        const curQueue = queue;
        queue = [];
        for (let i = 0; i < curQueue.length; i++)
          process(curQueue[i]);
      }

      // play patterns
      const part = playingSong ? song[songIx] : currentPart;
      for (let p = 0; p < patterns[part].length; p++) {
        if (patterns[part][p]) {
          const note = patterns[part][p][currentStep] || null;
          if (note) {
            const instrument = instruments[patternInstruments[part][p] || 0];
            instrument.triggerAttackRelease(note, "16n", time, 0.8);
          }
        }
      }

      currentStep = (currentStep + 1) % 16;

      if (playingSong && currentStep == 0)
        songIx = (songIx + 1) % song.length;
    }

    function patternStr(p: (string | null)[]): string {
      return p.map((n, ix) =>
        (n ? (n.length < 3 ? `${n} ` : n) : "---") + (ix % 4 == 3 && ix != 15 ? " | " : "")
      ).join(" ");
    }

    function newPattern(): (string | null)[] {
      const pattern = new Array(16);
      for (let i = 0; i < 16; i++) pattern[i] = null;
      return pattern;
    }

    // midi
    midiE.addEventListener("click", async () => {
      let access = await navigator.requestMIDIAccess();
      for (let device of access.inputs.values()) device.onmidimessage = onMidiMessage;
      function onMidiMessage(msg: MIDIMessageEvent) {
        let [id, note, vel] = msg.data!;
        let NOTE_ON = 144;
        let NOTE_OFF = 128;
        const tone = Tone.Frequency(note, "midi").toNote();
        if (id == NOTE_ON) {
          instruments[midiInstrument].triggerAttack(tone, Tone.now(), vel / 127 * 0.8);
        } else if (id == NOTE_OFF) {
          instruments[midiInstrument].triggerRelease(tone, Tone.now());
        }
      }
    });
  });
});