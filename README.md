# midi-gen
how many midi files can we make?!
doing research on midi generation using node

## module research

### scribbletune
looks great for rhythm and melody
supports all chord shapes but doesn't seem to have custom inversions/voicings
built on jsmidgen and harmonics

### midi-writer-js
seems to be somewhere between scribbletune and jsmidgen
built on tonal-midi

### tonal-midi
converts between midi int values and note name strings

### harmonics
scales and chords arrays generated from string names
lacks inversions/voicings

### jsmidigen
probably our tool of choice
most direct control of output
