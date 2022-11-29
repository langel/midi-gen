var fs = require('fs');
var midi = require('jsmidgen');

let file = new midi.File();

// 34 is pizzi bass
let bass = file.addTrack().instrument(0, 34);
let perc = file.addTrack().instrument(9, 0); 

// nes engine variables
let global_counter = 0;
let pattern_root = 0;
let pattern_pos = 0;
let pattern_frame = 0;
let bass_rest = 0;
let perc_rest = 0;

const root_tone = 33; // 2a03 lowest note in midi

const hex = d => Number(d).toString(16).padStart(2, '0')

// nesdev rng handling
let rng0, rng1;
const rng_reset = () => {
	rng0 = 0x11;
	rng1 = 0x7f;
}
const rng_next = rng => {
	if (!(rng & 0x01)) return rng >> 1;
	else return (rng >> 1) ^ 0xd4;
}
const rng_prev = rng => {
	if (!(rng & 0x80)) return (rng << 1) % 256;
	else return ((rng << 1) % 256) ^ 0xa9;
}
const rng_test = () => {
	for (let i = 0; i < 256; i++) {
		console.log(hex(i) + " " + hex(rng0) + " " + hex(rng1));
		rng0 = rng_next(rng0);
		rng1 = rng_prev(rng1);
	}
}

const octoscale = [
	 0,  2,  3,  5,  6,  8,  9, 11, 
	12, 14, 15, 17, 18, 20, 21, 23,
	24, 26,
	// might be bleeding into the majpentscale
	 0,  2,  4,  7,  9,
	12, 14, 16, 19, 21,
	24, 26, 28, 31, 33,
	36, 38, 40, 43, 45,
	38, 40, 19,
	// might be bleeding into periodTableLo
	0xf1, 0x7f, 0x13, 0xad, 0x4d, 0xf3, 0x9d, 0x4c,
	0x00, 0xb8, 0x74, 0x34, 0xf8, 0xbf, 0x89, 0x56,
	0x26, 0xf9, 0xce, 0xa6, 0x80, 0x5c, 0x3a, 0x1a,
	0xfb, 0xd6, 0xc4, 0xab, 0x93, 0x7c, 0x67, 0x52,
	0x3f, 0x2d, 0x1c, 0x0c, 0xfd, 0xef, 0xe1, 0xd5,
	0xc9, 0xbd, 0xb3, 0xa9, 0x9f, 0x96, 0x8e, 0x86,
	0x7e, 0x77, 0x70, 0x6a, 0x64, 0x5e, 0x59, 0x54,
	0x4f, 0x4b, 0x46, 0x42,
];
const majpentscale = [
	 0,  2,  4,  7,  9,
	12, 14, 16, 19, 21,
	24, 26, 28, 31, 33,
	36, 38, 40, 43, 45,
	38, 40, 19
];

/*
110 116 138 116 155 146 110 155
155 123 130 110 164 146 130 138
130 138 155 138 155 146 130 116
110 155 110 164 155 138 130 164
116 110 130 123 146 155 146 155
130 155 164 123 146 110 155 

110 146 155 155 116 138 164 130
110 138 123 138 110 155 130 110
116 110 155 110 164 155 138 130
164*110 155 110 164 155 138 130
164 116 116 110 130 123 146 155
146 155 130 130 155 164 123 146 110
*/

const progression = [
	45, 50, 45, 52, 50, 49, 48, 52,
	46, 46, 45, 48, 47, 50, 51, 50,
	51, 48, 48, 51, 52, 47, 50, 45, 
];

const songs = {
	2: () => {
		if (global_counter % 8) return;
		// check for progression loop
		if (pattern_pos % 12 == 0) {
			pattern_root = progression[pattern_frame % 24];
			pattern_frame++;
		}
		// triangle
		let tri = (pattern_pos ^ rng1) & 7;
		if (tri) {
			tri = pattern_root - 12;
			if (pattern_pos & 1) tri += 12;
			let temp = tri;
			//tri += root_tone;
			//console.log(temp + ' ' + tri);
			bass.addNote(0, tri, 32, bass_rest, 90);
			bass_rest = 0;
		}
		else bass_rest += 32;
		// percussion
		let perc_next = 0;
		let perc_vol = 127;
		// hat
		if (rng0 & 0x06) {
			perc_next = 42;
			perc_vol = 80 + (rng1 >> 5);
		}
		// ghost snare
		if (!(rng1 & 0x0c)) {
			perc_next = 37;
			perc_vol = 64 + (rng0 >> 4);
		}
		// snare
		if (pattern_pos % 12 == 6) {
			perc_next = 38;
			perc_vol = (rng0 % 16) + 111;
		}
		// kick
		if (pattern_pos % 12 == 0) {
			perc_next = 36;
			perc_vol = 127;
		}
			
		if (perc_next) {
			perc.addNote(9, perc_next, 32, perc_rest, perc_vol);
			perc_rest = 0;
		}
		else perc_rest += 32;
		// next tic
		pattern_pos++;
		//pattern_root = octoscale[rng0 & 7];
	},
}

rng_reset();
bass.setTempo(120, 0);
bass.events.push(new midi.MetaEvent({type: midi.MetaEvent.TIME_SIG, data: [6, 3, 24, 8] }));
pattern_frame = 0;
let frame_end = 5000;
for (let i = 0; i < frame_end; i++ ) {
	rng0 = rng_next(rng0);
	rng1 = rng_prev(rng1);
	songs[2]();
	global_counter++;
}

fs.writeFileSync('output/guntner_ingame.mid', file.toBytes(), 'binary');
