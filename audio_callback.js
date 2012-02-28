
var tickers = new Array();

function Ticker(id) {
    this.id = id; 
    this.counter = 0;
    this.beat = 0;
    this.ratio = id + 1;
    this.nextSample = 0;
    this.bpm = 30.0; 
    this.period = 0;
    this.flt = audioLib.LP12Filter(44100, this.ratio * 440, 4);
    var INV_SECONDS_PER_MIN = 1.0 / 60.0;
    this.meter = (1.0 / (this.bpm * INV_SECONDS_PER_MIN * (1.0 / 44100.0)));
    this.period = Math.round(this.meter / this.ratio);

    this.tick = function() {
        while (this.counter >= this.meter) {
            this.counter -= this.meter;
            this.beat = 0;
        }
        if (this.counter % this.period == 0) {
            this.nextSample = 1;
            ++this.beat;
        }
        result = this.flt.pushSample(this.nextSample);
        this.nextSample = 0;
        ++this.counter;
        return result;
    }
};

function audioCallback(buffer, channelCount){
    /* TODO: update tickers first, then process their output */
    for (var i = 0; i < buffer.length; ++i)  {
        sample = 0.0;
        for (var t = 0; t < tickers.length; ++t) {
            sample += tickers[t].tick();
        }
        buffer[i] = sample;
    }
}

window.addEventListener('load', function(){
    // Create an instance of the filter class
    tickers[0] = new Ticker(1);
    tickers[1] = new Ticker(2);
    tickers[2] = new Ticker(4);
    // Create an instance of the AudioDevice class
    var dev = audioLib.AudioDevice(audioCallback /* callback for the buffer fills */, 1 /* channelCount */);
}, true);
