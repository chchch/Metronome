document.getElementById('main').addEventListener('click',e => {
    e.target.textContent = '';
    dev = audioLib.Sink(audioCallback, 1 /* channelCount */);
    master_bpm = 60;
    fpm = 3600; // assuming 60 frames per second
    nome_size = {w:400, h:20};
    animator = new Animator();
    nomes = [];
    var five = new Nome(nome_size.w, nome_size.h, 5);
    var four = new Nome(nome_size.w, nome_size.h, 4);
    curpos = 0;
    master_nome = 0;
	is_chrome = /chrome/.test( navigator.userAgent.toLowerCase() );

    $("#main").sortable({
        items: "div:not(.no-sort)",
        stop: function() {
                var new_master = $("#main .nome:eq(0)").attr('id').split("-")[1];
                if(master_nome != new_master) {
                    master_nome = new_master;
                    Ticker.prototype.setBPM(master_bpm/nomes[master_nome].beats);
                    if(animator.active) {
                        animator.reinit();
                        ClearAll();
                    }
                }
				var neworder = $("#main .nome canvas");
				var neworderform = $("#main .nome form");
				for(var n=0,nn=neworder.length;n<nn;n++) {
					if(n == 0 || n % 2 != 0) {
						neworder[n].style.background = "";
						neworder[n].style.outline = "";
						neworderform[n].style.background = "";
					} else {
						neworder[n].style.background = "rgba(0,0,0,0.25)";
						neworder[n].style.outline = "3px solid rgba(0,0,0,0.25)";
						neworderform[n].style.background = "rgba(0,0,0,0.25)";
					}
				}
             }
        });
    $("#main").append("<div class='no-sort' \
        style='position:relative;margin:0 auto;width:"+(nome_size.w+130)+"px'> \
        <form style='position:absolute;width:100%;height:"+(nome_size.h+7)+"px; \
        top:-3px; background: grey;left:35px'> \
        <div class='no-sort' style='position:absolute;right:5px'> \
        <input id='bpm' type='text' style='width:2em' size='3' max_length='3' \
        value='"+master_bpm+"'></input>BPM</div> \
        <div id='playpause' class='no-sort' \
        style='position:absolute;right:0px;top:"+(nome_size.h+10)+"px;height:"+nome_size.h/2+
		"px;padding: 1px 1px 1px 1px'></div> \
        </form></div>");
    playpause = new PlayPause(nome_size.h / 2);
    playpause.play();
	$("#playpause").css("cursor","pointer");
	$("#playpause").append(playpause.canvas);
    $("#playpause").click(function() {
        if (!animator.active) {
            animator.pause();
            playpause.pause();
        } else {
            animator.pause();
            playpause.play();
        }
    });
	$("#playpause").mouseover(function() {
		$(this).css("background","#cccccc");}).mouseout(function() {
		$(this).css("background","none");});

    $("#bpm").keydown(function(event) {
        var result = numbersonly(document.getElementById("bpm"), event, 999);
        if (result[1]) {
            master_bpm = result[1];
            animator.reinit();
            Ticker.prototype.setBPM(master_bpm/nomes[master_nome].beats);
        }
        return result[0];
    });
    $("#bpm").keyup(function() {
        var result = document.getElementById("bpm").value;
        if (result && master_bpm != result) {
            master_bpm = result;
            animator.reinit();
            Ticker.prototype.setBPM(master_bpm/nomes[master_nome].beats);
        }
    });
    $("#main").append(five.div);
    $("#main").append(four.div);
    $("#main").append("<span id='plus' class='no-sort' style='cursor:"+
			"pointer;position:relative;font-size:20px;padding:0 4px 0 4px'>+</div>");
    $("#plus").click(function() {
        var newnome = new Nome(nome_size.w, nome_size.h, 2);
        $("#plus").before(newnome.div);
        newnome.start();
    });
    $("#plus").mouseover(function() {
		$(this).css("background","#cccccc");}).mouseout(function() {
		$(this).css("background","none");});
 
    Ticker.prototype.setBPM(master_bpm/nomes[master_nome].beats);
    five.start();
    four.start();
},{once: true});

