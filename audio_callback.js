var flt;
var counter = 0;
var beat = 0;
var ratio = 1;
var impulse = 0;
var bpm = 120.0;
var INV_SECONDS_PER_MIN = 1.0 / 60.0;
var meter = (1.0 / (bpm * INV_SECONDS_PER_MIN * (1.0 / 44100.0)));

function audioCallback(buffer, channelCount){
    var period = Math.round(meter / ratio);
    for (var i = 0; i < buffer.length; ++i)  {
        while (counter >= meter) {
            counter -= meter;
            beat = 0;
        }
        if (counter % period == 0) {
            impulse = 1;
            ++beat;
        }
        buffer[i] = flt.pushSample(impulse);
        impulse = 0;
        ++counter;
    }
}

window.addEventListener('load', function(){
    // Create an instance of the filter class
    flt = audioLib.LP12Filter(44100, 1024, 5);
    // Create an instance of the AudioDevice class
    var dev = audioLib.AudioDevice(audioCallback /* callback for the buffer fills */, 1 /* channelCount */);
}, true);
