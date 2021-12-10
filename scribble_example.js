const scribble = require('scribbletune');

const clips = ['1032', '2032', '4021', '3052'].map(order =>
	scribble.clip({
		pattern: '[xx][xR]'.repeat(4),
		notes: scribble.arp({
			chords: 'Dm BbM Am FM BbM FM CM Gm',
			count: 8,
			order,
		}),
		accent: 'x-xx--xx',
	})
);

scribble.midi([].concat(...clips), 'output/example.mid');
