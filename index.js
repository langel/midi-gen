const chord = require("@tonaljs/chord");

console.log(chord);

const notes = [ 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B' ];

function rndint(max) {
  return Math.floor(Math.random() * max);
}

console.log(chord.extended("Cmaj7"));

for (let i = 0; i < 10; i++) {
	let tones = [];
	for (let j = 0; j < 4; j++) {
		tones.push(notes[rndint(notes.length)]);
	}
	console.log(tones);
	console.log(chord.detect([tones]));
}
