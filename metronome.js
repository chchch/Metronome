$(document).ready(function() {
    dev = audioLib.AudioDevice(audioCallback, 1 /* channelCount */);
	master_bpm = 60;
	fpm = 3600; // assuming 60 frames per second
    nome_size = {w:400,h:20};
	is_chrome = /chrome/.test( navigator.userAgent.toLowerCase() );
	animator = new Animator();
    nomes = [];
    var five = new Nome(nome_size.w,nome_size.h,5);	
	var four = new Nome(nome_size.w,nome_size.h,4);
	frame = 0;
    master_nome = 0;

    $("#main").sortable({
        items: "div:not(.no-sort)",
        stop: function(event,ui) {
                master_nome = $("#main .nome:eq(0)").attr('id').split("-")[1];
                InitAll();
             }
        });
    $("#main").append("<div class='no-sort' \
        style='position:relative;margin:0 auto;width:"+(nome_size.w+130)+"px'> \
        <form style='position:absolute;width:100%;height:"+(nome_size.h+7)+"px; \
        top:-3px; background: grey;left:35px'> \
        <div class='no-sort' style='position:absolute;right:5px'> \
        <input id='bpm' type='text' style='width:2em' size='3' max_length='3' \
        value='60'></input>BPM</div> \
        <div id='playpause' class='no-sort' \
        style='position:absolute;right:0px;top:"+(nome_size.h+10)+"px;height:20px; \
        '></div> \
        </form></div>");
    playpause = new PlayPause(nome_size.h/2);
    playpause.play();
    $("#playpause").append(playpause.canvas);
    $("#playpause").click(function() {
        if(!animator.active) {
            animator.pause();
            playpause.pause();
        }
        else {
            animator.pause();
            playpause.play();
        }
    });
    $("#bpm").keypress(function(event) {
        var result = numbersonly(document.getElementById("bpm"),event,999);
        if(result[1]) {
            master_bpm = result[1];
            InitAll();
        }
        return result[0];
    });
    $("#bpm").keyup(function(event) {
        var result = document.getElementById("bpm").value;
        if(result && master_bpm != result) {
            master_bpm = result;
            InitAll();
        }
    });
	$("#main").append(five.div);
	$("#main").append(four.div);
	$("#main").append("<div id='plus' class='no-sort'>+</div>");
	$("#plus").click(function() {
		var newnome = new Nome(nome_size.w,nome_size.h,2);
		$("#plus").before(newnome.div);
        newnome.init();
		newnome.start();
	});
    InitAll();
	five.start();
	four.start();
});

function InitAll() {
    var bpm = master_bpm / nomes[master_nome].beats;
    max_frame = Math.round(fpm/bpm);
    for(var n=0;n<nomes.length;n++) {
        nomes[n].init();
        nomes[n].ticker.setBPM(bpm);
    }
}

