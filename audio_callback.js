
var tickers = new Array();

function toNumber(field, evt, ticker) {
  var theEvent = evt || window.event;
  var key = theEvent.keyCode || theEvent.which;
  keychar = String.fromCharCode(key);
  switch (key) {
    case  38: /* UP */
        if (field.value < 99)
            ++field.value;
        ticker.setRatio(field.value);
        return true;
    case 40: /* DOWN */
        if (field.value > 1)
            --field.value;
        ticker.setRatio(field.value);
        return true;
    case 13: /* Enter */
        ticker.setRatio(field.value);
        return false;
  }
  if (("0123456789").indexOf(keychar) > -1)
      return true;
}

function Ticker(id, ratio) {
	var self = this;
    var SAMPLE_RATE = 44100.0;
    this.id = id;
    this.counter = 0;
    this.beat = 0;
    this.ratio = ratio;
    this.nextSample = 0;
    this.bpm = 30.0;
    this.period = 0;
	this.meter_input = document.createElement("input");
	this.meter_input.type = "text";
	this.meter_input.value = this.ratio;
	this.meter_input.size = 2;
	this.meter_input.maxLength = 2;
	this.meter_input.style.width = "2em";
	this.meter_input.onkeypress = function(event) { return toNumber(self.meter_input, event, self); };
	this.div = document.createElement("div");
	this.div.appendChild(this.meter_input); 
	document.getElementById('main').appendChild(this.div);

    this.flt = audioLib.LP12Filter(SAMPLE_RATE, this.ratio * 440, 4);
    var INV_SECONDS_PER_MIN = 1.0 / 60.0;
    this.meter = (1.0 / (this.bpm * INV_SECONDS_PER_MIN * (1.0 / SAMPLE_RATE)));
    this.period = Math.round(this.meter / this.ratio);

    this.setRatio = function(ratio) {
        self.ratio = ratio;
        self.setBPM(this.bpm);
    }

    this.setBPM = function(newBPM) {
        if (newBPM > 0) {
            self.bpm = newBPM;
            self.meter = 1.0 / (self.bpm * INV_SECONDS_PER_MIN * (1.0 / SAMPLE_RATE));
            self.period = Math.round(self.meter / self.ratio);
        }
    };

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
        for (var t = 0; t < tickers.length; ++t) {
            sample += tickers[t].tick();
        }
        buffer[i] = sample;
    }
}

/*
window.addEventListener('click', function() {
                                       var bpm = prompt("Input new bpm", "30");
                                       bpm = parseInt(bpm);
                                       for (var t = 0; t < tickers.length; ++t)
                                            tickers[t].setBPM(bpm);
                                       }, true);
*/

window.addEventListener('load', function(){
    // Create an instance of the filter class
    var meters = [1, 2, 3];
    for (var t = 0; t < 3; ++t) {
        tickers[t] = new Ticker(t, meters[t]);
    }
    // Create an instance of the AudioDevice class
    var dev = audioLib.AudioDevice(audioCallback /* callback for the buffer fills */, 1 /* channelCount */);
}, true);
