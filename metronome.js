$(document).ready(function() {

	master_bpm = 60;
	fpm = 3600; // assuming 60 frames per second
    nome_size = {w:400,h:20};
	is_chrome = /chrome/.test( navigator.userAgent.toLowerCase() );
	animator = new Animator();
    nomes = [];
    var five = new Nome(nome_size.w,nome_size.h,5);	
	var four = new Nome(nome_size.w,nome_size.h,4);
    master_nome = 0;
    bpm = Math.round(master_bpm/nomes[master_nome].beats);
	frame = 0;
    max_frame = fpm/bpm;

    $("#main").sortable({
        items: "div:not(.no-sort)",
        stop: function(event,ui) {
                master_nome = $("#main div:eq(2)").attr('id').split("-")[1];
                bpm = Math.round(master_bpm/nomes[master_nome].beats);
                max_frame = fpm/bpm;
                for(var n=0;n<nomes.length;n++) {
                    nomes[n].init();
                }
            }
        });
/*    $("#main").append("<div style='position:relative;margin: 0 \
        auto;width:"+(nome_size.w+120)+"px'><form \
        style='position:absolute;width:100%;height:"+(nome_size.h+6)+"px;top:-3px; \
        border-width:1px 1px 1px 0;border-style:solid;border-color:black;left:35px'> \
        <div style='position:absolute;right:0px'> \
        <input type='text' style='width:2em' size='3' max_length='3' \
        value='60'></input>BPM </div></form></div>"); */
    $("#main").append("<div class='no-sort' \
        style='position:relative;margin: 0 auto;width:"+(nome_size.w+130)+"px'> \
        <form style='position:absolute;width:100%;height:"+(nome_size.h+7)+"px; \
        top:-3px; background: grey;left:35px'> \
        <div style='position:absolute;right:5px'> \
        <input id='bpm' type='text' style='width:2em' size='3' max_length='3' \
        value='60'></input>BPM</div></form></div>");
    $("#bpm").keydown(function(event) {
        var result = numbersonly(document.getElementById("bpm"),event,999);
        if(result[1] != false) {
            master_bpm = result[1];
            bpm = Math.round(master_bpm/nomes[master_nome].beats);
            max_frame = fpm/bpm;
            for(var n=0;n<nomes.length;n++) {
                nomes[n].init();
            }
        }
        return result[0];
    });
	$("#main").append(five.div);
	$("#main").append(four.div);
	$("#main").append("<div id='plus' class='no-sort'>+</div>");
	$("#plus").click(function() {
		var newnome = new Nome(nome_size.w,nome_size.h,2);
		$("#plus").before(newnome.div);
		newnome.start();
	});
	five.start();
	four.start();
	animator.start();

});

Nome = function(w,h,beats) {
	var self = this;
    if(typeof nomes == "undefined") nomes = [];
    nomes.push(this);
	this.div = document.createElement("div");
    this.div.id = "nome-"+(nomes.length-1);
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
	this.rhythm.onkeypress = function(event) {
        var result = numbersonly(self.rhythm,event);
        if(result[1] != false) self.init(result[1]);
        return result[0];
    }
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
	this.count = [];
	this.beats = beats;
	
	this.clear = function() {
		self.ctx.clearRect(0,0,self.size.w,self.size.h);
	}
	this.draw = function(d) {
		self.clear();
		var d = (typeof(d) != "undefined" ? d : Math.floor(frame/self.framesperbeat));
		if(!self.silent) {
			var lineargrad = self.ctx.createLinearGradient(0,0,self.size.w*frame/max_frame,self.size.h);
			lineargrad.addColorStop(0,"white");
			lineargrad.addColorStop(1,"green");

			self.ctx.fillStyle = lineargrad;
			self.ctx.fillRect(0,0,self.size.w*frame/max_frame,self.size.h);
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
		if(!self.silent) self.draw();
			var ss = self.count.indexOf(frame);
			if(ss > -1) {
				if(!self.silent) {
					if(is_chrome) self.sound.play();
					else self.sound.cloneNode(false).play();
				}
	        }
	}
	this.init = function(b) {
		if(b) self.beats = b;
		self.framesperbeat = max_frame/self.beats;
		self.pixelsperbeat = self.size.w/self.beats;
        self.count = [];
		for(var n=0;n<self.beats;n++) {
			self.count.push(Math.round(n*self.framesperbeat));
		}
	}
		
	this.start = function() {
		self.init();
		self.active = true;
		animator.enqueue(self);
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
            frame = 0;
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
           if(frame < max_frame) frame++;
           else frame = 0;
           if(active != 0) {
   	    		window.requestAnimationFrame(self.animate);
   	    		self.timer = true;
           }
           else self.stop();
       	}
	}
}

function numbersonly(field,evt,max_n) {
  var maxN = max_n || 99;
  var theEvent = evt || window.event;
  var key = theEvent.keyCode || theEvent.which;
  keychar = String.fromCharCode( key );
  if(key == 38) { // up
   	if(field.value < maxN) field.value++;
   	return [true,field.value];
  }
  else if(key == 40) { // down
   	if(field.value > 1) field.value--;
   	return [true,field.value];
  }
  else  if ((key==null) || (key==0) || (key==8) || 
  	  (key==9) || (key==27) ) // control keys
  		return [true,false];
  	 
  else if (key == 13) {
  	return [false,field.value];
  }
  else if(("0123456789").indexOf(keychar) > -1) {
  		return [true,false];
  }
  else {
    theEvent.returnValue = false;
    if(theEvent.preventDefault) theEvent.preventDefault();
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
