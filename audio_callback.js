
function Ticker(ratio) {
	var self = this;
    this.active = true;
    this.counter = 0;
    this.beat = 0;
    this.ratio = ratio;
    this.nextSample = 0;
    this.bpm = 1;
    this.period = 0;

    this.flt = audioLib.LP12Filter(dev.sampleRate, this.ratio * 440, 4);
    var INV_SECONDS_PER_MIN = 1.0 / 60.0;
    this.meter = Math.round((1.0 / (this.bpm * INV_SECONDS_PER_MIN * (1.0 / dev.sampleRate))));
    this.period = Math.round(this.meter / this.ratio);

    this.setBPM = function(newBPM) {
        if (newBPM > 0) {
            self.bpm = newBPM;
            self.meter = Math.round(1.0 / (self.bpm * INV_SECONDS_PER_MIN * (1.0 / dev.sampleRate)));
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
        var result = 0.0
        if (self.active)
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
        for (var t = 0; t < Ticker.prototype.tickers.length; ++t) {
            sample += Ticker.prototype.tickers[t].tick();
        }
        buffer[i] = sample;
    }
}

/* callback function that is used to roughly sync the audio and the gui */
var reset = true;
Sink.doInterval(function(){
    if (Ticker.prototype.tickers[master_nome].beat == 1) {
        if (reset) {
            frame = 0;
            reset = false;
        }
    } else {
        reset = true;
    }
    frame++;
}, 1000.0/60.0);
