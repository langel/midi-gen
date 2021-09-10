const scribble = require('scribbletune');

const chords = scribble.clip({
	notes: 'Cm Em Am CM',
	subdiv: '16n',
	pattern: 'x_-x___-'.repeat(4),
});

scribble.midi(chords, 'output/chords.mid');
