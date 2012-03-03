
var meters = [1, 2, 3];
var tickers = new Array();
var bpm_input;

function clamp(min, max, value) { return Math.max(min, Math.min(max, value)); };

function toNumber(field, evt, callback, min, max) {
  var theEvent = evt || window.event;
  var key = theEvent.keyCode || theEvent.which;
  keychar = String.fromCharCode(key);
  switch (key) {
    case  38: /* UP */
        ++field.value;
        field.value = clamp(min, max, field.value);
        callback(field.value);
        return true;
    case 40: /* DOWN */
        --field.value;
        field.value = clamp(min, max, field.value);
        callback(field.value);
        return true;
    case 13: /* Enter */
        field.value = clamp(min, max, field.value);
        callback(field.value);
        return false;
  }
  if (("0123456789").indexOf(keychar) > -1)
      return true;
}

function NumberInput(value, callback, min, max) {
    var self = this;
	this.input = document.createElement("input");
    this.callback = callback;
	this.input.type = "text";
	this.input.value = value;
	this.input.size = 3;
	this.input.maxLength = 3;
	this.input.style.width = "2em";
	this.div = document.createElement("div");
	this.div.appendChild(this.input);
	document.getElementById('main').appendChild(this.div);
	this.input.onkeypress = function(event) { return toNumber(self.input, event, self.callback, min, max); };
};

function Ticker(ratio) {
	var self = this;
    this.SAMPLE_RATE = 44100.0;
    this.counter = 0;
    this.beat = 0;
    this.ratio = ratio;
    this.nextSample = 0;
    this.bpm = 30.0;
    this.period = 0;

    this.flt = audioLib.LP12Filter(this.SAMPLE_RATE, this.ratio * 440, 4);
    var INV_SECONDS_PER_MIN = 1.0 / 60.0;
    this.meter = (1.0 / (this.bpm * INV_SECONDS_PER_MIN * (1.0 / this.SAMPLE_RATE)));
    this.period = Math.round(this.meter / this.ratio);

    this.setBPM = function(newBPM) {
        if (newBPM > 0) {
            self.bpm = newBPM;
            self.meter = 1.0 / (self.bpm * INV_SECONDS_PER_MIN * (1.0 / self.SAMPLE_RATE));
            self.period = Math.round(self.meter / self.ratio);
        }
    };

    this.setRatio = function(ratio) {
        self.ratio = ratio;
        self.setBPM(self.bpm);
    }

	this.meter_input = new NumberInput(self.ratio, self.setRatio, 1, 99);

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

function audioCallback(buffer, channelCount){
    /* TODO: update tickers first, then process their output */
    for (var i = 0; i < buffer.length; ++i)  {
        sample = 0.0;
        for (var t in tickers)
            sample += tickers[t].tick();

        buffer[i] = sample;
    }
}

function setGlobalBPM(bpm) {
    var bpm = parseInt(bpm);
    for (var t in tickers)
        tickers[t].setBPM(bpm);
}

window.addEventListener('load', function(){
    for (var t in meters)
        tickers[t] = new Ticker(meters[t]);

    var hr = document.createElement('hr');
    document.getElementById('main').appendChild(hr);
    setGlobalBPM(80);
    bpm_input = new NumberInput(80, setGlobalBPM, 1, 500);

    // Create an instance of the AudioDevice class
    var dev = audioLib.AudioDevice(audioCallback /* audio callback */, 1 /* channelCount */);
}, true);
