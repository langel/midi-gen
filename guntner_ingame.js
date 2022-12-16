const moar = (process.argv[2]);
if (moar) console.log('moar addeded');

var fs = require('fs');
var midi = require('jsmidgen');

let file, filename;
let perc, bass;
let guit, keys;

// nes engine variables
let global_counter = 0;
let pattern_root = 0;
let pattern_pos = 0;
let pattern_frame = 0;
let bass_rest = 0;
let guit_rest = 0;
let perc_rest = 0;

const root_tone = 33; // 2a03 lowest note in midi

const hex = d => Number(d).toString(16).padStart(2, '0')

// nesdev apu_rng handling
let rng0, rng1, rng2;
let apu_rng0, apu_rng1;
const rng_reset = () => {
	rng0 = rng1 = 0x01;
	rng2 = 0xff;
	apu_rng0 = 0x11;
	apu_rng1 = 0x7f;
}
const rng_next = rng => {
	if (!(rng & 0x01)) return rng >> 1;
	else return (rng >> 1) ^ 0xd4;
}
const rng_prev = rng => {
	if (!(rng & 0x80)) return (rng << 1) % 256;
	else return ((rng << 1) % 256) ^ 0xa9;
}
const apu_rng_test = () => {
	for (let i = 0; i < 256; i++) {
		console.log(hex(i) + " " + hex(apu_rng0) + " " + hex(apu_rng1));
		apu_rng0 = apu_rng_next(apu_rng0);
		apu_rng1 = apu_rng_prev(apu_rng1);
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
	0: {
		title: 'rng chord',
		frame_len: 500,
		init: () => {
			keys = file.addTrack().instrument(1, 1);
			bass = file.addTrack().instrument(0, 37);
			// main settings
			bass.setTempo(120, 0);
		},
		process: () => {
			if (global_counter) return;
			// XXX uses global apu_rng not apu_rng
			let pulse1 = root_tone + (rng0 & 0x0f) + 16 + 24;
			let pulse2 = root_tone + (rng1 & 0x0f) + 8 + 24;
			keys.addChord(1, [pulse1, pulse2], 512);
			keys.addNoteOff(1, pulse1, 512);
			let triang = root_tone + (rng2 & 0x0f) + 8 - 12;
			bass.addNote(0, triang, 512);
		},
	},
	1: {
		title: 'sick dingle',
		frame_len: 5000,
		process: () => {
		},
	},
	2: {
		title: 'in game',
		frame_len: 5000,
		init: () => {
			if (moar) {
				keys = file.addTrack().instrument(1, 90);
				guit = file.addTrack().instrument(2, 27);
			}
			// 34 is pizzi bass
			bass = file.addTrack().instrument(0, 34);
			perc = file.addTrack().instrument(9, 0); 
			// main settings
			bass.setTempo(120, 0);
			bass.events.push(new midi.MetaEvent({type: midi.MetaEvent.TIME_SIG, data: [6, 3, 24, 8] }));
		},
		process: () => {
			if (global_counter % 8) return;
			// check for progression loop
			if (pattern_pos % 12 == 0) {
				pattern_root = progression[pattern_frame % 24];
				pattern_frame++;
				// keys
				if (moar) keys.addChord(1, [pattern_root + 12, pattern_root + 19, pattern_root + 24], 384, 50);
			}
			// bass
			let tri = (pattern_pos ^ apu_rng1) & 7;
			if (tri) {
				tri = pattern_root - 12;
				if (pattern_pos & 1) tri += 12;
				let temp = tri;
				//tri += root_tone;
				//console.log(temp + ' ' + tri);
				bass.addNote(0, tri, 32, bass_rest, 70);
				bass_rest = 0;
			}
			else bass_rest += 32;
			// guitar
			if (moar) {
				if (((apu_rng0 & 1) == 0) && ((apu_rng1 & 1) == 0)) {
					let guit_tone = octoscale[(apu_rng0 & 0x7)] + pattern_root;
					guit.addChord(2, [guit_tone + 12, guit_tone + 19], 32, 33);
					guit_rest = 0;
				}
				else if ([0,6].includes(pattern_pos % 12)) {
					guit.addNote(2, pattern_root, 32, 0, 50);
				}
				else if ([3,4,9,10].includes(pattern_pos % 12)) {
					guit.addNote(2, pattern_root + 12, 32, 0, 33);
				}
				else guit.addNoteOff(2, pattern_root, 32, 50);
			}
			// percussion
			let perc_next = 0;
			let perc_vol = 127;
			// hat
			if (apu_rng0 & 0x06) {
				perc_next = 42;
				perc_vol = 80 + (apu_rng1 >> 5);
			}
			// ghost snare
			if (!(apu_rng1 & 0x0c)) {
				perc_next = 37;
				perc_vol = 64 + (apu_rng0 >> 4);
			}
			// snare
			if (pattern_pos % 12 == 6) {
				perc_next = 38;
				perc_vol = (apu_rng0 % 16) + 111;
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
			//pattern_root = octoscale[apu_rng0 & 7];
		},		
	},
	3: {
		title: 'boss intro',
		frame_len: 5000,
		process: () => {
		},
	},
	4: {
		title: 'boss fight',
		frame_len: 5000,
		pitches: [12,0,17,0,0,12,12,0,17,0,0,15,0,0,13,0,0,12],
		lengths: [18,0,10,0,0, 3,18,0,10,0,0, 8,0,0, 8,0,0, 3],
		process: () => {
		},
	},
	5: {
		title: 'game over',
		frame_len: 5000,
		process: () => {
		},
	},
	6: {
		title: 'ending bad',
		frame_len: 5000,
		process: () => {
		},
	},
	7: {
		title: 'ending ok',
		frame_len: 5000,
		process: () => {
		},
	},
	8: {
		title: 'ending good',
		frame_len: 5000,
		process: () => {
		},
	},
}

Object.keys(songs).forEach(song_id => { 
	let song = songs[song_id];
	rng_reset();
	global_counter = 0;
	pattern_frame = 0;
	file = new midi.File();
	filename = 'output/' + song_id + ' GunTneR ' + song.title + '.mid';
	if (typeof song.init == "function") song.init();
	console.log(filename);
	for (let j = 0; j < song.frame_len; j++ ) {
		rng0 = rng_next(rng0);
		rng1 = rng_prev(rng1);
		rng2 = rng_next(rng2);
		apu_rng0 = rng_next(apu_rng0);
		apu_rng1 = rng_prev(apu_rng1);
		song.process();
		global_counter++;
	}
	fs.writeFileSync(filename, file.toBytes(), 'binary');
});