function ClearAll(activeonly) {
    for (var n = 0,nn=nomes.length; n < nn; ++n)
        if(activeonly) {
            if(nomes[n].active) nomes[n].clear();
        } else nomes[n].clear();
}

Nome = function(w, h, beats) {
    var self = this;
    nomes = nomes || [];
    nomes.push(this);
    this.div = document.createElement("div");
    this.div.id = "nome-" + (nomes.length - 1);
    this.div.className = "nome";
    this.canvas = document.createElement("canvas");
	this.canvas.style.cursor = "move";
    this.options = document.createElement("form");
	this.options.style.padding = "6px 3px 6px 1px";
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
    Ticker.prototype.tickers.push(this.ticker);

    $(this.rhythm).keydown(function(event) {
        var result = numbersonly(self.rhythm, event, 99);
        if (result[1]) {
            self.init(result[1]);
            self.ticker.setRatio(result[1]);
            self.clear();
            if(nomes[master_nome] == self && animator.active) {
                animator.reinit();
                Ticker.prototype.setBPM(master_bpm/nomes[master_nome].beats);
                ClearAll(true);
            }
            if (!animator.active || !self.active) self.draw(-1);
        }
        return result[0];
    });
    $(this.rhythm).keyup(function() {
        if (self.rhythm.value && self.beats != self.rhythm.value) {
           self.init(self.rhythm.value);
           self.ticker.setRatio(self.rhythm.value);
           self.clear();
           if(nomes[master_nome] == self && animator.active) {
               animator.reinit();
               Ticker.prototype.setBPM(master_bpm/nomes[master_nome].beats);
               ClearAll(true);
           }
           if (!animator.active || !self.active) self.draw(-1);
       }
    });
    this.options.appendChild(this.playing);
    this.options.appendChild(this.rhythm);
    this.div.appendChild(this.options);
    this.div.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.size = {w:w, h:h};
    this.canvas.width = w;
    this.canvas.height = h;
    this.canvas.style.position = "relative";
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.canvas.style.top = 0 + 'px';
    this.canvas.style.left = 0 + 'px';
//    this.canvas.style.border = "1px solid yellow";
    this.active = false;
    this.beats = beats;

	if(nomes[0] != this && nomes.indexOf(this) % 2 == 0) {
		this.canvas.style.background = "rgba(0,0,0,0.25)";
		this.canvas.style.outline = "3px solid rgba(0,0,0,0.25)";
		this.options.style.background = "rgba(0,0,0,0.25)";
	}
    
	this.clear = function() {
        self.ctx.clearRect(0, 0, self.size.w, self.size.h);
    }
    this.draw = function(d) {
        var whichbeat = d || Math.floor(curpos/self.pixelsperbeat);
        if(whichbeat <= 0) self.clear();
        if (whichbeat >= 0) {
            var lineargrad = self.ctx.createLinearGradient(0, 0, curpos, self.size.h);
            lineargrad.addColorStop(0, "white");
            lineargrad.addColorStop(1, "green");

            self.ctx.fillStyle = lineargrad;
            self.ctx.fillRect(0, 0, curpos, self.size.h);
            self.ctx.fill();
        }
        self.ctx.fillStyle = "red";
        for (var n = 0; n <= whichbeat; ++n)
            self.ctx.fillRect(Math.ceil(n * self.pixelsperbeat), 0, 2, self.size.h);

        self.ctx.fill();
        self.ctx.fillStyle = "green";
        if (whichbeat < self.beats) {
            for (var n = whichbeat + 1; n < self.beats; ++n)
                self.ctx.fillRect(Math.ceil(n * self.pixelsperbeat), 0, 2, self.size.h);
            self.ctx.fill();
        }
    }

    this.animate = self.draw;

    this.init = function(b) {
        if (b) self.beats = b;
        self.pixelsperbeat = self.size.w / self.beats;
    }

    this.start = function() {
        self.init();
        if (!animator.active) self.draw(-1);
        self.active = true;
        animator.enqueue(self);
    }
    this.mute = function() {
        self.active = !self.active;
        self.ticker.active = self.active;
        if (!self.active)
            self.draw(-1);
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
        self.ctx.clearRect(0, 0, self.size, self.size);
        self.ctx.fillStyle = self.color;
        self.ctx.beginPath();
        self.ctx.moveTo(0,0);
        self.ctx.lineTo(self.size, self.size * 0.5);
        self.ctx.lineTo(0, self.size);
        self.ctx.closePath();
        self.ctx.fill();
        Ticker.prototype.playing = false;
    }
    this.pause = function() {
        self.ctx.clearRect(0, 0, self.size, self.size);
        self.ctx.fillStyle = self.color;
        self.ctx.fillRect(0, 0, self.size / 2.5, self.size);
        self.ctx.fillRect(self.size, 0, -self.size / 2.5, self.size);
        Ticker.prototype.playing = true;
    }
    this.clear = function() {
        self.ctx.clearRect(0, 0, self.size, self.size);
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
        if (!self.active) {
            self.active = true;
            if (!self.timer) self.animate();
        }
    }
    this.pause = function() {
        if (!self.active) {
            self.active = true;
            ClearAll(true);
            self.catchup();
            self.reinit();
            if (!self.timer) self.animate();
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
    this.secondspermeasure = 0;
    this.lasttime = 0;
    this.reinit = function() {
        self.secondspermeasure = (60/master_bpm)*nomes[master_nome].beats;
        var ticker = nomes[master_nome].ticker;
        let percentdone;
    if(is_chrome) percentdone = (ticker.counter-dev.sampleRate/4)/ticker.measure_length;
	else percentdone = (ticker.counter-dev.sampleRate/2)/ticker.measure_length;
    curpos = percentdone*nome_size.w; // ugly chrome hack
    }
    this.catchup = function() { 
        self.lasttime = dev.getPlaybackTime()/dev.sampleRate;
    }
    this.animate = function() {
        self.timer = false;
        if (self.active) {
           var curtime = dev.getPlaybackTime()/dev.sampleRate;
           var increment = (curtime-self.lasttime);
           if (curpos < nome_size.w) curpos += (increment/self.secondspermeasure)*nome_size.w;
           else self.reinit();
           self.lasttime = curtime;
           var active = 0;
           for (var i = 0, j = self.queue.length; i < j; i++) {
               if (self.queue[i].active) {
                   self.queue[i].animate();
                   ++active;
               }
           }

           if (active != 0) {
               window.requestAnimationFrame(self.animate);
               self.timer = true;
           } else {
               self.stop();
           }
        }
    }
}

function numbersonly(field, evt, max_n) {
    var maxN = max_n || 99;
    var theEvent = evt || window.event;
    var key = theEvent.which || theEvent.keyCode;
    keychar = String.fromCharCode( key );
    switch (key) {
        case 38: /* UP */
            if (!theEvent.charCode) {
                if (field.value < maxN) ++field.value;
                return [true, field.value];
          }
          break;
      case 40: /* DOWN */
          if (!theEvent.charCode) {
              if (field.value > 1) --field.value;
              return [true, field.value];
          }
          break;
      case null: // control keys
      case 0:
      case 8:
      case 9:
      case 27:
	  case 37: // left arrow
	  case 39: // right arrow
          return [true, false];
      default:
        break;
  }

  if (("0123456789").indexOf(keychar) > -1) {
    return [true, false];
  } else {
    theEvent.returnValue = false;
    if (theEvent.preventDefault) theEvent.preventDefault();
    return [false, false];
  }
}

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0,xx=vendors.length; x < xx && !window.requestAnimationFrame; ++x)
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];

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
