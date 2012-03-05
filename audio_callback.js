
function Ticker(ratio) {
	var self = this;
    this.active = true;
    this.SAMPLE_RATE = 44100.0;
    this.counter = 0;
    this.beat = 0;
    this.ratio = ratio;
    this.nextSample = 0;
    this.bpm = 30.0;
    this.period = 0;

    this.flt = audioLib.LP12Filter(this.SAMPLE_RATE, this.ratio * 440, 4);
    var INV_SECONDS_PER_MIN = 1.0 / 60.0;
    this.meter = Math.round((1.0 / (this.bpm * INV_SECONDS_PER_MIN * (1.0 / this.SAMPLE_RATE))));
    this.period = Math.round(this.meter / this.ratio);

    this.setBPM = function(newBPM) {
        if (newBPM > 0) {
            self.bpm = newBPM;
            self.meter = Math.round(1.0 / (self.bpm * INV_SECONDS_PER_MIN * (1.0 / self.SAMPLE_RATE)));
            self.period = Math.round(self.meter / self.ratio);
        }
    };

    this.setRatio = function(ratio) {
        self.ratio = ratio;
        self.setBPM(self.bpm);
    }

    this.tick = function() {
        while (self.counter >= self.meter) {
            self.counter -= self.meter;
            self.beat = 0;
        }
        if (self.counter % self.period == 0) {
            self.nextSample = 1;
            ++self.beat;
        }
        result = self.flt.pushSample(self.nextSample);
        self.nextSample = 0;
        ++self.counter;
        return result;
    }
};

Ticker.prototype.tickers = new Array();

function audioCallback(buffer, channelCount) {
    /* TODO: update tickers first, then process their output */
    for (var i = 0; i < buffer.length; ++i)  {
        sample = 0.0;
        for (var t in Ticker.prototype.tickers) {
            if (Ticker.prototype.tickers[t].active)
                sample += Ticker.prototype.tickers[t].tick();
        }
        buffer[i] = sample;
    }
}

function identityCallback(buffer, channelCount) { return buffer; };

var last = 0;
Sink.doInterval(function(){ 
    // Get the tick we're at based on latency or zero if output hasn't been initialized yet 
    if (last > Ticker.prototype.tickers[0].counter)
        frame = 0;
    last = Ticker.prototype.tickers[0].counter;
}, 1000/60); 
