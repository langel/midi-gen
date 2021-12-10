var fs = require('fs');
var Midi = require('jsmidgen');

file = new Midi.File();
file
  .addTrack()

    .note(0, 'c4', 32)
    .note(0, 'd4', 32)
    .note(0, 'e4', 32)
    .note(0, 'f4', 32)
    .note(0, 'g4', 32)
    .note(0, 'a4', 32)
    .note(0, 'b4', 32)
    .note(0, 'c5', 32)

    // church organ
    .instrument(0, 0x13)

    // by skipping the third arguments, we create a chord (C major)
    .noteOn(0, 'c4', 64)
    .noteOn(0, 'e4')
    .noteOn(0, 'g4')

    // by skipping the third arguments again, we stop all notes at once
    .noteOff(0, 'c4', 47)
    .noteOff(0, 'e4')
    .noteOff(0, 'g4')

    //alternatively, a chord may be created with the addChord function
    .addChord(0, ['c4', 'e4', 'g4'], 64)

    .noteOn(0, 'c4', 1)
    .noteOn(0, 'e4')
    .noteOn(0, 'g4')
    .noteOff(0, 'c4', 384)
    .noteOff(0, 'e4')
    .noteOff(0, 'g4')
    ;

fs.writeFileSync('output/jsmidgen_example.mid', file.toBytes(), 'binary');
