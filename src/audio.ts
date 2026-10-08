// Original synthesized music: no external recordings or licensed samples.
let context:AudioContext|undefined,enabled=false,timer:ReturnType<typeof setInterval>|undefined,beat=0;
function note(frequency:number,duration:number,gain:number){if(!context||!enabled||document.hidden)return;const osc=context.createOscillator(),amp=context.createGain();osc.type='sine';osc.frequency.value=frequency;osc.connect(amp);amp.connect(context.destination);const now=context.currentTime;amp.gain.setValueAtTime(0,now);amp.gain.linearRampToValueAtTime(gain,now+.02);amp.gain.exponentialRampToValueAtTime(.0001,now+duration);osc.start(now);osc.stop(now+duration+.03);}
export async function toggleAudio(){try{context??=new AudioContext();enabled=!enabled;if(enabled){await context.resume();timer=setInterval(()=>{const notes=[220,261.63,329.63,293.66,196,246.94,293.66,261.63];note(notes[beat++%notes.length],.7,.045);},750);}else{clearInterval(timer);await context.suspend();}return enabled;}catch{enabled=false;return false;}}
export function shutter(){note(1200,.05,.04);}
document.addEventListener('visibilitychange',()=>{if(document.hidden)void context?.suspend();else if(enabled)void context?.resume();});
