import * as Tone from "tone";

window.addEventListener("load", () => {
  const outputE = document.getElementById("output")! as HTMLPreElement
  function show(msg: string) { outputE.innerText = msg }
  const currentStepE = document.getElementById("currentStep")! as HTMLDivElement
  const inputE = document.getElementById("input")! as HTMLInputElement
  const sendE = document.getElementById("send")! as HTMLButtonElement
  inputE.disabled = true;
  sendE.disabled = true;
  const midiE = document.getElementById("midi")! as HTMLButtonElement
  midiE.disabled = true;
  const startE = document.getElementById("start")! as HTMLButtonElement
  startE.addEventListener("click", async () => {
    Tone.setContext(new Tone.Context({ latencyHint: "interactive", lookAhead: 0 }));

    show("starting...");
    await Tone.start();
    show("started!");

    startE.disabled = true;
    inputE.disabled = false;
    sendE.disabled = false;
    midiE.disabled = false;

    let midiInstrument = 0;
    let currentStep = 0;
    function showCurrentStep() { currentStepE.innerText = `current step: ${currentStep}` }
    showCurrentStep();
    let currentPattern = 0;
    let patterns: (string | null)[][] = [];
    let patternInstruments: number[] = [0];
    const firstPattern = new Array(16);
    for (let i = 0; i < 16; i++) firstPattern[i] = null;
    patterns.push(firstPattern);

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
        if (msg == "start") {
          currentStep = 0;
          transport.start();
          show("started loop");
        } else if (msg == "stop") {
          transport.stop();
          currentStep = 0;
          showCurrentStep();
          show("stopped loop");
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
        } else if (msg.startsWith("set pattern")) {
          const ix = msg.substring(11).trim();
          if (ix.length > 0) {
            currentPattern = +ix;
            if (!patterns[currentPattern]) {
              const newPattern = new Array(16);
              for (let i = 0; i < 16; i++) newPattern[i] = null;
              patterns[currentPattern] = newPattern;
            }
          }
          show(`current pattern: ${currentPattern}`);
        } else if (msg.startsWith("patterns")) {
          const ps: string[] = new Array(patterns.length);
          for (let p = 0; p < patterns.length; p++) {
            let pattern = patterns[p];
            if (!pattern) {
              pattern = new Array(16);
              for (let i = 0; i < 16; i++) pattern[i] = null;
              patternInstruments[p] = 0;
              patterns[p] = pattern;
            }
            ps[p] = `${p}: ${patternStr(pattern)} (I${patternInstruments[p]})`;
          }
          show(`patterns:\n${ps.join("\n")}`);
        } else if (msg.startsWith("pattern")) {
          const newNotes = msg.substring(7).trim();
          if (newNotes.length > 0) {
            const parsed = newNotes.split(" ").map(n => n == "-" ? null : n);
            patterns[currentPattern] = parsed;
            while (patterns[currentPattern].length < 16)
              patterns[currentPattern] = patterns[currentPattern].concat(patterns[currentPattern]);
            while (patterns[currentPattern].length > 16) patterns[currentPattern].pop();
          }
          show(`pattern: ${patternStr(patterns[currentPattern])}`);
        } else if (msg.startsWith("instrument")) {
          const ix = msg.substring(10).trim();
          if (ix.length > 0) patternInstruments[currentPattern] = +ix;
          show(`current instrument: ${patternInstruments[currentPattern]}`);
        } else if (msg == "") {
          // do nothing
        } else {
          show(`invalid message: ${msg}`);
        }
      } catch (err) {
        show(`error: ${err}`);
      }
      inputE.value = "";
    }

    function tick(time: Tone.Unit.Seconds) {
      showCurrentStep();
      for (let p = 0; p < patterns.length; p++) {
        if (patterns[p]) {
          const note = patterns[p][currentStep] || null;
          if (note) {
            const instrument = instruments[patternInstruments[p] || 0];
            instrument.triggerAttackRelease(note, "16n", time, 0.8);
          }
        }
      }
      currentStep = (currentStep + 1) % 16;
    }

    function patternStr(p: (string | null)[]): string {
      return p.map(n => n ? (n.length < 3 ? `${n} ` : n) : "---").join(" ");
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