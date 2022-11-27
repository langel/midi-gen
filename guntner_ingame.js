var fs = require('fs');
var midi = require('jsmidgen');

let file = new midi.File();

let bass = file.addTrack().instrument(0, 34);

// nes engine variables
let frame_counter = 0;
let root_tone = 33; // 2a03 lowest note in midi
let pattern_root = 0;
let pattern_pos = 0;
let rng0 = 0x11;
let rng1 = 0x7f;

const hex = d => Number(d).toString(16).padStart(2, '0')
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

let octoscale = [
	0, 2, 3, 5, 6, 8, 9, 11, 
	12, 14, 15, 17, 18, 20, 21, 23,
	24, 26
];


const songs = {
	2: () => {
		if (frame_counter % 8) return;
	},
}

let frame_end = 256;
for (let i = 0; i < frame_end; i++ ) {
	songs[2]();
	frame_counter++;
	rng0 = rng_next(rng0);
	rng1 = rng_prev(rng1);
}

fs.writeFileSync('output/guntner_ingame.mid', file.toBytes(), 'binary');
