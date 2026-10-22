export class Soundscape{
 constructor(){this.enabled=true;this.nodes=[];this.timer=null;this.step=0;}
 start(){if(!this.enabled)return;this.context=this.context||new(window.AudioContext||window.webkitAudioContext)();this.context.resume();if(this.timer)return;this.timer=setInterval(()=>{if(document.hidden)return;const c=this.context,t=c.currentTime,notes=[261.63,329.63,392,440,523.25,392,329.63,293.66];this.note(notes[this.step++%notes.length]/2,t,.016,2.6);this.note(notes[(this.step+2)%notes.length],t+.3,.009,2.1);if(this.step%4===0){this.note(1568,t+1,.008,.14);this.note(1760,t+1.18,.006,.12);}},2300);}
 note(freq,time,gain,length){const c=this.context,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(freq,time);g.gain.setValueAtTime(0,time);g.gain.linearRampToValueAtTime(gain,time+.025);g.gain.exponentialRampToValueAtTime(.0001,time+length);o.connect(g).connect(c.destination);o.start(time);o.stop(time+length+.02);}
 effect(good=true){if(!this.enabled||!this.context)return;const t=this.context.currentTime;[0,1,2].forEach((n)=>this.note((good?[523.25,659.25,783.99]:[220,196,164.81])[n],t+n*.09,.033,.5));}
 pause(){if(this.timer)clearInterval(this.timer);this.timer=null;if(this.context)this.context.suspend();}
}
