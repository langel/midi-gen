var fs = require('fs');
var midi = require('jsmidgen');

let file = new midi.File();

let track = file.addTrack().instrument(0, 0x13);
let root = 32;
let bpm = 120;
track.setTempo(bpm);
for (let i = root; i < root + 12 - 3; i++) {
	for (let j = i + 1; j < root + 12 - 2; j++) {
		for (let k = j + 1; k < root + 12 - 1; k++) {
			track.addChord(0, [i, j, k], 64);
		}
		bpm += 1;
		track.setTempo(bpm);
	}
}
root += 7;
for (let i = root; i < root + 12 - 3; i++) {
	for (let j = i + 1; j < root + 12 - 2; j++) {
		for (let k = j + 1; k < root + 12 - 1; k++) {
			for (let l = k + 1; l < root + 12; l++) {
				track.addChord(0, [i, j, k, l], 64);
			}
			bpm += 1;
			track.setTempo(bpm);
		}
	}
}
root += 7;
for (let i = root; i < root + 12 - 4; i++) {
	for (let j = i + 1; j < root + 12 - 3; j++) {
		for (let k = j + 1; k < root + 12 - 2; k++) {
			for (let l = k + 1; l < root + 12 - 1; l++) {
				for (let m = l + 1; m < root + 12; m++) {
					track.addChord(0, [i, j, k, l, m], 64);
				}
				bpm += 1;
				track.setTempo(bpm);
			}
		}
	}
}


fs.writeFileSync('output/bruteforce_chords.mid', file.toBytes(), 'binary');
