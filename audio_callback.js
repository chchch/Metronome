Ticker.prototype.bpm = 60;
Ticker.prototype.counter = 0;
Ticker.prototype.measure_length = 1;
Ticker.prototype.INV_SECONDS_PER_MIN = 1.0 / 60.0;

function Ticker(ratio) {
	var self = this;
    this.active = true;
    this.beat = 0;
    this.ratio = ratio;
    this.nextSample = 0;
    this.period = 0;

    this.flt = audioLib.LP12Filter(dev.sampleRate, this.ratio * 440, 4);
    this.period = 0

    this.bpmUpdated = function() {
        self.period = Math.round(Ticker.prototype.measure_length / self.ratio);
    };

    this.setRatio = function(ratio) {
        self.ratio = ratio;
        self.bpmUpdated()
    }

    this.tick = function() {
        while (Ticker.prototype.counter >= Ticker.prototype.measure_length) {
            Ticker.prototype.counter -= Ticker.prototype.measure_length;
            self.beat = 0;
        }
        if (Ticker.prototype.counter % self.period == 0) {
            self.nextSample = 1.0;
            ++self.beat;
        }
        var result = 0.0
        if (self.active)
            result = self.flt.pushSample(self.nextSample);
        self.nextSample = 0.0;
        return result;
    }
};

Ticker.prototype.setBPM = function(newBPM) {
    if (newBPM > 0) {
        Ticker.prototype.bpm = newBPM;
        Ticker.prototype.measure_length = Math.round(1.0 / (Ticker.prototype.bpm * Ticker.prototype.INV_SECONDS_PER_MIN * (1.0 / dev.sampleRate)));
        for (var t = 0; t < Ticker.prototype.tickers.length; ++t)
            Ticker.prototype.tickers[t].bpmUpdated();
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
        ++Ticker.prototype.counter;
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
    ++frame;
}, 1000.0/60.0);
