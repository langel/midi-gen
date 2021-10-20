const chord = require("@tonaljs/chord");

console.log(chord);

const notes = [ 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B' ];

function rndint(max) {
  return Math.floor(Math.random() * max);
}

console.log(chord.extended("Cmaj7"));
let cminor = ['C', 'D#', 'G'];
console.log(cminor);
console.log(chord.detect(cminor));

for (let i = 0; i < 10; i++) {
	let tones = [];
	let notes_temp = [...notes];
	for (let j = 0; j < 4; j++) {
		let index = rndint(notes_temp.length);
		tones.push(notes_temp[index]);
		notes_temp.splice(index, 1);
	}
	console.log();
	console.log(tones);
	console.log(chord.detect(tones));
}
