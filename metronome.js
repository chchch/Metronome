$(document).ready(function() {

	bpm = 10;
	fpm = 3600; // assuming 60 frames per second
	is_chrome = /chrome/.test( navigator.userAgent.toLowerCase() );
	animator = new Animator();
	var metronome = new Nome(400,20,5);
	var four = new Nome(400,20,4);
	$("#main").append(metronome.div);
	$("#main").append(four.div);
	metronome.start();
	four.start();
	animator.start();

});

Nome = function(w,h,beats) {
	var self = this;
	this.div = document.createElement("div");
	this.canvas = document.createElement("canvas");
	this.div.appendChild(this.canvas);
	this.ctx = this.canvas.getContext('2d');
	this.size = {w:w,h:h};
	this.canvas.width = w;
	this.canvas.height = h;
	this.canvas.style.position = "relative";
	this.canvas.style.width = w + 'px';
	this.canvas.style.height = h + 'px';
	this.canvas.style.top = 0 + 'px';
	this.canvas.style.left = 0 + 'px';
	this.canvas.style.border = "1px solid yellow";
	this.active = false;
	this.sound = new PSound(8);
	this.frame = 0;
	this.count = 0;
	this.max = fpm/bpm;
	this.beats = beats;
	this.framesperbeat = this.max/this.beats;
	this.pixelsperbeat = this.size.w/this.beats;
	this.clear = function() {
		self.ctx.clearRect(0,0,self.size.w,self.size.h);
	}
	this.draw = function(d) {
		var lineargrad = self.ctx.createLinearGradient(0,0,self.size.w*self.frame/self.max,self.size.h);
		lineargrad.addColorStop(0,"white");
		lineargrad.addColorStop(1,"green");
		self.ctx.fillStyle = lineargrad;
		self.ctx.fillRect(0,0,self.size.w*self.frame/self.max,self.size.h);
		self.ctx.fill();	
		self.ctx.fillStyle = "red";
		for(var n=0;n<=d;n++) {
			self.ctx.fillRect(n*self.pixelsperbeat-1,0,2,self.size.h);
		}
		self.ctx.fill();
	}
	this.animate = function() {
		if(self.frame < self.max) {
			self.draw(self.count-1);
			if(self.frame % this.framesperbeat == 0) {
				if(is_chrome) self.sound.play();
				else self.sound.cloneNode(false).play();
				self.count++;
			}
			self.frame++;
		}
		else {
			self.clear();
			self.frame = 0;
			self.count = 0;
		}
	}
	this.start = function() {
		self.active = true;
		animator.enqueue(self);		
//		animator.start();
	}
}

PSound = function(n) {
	var sine = []; 
	for (var i=0; i<700;i++) {
		ii = 128+Math.round(127*Math.sin(i/n)); 
		sine.push(ii);
	}
	var wave = new RIFFWAVE();
//	wave.header.sampleRate = 44100;
//	wave.header.numChannels = 2;
	wave.Make(sine);
	var audio = new Audio(wave.dataURI);
	return audio;
}

function Animator() {
	var self = this;
	this.timer = false;
	this.active = false;
	this.queue = [];
	this.enqueue = function(AObj) {
		self.queue.push(AObj);
	}
	this.start = function() {
		if(!self.active) {
			self.active = true;
			if(!self.timer) self.animate();
		}
	}
	this.stop = function() {
		self.active = false;
		self.timer = false;
	}
	this.clear = function() {
		self.queue = [];
	}
	this.animate = function() {
		self.timer = false;
		if(self.active) {
			var active = 0;
			for (var i=0,j=self.queue.length; i<j; i++) {
  		    	if (self.queue[i].active) {
  	  	   		self.queue[i].animate();
  	  		  	  	active++;
  	  	  		}
   		}
   		if(active != 0) {
   			window.requestAnimationFrame(self.animate);
   			self.timer = true;
   		}
   		else self.stop();
   	}
	}
}

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
}()); 