Nome = function(w,h,beats) {
	var self = this;
    nomes = nomes || [];
    nomes.push(this);
	this.div = document.createElement("div");
    this.div.id = "nome-"+(nomes.length-1);
	this.div.className = "nome";
    this.canvas = document.createElement("canvas");
	this.options = document.createElement("form");
    this.options.style.paddingRight = "5px";
	this.playing = document.createElement("input");
	this.playing.type = "checkbox";
	this.playing.checked = true;
	this.playing.onclick = function() { self.mute(); };
	this.rhythm = document.createElement("input");
	this.rhythm.type = "text";
	this.rhythm.size = 2;
	this.rhythm.maxLength = 2;
	this.rhythm.style.width = "2em";
	this.rhythm.value = beats;
    this.ticker = new Ticker(beats);
    this.ticker.setBPM(master_bpm);
    Ticker.prototype.tickers.push(this.ticker);

	$(this.rhythm).keypress(function(event) {
        var result = numbersonly(self.rhythm,event,99);
        if(result[1]) {
            self.init(result[1]);
            self.ticker.setRatio(result[1]);
            if(!animator.active || !self.active) self.draw(-1);
        }
        return result[0];
    });
    $(this.rhythm).keyup(function(event) {
        if(self.rhythm.value && self.beats != self.rhythm.value) {
           self.init(self.rhythm.value);
           if(!animator.active || !self.active) self.draw(-1);
       }
    });
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
	this.beats = beats;
	
	this.clear = function() {
		self.ctx.clearRect(0,0,self.size.w,self.size.h);
	}
	this.draw = function(d) {
		self.clear();
		var d = (typeof(d) != "undefined" ? d : Math.floor(frame/self.framesperbeat));
		if(d >= 0) {
            var x = self.size.w * frame / max_frame;
            var lineargrad = self.ctx.createLinearGradient(0,0,x,self.size.h);
			lineargrad.addColorStop(0,"white");
			lineargrad.addColorStop(1,"green");

			self.ctx.fillStyle = lineargrad;
			self.ctx.fillRect(0,0,x,self.size.h);
			self.ctx.fill();
		}	
		self.ctx.fillStyle = "red";
		for(var n=0;n<=d;n++) {
			self.ctx.fillRect(n*self.pixelsperbeat,0,2,self.size.h);
		}
		self.ctx.fill();
		self.ctx.fillStyle = "green";
		if(d<self.beats) {
			for(var n=d+1;n<self.beats;n++) {
				self.ctx.fillRect(n*self.pixelsperbeat,0,2,self.size.h);
			}
			self.ctx.fill();
		}
	}
	this.animate = function() {
		    self.draw();
	}
	this.init = function(b) {
		if(b) self.beats = b;
		self.framesperbeat = max_frame/self.beats;
		self.pixelsperbeat = self.size.w/self.beats;
	}
		
	this.start = function() {
        if(!animator.active) self.draw(-1);
		self.active = true;
		animator.enqueue(self);
	}
	this.mute = function() {
		if(self.active) {
		self.active = false;
		self.draw(-1);
		}
		else {
            self.active = true;
        }
        
	}
}

PlayPause = function(h) {
    var self = this;
    this.canvas = document.createElement("canvas");
    this.canvas.width = h;
    this.canvas.height = h;
    this.size = h;
    this.canvas.style.width = h + "px";
    this.canvas.style.height = h + "px";
    this.ctx = this.canvas.getContext('2d');
    this.color = "black";
    this.play = function() {
        self.ctx.clearRect(0,0,self.size,self.size);
        self.ctx.fillStyle = self.color;
        self.ctx.beginPath();
        self.ctx.moveTo(0,0);
        self.ctx.lineTo(self.size,self.size/2);
        self.ctx.lineTo(0,self.size);
        self.ctx.closePath();
        self.ctx.fill();
        for (n in nomes)
            nomes[n].ticker.active = false;
    }
    this.pause = function() {
        self.ctx.clearRect(0,0,self.size,self.size);
        self.ctx.fillStyle = self.color;
        self.ctx.fillRect(0,0,self.size/2.5,self.size);
        self.ctx.fillRect(self.size,0,-self.size/2.5,self.size);
        for (n in nomes)
            nomes[n].ticker.active = true;
    }
    this.clear = function() {
        self.ctx.clearRect(0,0,self.size,self.size);
    }
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
    this.pause = function() {
        if(!self.active) {
            self.active = true;
            if(!self.timer) self.animate();
        } else {
            self.stop();
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
           if (frame < max_frame) frame++;
           //else frame = 0;
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
  var key = theEvent.which || theEvent.keyCode;
  keychar = String.fromCharCode( key );
  if(key == 38 && !theEvent.charCode) { // up
     	if(field.value < maxN) field.value++;
    	return [true,field.value];
  }
  else if(key == 40 && !theEvent.charCode) { // down
   	    if(field.value > 1) field.value--;
   	    return [true,field.value];
  }
  else  if ((key==null) || (key==0) || (key==8) || 
  	            (key==9) || (key==27) ) // control keys
  		return [true,false];
  
  else if(("0123456789").indexOf(keychar) > -1) {
  		return [true,false];
  }
  else {
    theEvent.returnValue = false;
    if(theEvent.preventDefault) theEvent.preventDefault();
    return [false, false];
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
