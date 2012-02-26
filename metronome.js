$(document).ready(function() {

	master_bpm = 60;
	fpm = 3600; // assuming 60 frames per second
	is_chrome = /chrome/.test( navigator.userAgent.toLowerCase() );
	animator = new Animator();
	var metronome = new Nome(400,20,5);	
	var four = new Nome(400,20,4);
	var master = metronome.beats;
	bpm = master_bpm/master;
	global_bpm = metronome.beats*bpm;
	$("#main").sortable();
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
	this.options = document.createElement("form");
	this.playing = document.createElement("input");
	this.playing.type = "checkbox";
	this.playing.checked = true;
	this.playing.onclick = function() {self.mute()};
	this.rhythm = document.createElement("input");
	this.rhythm.type = "text";
	this.rhythm.size = 2;
	this.rhythm.maxLength = 2;
	this.rhythm.style.width = "2em";
	this.rhythm.value = beats;
	this.rhythm.onkeypress = function(event) {return numbersonly(self.rhythm,event,self)};
	this.options.appendChild(this.playing);
	this.options.appendChild(this.rhythm);
	this.div.appendChild(this.options); 
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
	this.silent = false;
	this.sound = new PSound(8);
	this.frame = 0;
	this.count = [];
	this.beats = beats;
	
	this.clear = function() {
		self.ctx.clearRect(0,0,self.size.w,self.size.h);
	}
	this.draw = function() {
		self.clear();
		d = Math.floor(self.frame/self.framesperbeat);
		if(!self.silent) {
			var lineargrad = self.ctx.createLinearGradient(0,0,self.size.w*self.frame/self.max,self.size.h);
			lineargrad.addColorStop(0,"white");
			lineargrad.addColorStop(1,"green");

			self.ctx.fillStyle = lineargrad;
			self.ctx.fillRect(0,0,self.size.w*self.frame/self.max,self.size.h);
			self.ctx.fill();
		}	
		self.ctx.fillStyle = "red";
		for(var n=0;n<=d;n++) {
			self.ctx.fillRect(n*self.pixelsperbeat-1,0,2,self.size.h);
		}
		self.ctx.fill();
		self.ctx.fillStyle = "green";
		if(d<self.beats) {
			for(var n=d+1;n<self.beats;n++) {
				self.ctx.fillRect(n*self.pixelsperbeat-1,0,2,self.size.h);
			}
			self.ctx.fill();
		}
	}
	this.animate = function() {
		if(self.frame < self.max) {
			if(!self.silent) self.draw();
				var ss = self.count.indexOf(self.frame);
				if(ss > -1) {
					if(!self.silent) {
						if(is_chrome) self.sound.play();
						else self.sound.cloneNode(false).play();
					}
			}
			self.frame++;
		}
		else {
			self.frame = 0;
		}
	}
	this.reinit = function(b) {
		self.beats = b;
		self.framesperbeat = self.max/self.beats;
		self.pixelsperbeat = self.size.w/self.beats;
		self.count = [];
		for(var n=0;n<self.beats;n++) {
			self.count.push(Math.round(n*self.framesperbeat));
		}
	}
		
	this.start = function() {
		self.max = fpm/bpm;
		self.framesperbeat = self.max/self.beats;
		self.pixelsperbeat = self.size.w/self.beats;
		self.count = [];
		for(var n=0;n<self.beats;n++) {
			self.count.push(Math.round(n*self.framesperbeat));
		}
		self.active = true;
		animator.enqueue(self);		
//		animator.start();
	}
	this.mute = function() {
		if(!self.silent) {
		self.silent = true;  
		self.draw(0);
		}
		else self.silent = false;
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

function numbersonly(field,evt,nome) {
  var theEvent = evt || window.event;
  var key = theEvent.keyCode || theEvent.which;
  keychar = String.fromCharCode( key );
  if(key == 38) { // up
   	if(field.value < 99) field.value++;
   	nome.reinit(field.value);
   	return true;
  }
  else if(key == 40) { // down
   	if(field.value > 1) field.value--;
   	nome.reinit(field.value);
   	return true;
  }
  else  if ((key==null) || (key==0) || (key==8) || 
  	  (key==9) || (key==27) ) // control keys
  		return true;
  	 
  else if (key == 13) {
  	nome.reinit(field.value);
  	return false;
  }
  else if(("0123456789").indexOf(keychar) > -1) {
  		return true;
  }
  else {
    theEvent.returnValue = false;
    if(theEvent.preventDefault) theEvent.preventDefault();
  }
}


/* function numbersonly(myfield, e, dec) {
	var key;
	var keychar;

	if (window.event)
   	key = window.event.keyCode;
	else if (e)
   	key = e.which;
	else
   	return true;
  
	key = e.keyCode;
	keychar = String.fromCharCode(key);

	// control keys
	if ((key==null) || (key==0) || (key==8) || 
  	  (key==9) || (key==13) || (key==27) )
  	 return true;
	
	else if(key == 90) { // up
   	myfield.value++;
   	return true;
   }
   else if(key == 40) { // down
   	myfield.value--;
   	return true;
   }

	// numbers
	else if ((("0123456789").indexOf(keychar) > -1))
   	return true;
	else
   	return false;
} */

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