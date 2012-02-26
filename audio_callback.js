(function(){

var ratio = 0;
window.onkeypress = function() {
    ++ratio;
    if (ratio > 8) {
        ratio = 1;
    }
    console.log(ratio);
};

window.onload = function(){
    var	dev;
    var counter = 0;
    var beat = 0;
    var impulse = 0;
    var bpm = 120.0;
    var INV_SECONDS_PER_MIN = 1.0 / 60.0;
    var meter = (1.0 / (bpm * (INV_SECONDS_PER_MIN) * (1.0 / 44100.0)));
	var dev	= Sink(function(buffer){
        var period = Math.round(meter / ratio);
        for (var i = 0; i < buffer.length; ++i) {
            while (counter >= meter) {
                counter -= meter;
                beat = 0;
            }
            if (counter % period == 0) {
                // it's a beat
                impulse = 1;
                ++beat;
            }
            buffer[i] = impulse;
            impulse = 0;
            ++counter;
		}
	}, 1);

	dev.on('error', function(e) {
		console.error(e);
	});
};
}());
