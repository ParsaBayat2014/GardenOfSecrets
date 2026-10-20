/* Original Garden of Secrets chapter-one client. No network dependencies. */
(()=>{'use strict';
const M=GardenModel,$=id=>document.getElementById(id),KEY='turquoise-garden-v1';
let s;try{s=M.restore(localStorage.getItem(KEY));}catch(e){s=M.fresh();}
let selected='',playing=false,busy=false,toastTimer,modalType='',audio,ambientNodes=[],lastFocus;
const names={garden:'حیاط باغ فیروزه',shed:'انبار باغبان',green:'گلخانهٔ مادربزرگ',archive:'اتاق خاطره‌ها'};
const paths={
 key:'M9 13a5 5 0 1 1 4-4L23 19v4h-4v-3h-3l-6-6',
 letter:'M5 3h14l4 4v22H5zM18 3v6h5M9 13h10M9 18h10M9 23h6',
 axe:'M8 27L20 5M14 8Q24 4 28 11L20 17L13 13M7 28l3 1',
 wood:'M8 28L21 4L26 7L13 30zM13 24l3-5',
 oil:'M12 3h8v6l4 5v15H8V14l4-5zM12 7h8M9 19h14M14 22h4',
 cloth:'M4 8l18-4l6 20l-18 5zM8 12l12-3M11 23l11-3M11 11l4 12',
 jug:'M8 12h14v15H8zM11 12V7h8v5M22 14h4v8h-4M8 16L2 10L3 8l6 4',
 tile:'M16 2L30 16L16 30L2 16zM16 8l8 8l-8 8l-8-8z',
 seal:'M10 4h12v9l-3 5v4h7v7H6v-7h7v-4l-3-5zM7 25h18',
 bag:'M7 10h18v18H7zM11 10V6a5 5 0 0 1 10 0v4M12 15v4M20 15v4',
 map:'M3 6l8-3l10 3l8-3v23l-8 3l-10-3l-8 3zM11 3v23M21 6v23',
 book:'M3 4h10l3 3l3-3h10v23H19l-3 3l-3-3H3zM16 7v22M7 10h5M20 10h5M7 16h5M20 16h5',
 settings:'M16 5a11 11 0 1 1-1 0zM16 11a5 5 0 1 0 0 10a5 5 0 0 0 0-10M16 1v4M16 27v4M1 16h4M27 16h4',
 star:'M16 2l4 9l10 1l-7 7l2 11l-9-5l-9 5l2-11l-7-7l10-1z'
};
function icon(id){return '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(paths[id]||paths.tile)+'"/></svg>';}
const director=new GardenDirector({state:()=>s,save,layout:()=>layout(),icon});
director.assets.then(()=>{if(director.images.raha){const c=document.createElement('canvas');c.width=256;c.height=320;c.className='menu-hero';c.setAttribute('aria-hidden','true');c.getContext('2d').drawImage(director.images.raha,0,0,256,320,0,0,256,320);$('menu').prepend(c);}});
function setBusy(value){busy=value;$('game').classList.toggle('interacting',value);for(const id of ['hud','inventory','returnBtn','objective','hotspots','friendTalk']){const el=$(id);if(el)el.inert=value;}}
// Keep queued touches and keyboard activation from interrupting an animation or dialogue.
$('game').addEventListener('click',event=>{if((busy||director.active)&&!$('cinema').contains(event.target)){event.preventDefault();event.stopImmediatePropagation();}},true);
function snapshot(){return {flags:{...s.flags},bag:[...s.bag],scene:s.scene};}
function escapeText(t){return String(t).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));}
function fa(n){return String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);}
function save(){try{localStorage.setItem(KEY,JSON.stringify(s));}catch(e){toast('فضای ذخیره‌سازی در دسترس نیست؛ پیشرفت این جلسه ممکن است حفظ نشود.');}}
function toast(t){clearTimeout(toastTimer);$('toast').textContent=t;$('toast').classList.add('show');toastTimer=setTimeout(()=>$('toast').classList.remove('show'),5500);}
function playTone(good=true){if(!s.sound)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume();[0,1,2].forEach((n)=>{const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=(good?[523.25,659.25,783.99]:[220,196,174.61])[n];g.gain.setValueAtTime(0,audio.currentTime+n*.08);g.gain.linearRampToValueAtTime(.035,audio.currentTime+n*.08+.02);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+n*.08+.38);o.connect(g).connect(audio.destination);o.start(audio.currentTime+n*.08);o.stop(audio.currentTime+n*.08+.4);});}catch(e){}}
function ambience(){if(!s.sound||ambientNodes.length)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume();[130.81,196,261.63].forEach((f,i)=>{let o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=f;g.gain.value=.007/(i+1);o.connect(g).connect(audio.destination);o.start();ambientNodes.push(o);});}catch(e){}}
function silence(){ambientNodes.forEach(o=>{try{o.stop();}catch(e){}});ambientNodes=[];if(audio)audio.suspend();}
// Positions are percentages in the original 1536x1024 illustrations.
const spots={
 garden:[['pot',13,71,'گلدان رز','pot'],['shed',24,43,'انبار باغبان'],['green',55,33,'گلخانه'],['manor',80,44,'درِ عمارت'],['fountain',55,67,'حوض باغ'],['bench',88,73,'نیمکت کاشی‌کاری']],
 shed:[['box',23,40,'جعبه‌ابزار'],['handle',36,56,'دستهٔ تبر','handle'],['letter',58,50,'نامهٔ روی میز'],['oil',90,22,'بطری روغن','oil']],
 green:[['cloth',8,68,'دستمال سفید','cloth'],['jug',17,55,'آب‌پاش','jug'],['flowers',54,53,'پلاک گل‌ها'],['valve',85,59,'شیر آب'],['gold',60,35,'محفظهٔ کاشی‌کاری','gold']],
 archive:[['clock',20,48,'ساعت قدیمی'],['desk',52,65,'میز تحریر'],['cabinet',82,59,'صندوق اسناد'],['portrait',52,32,'عکس مادربزرگ']]
};
const relevant={pot:'pot',shed:'shed',letter:'letter',box:'box',handle:'handle',oil:'oil',green:'green',cloth:'cloth',jug:'jug',flowers:'flowers',valve:'valve',water:'valve',gold:'gold',outer:'manor',boards:'manor',inner:'manor',washed:'fountain',tile:'fountain',mosaic:'bench',archive:'manor',clock:'clock',seal:'clock',cabinet:'cabinet',deed:'cabinet',ending:'desk'};
function position(el,x,y){const w=$('world').clientWidth,h=$('world').clientHeight,scale=(playing?Math.min:Math.max)(w/1536,h/1024);el.style.left=((w-1536*scale)/2+x/100*1536*scale)+'px';el.style.top=((h-1024*scale)/2+y/100*1024*scale)+'px';}
function layout(){document.querySelectorAll('[data-x]').forEach(el=>position(el,+el.dataset.x,+el.dataset.y));}
function hotspots(){const host=$('hotspots');host.replaceChildren();const goal=M.current(s);for(const [id,x,y,label,hide] of spots[s.scene]){if(hide&&s.flags[hide])continue;const b=document.createElement('button');b.className='hotspot'+(relevant[goal[0]]===id?' important':'');b.dataset.action=id;b.dataset.x=x;b.dataset.y=y;b.setAttribute('aria-label',label);b.innerHTML='<span class="dot">'+(['shed','green','manor'].includes(id)?'↗':'+')+'</span><span class="caption">'+label+'</span>';b.onclick=()=>interact(id);host.append(b);}layout();}
function restoreArt(){const r=$('restoration');r.replaceChildren();if(s.scene!=='garden')return;function add(cls,x,y,w,h){const d=document.createElement('div');d.className=cls;d.dataset.x=x;d.dataset.y=y;d.style.transform='translate(-50%,-50%)';if(w)d.style.width=w;if(h)d.style.height=h;r.append(d);}
 if(s.flags.valve)add('water-effect',55,67,'35%','14%');
 if(s.renovations.includes('roses')){add('garden-roses',10,67);add('garden-roses',92,57);}
 if(s.renovations.includes('lights')){add('glow',74,22);add('glow',93,31);add('glow',55,39);}
 if(s.renovations.includes('water'))add('water-effect',55,63,'5%','9%');
 if(s.flags.outer&&!s.flags.boards){const d=document.createElement('div');d.className='boards';d.dataset.x=80;d.dataset.y=44;d.innerHTML='<i></i><i></i>';r.append(d);}
 layout();}
function render(){
 $('scenery').src='art/'+s.scene+'.webp';$('world').style.backgroundImage='url("art/'+s.scene+'.webp")';$('scenery').alt=names[s.scene];$('place').textContent=names[s.scene];$('stars').innerHTML=icon('star')+fa(s.stars);$('stars').querySelector('svg').style.width='18px';$('stars').querySelector('svg').style.height='18px';$('goal').textContent=M.current(s)[2];$('returnBtn').hidden=s.scene==='garden'||!playing;$('selection').hidden=!selected||!playing;$('selection').textContent=selected?'انتخاب: '+M.items[selected][0]+' · روی محل استفاده بزن':'';
 $('chapter').textContent=GardenStory.actLabel(s.flags);director.setScene(s.scene);
 const bag=$('bag');bag.replaceChildren();if(!s.bag.length){const d=document.createElement('div');d.className='empty';d.textContent='اشیای پیدا شده اینجا قرار می‌گیرند';bag.append(d);}
 s.bag.forEach(id=>{const b=document.createElement('button');b.className='item'+(id===selected?' selected':'');b.dataset.item=id;b.setAttribute('aria-label',M.items[id][0]);b.setAttribute('aria-pressed',String(id===selected));b.innerHTML=icon(M.items[id][1])+'<small>'+M.items[id][0]+'</small>';b.onclick=()=>select(id);bag.append(b);});hotspots();restoreArt();save();
}
function select(id){if(busy||director.active)return;if((selected==='head'&&id==='handle')||(selected==='handle'&&id==='head')){interact('combine');return;}selected=selected===id?'':id;render();if(id==='letter'&&selected)showLetter();}
async function applyResult(result,before,point=[50,55]){
 if(!result.ok){playTone(false);toast(result.text);return;}
 selected='';save();playTone(true);render();
 const flag=M.tasks.find(t=>s.flags[t[0]]&&!before.flags[t[0]]),added=s.bag.find(i=>!before.bag.includes(i));
 if(flag&&flag[0]==='boards')director.burst(...point,'wood');
 if(added)await director.collect(M.items[added][1],...point);else if(flag)await director.celebrate(...point);
 if(flag&&GardenStory.beats[flag[0]])await director.show(flag[0]);
 if(result.ending)ending();else toast(result.text);
}
async function interact(id,answer=''){
 if(busy||director.active)return;setBusy(true);
 try{const point=(spots[s.scene].find(t=>t[0]===id)||[null,50,60]).slice(1,3);if(id!=='combine')await director.approach(...point);const before=snapshot(),result=M.act(s,id,selected,answer);if(result.puzzle){puzzle(result.puzzle,result.text);return result;}await applyResult(result,before,point);return result;}finally{setBusy(false);}
}
function open(content,type='info'){$('toast').classList.remove('show');modalType=type;lastFocus=document.activeElement;$('modalBody').innerHTML=content;$('modal').hidden=false;setTimeout(()=>($('modalBody').querySelector('button')||$('closeModal')).focus(),30);}
function close(){$('modal').hidden=true;modalType='';if(lastFocus&&lastFocus.isConnected)lastFocus.focus();}
function showLetter(){open('<div class="kicker">از دفتر خاطرات مادربزرگ</div><h2>رها جان…</h2><p>اگر برگشتی و درها بسته بودند، از باغ شروع کن. من همیشه کلیدها را جایی می‌گذاشتم که گل‌ها نگهبانشان باشند.</p><p>سه سرو، یک حوض، چهار پنجره؛ این رمزِ جعبهٔ ابزار است. برای رسیدن به خانه، گاهی باید چیزی را از نو ساخت.</p><p>راهِ آب از گلخانه می‌گذرد. به گل‌ها اعتماد کن.</p><p>با عشق، مادربزرگ</p>');}
function puzzle(id,clue){let digits=[0,0,0];const title={box:'قفل جعبه‌ابزار',valve:'شیرِ رمزدار گلخانه',clock:'سه حلقهٔ ساعت'}[id];open('<div class="kicker">سرنخ‌ها را در دفتر می‌توانی دوباره بخوانی</div><h2>'+title+'</h2><p>'+clue+'</p><div class="code">'+digits.map((d,i)=>'<div class="dial"><button data-up="'+i+'" aria-label="افزایش رقم '+fa(i+1)+'">+</button><output id="digit'+i+'">۰</output><button data-down="'+i+'" aria-label="کاهش رقم '+fa(i+1)+'">−</button></div>').join('')+'</div><div id="puzzleError" class="puzzle-error" role="status"></div><button class="primary" id="submitCode">امتحان رمز ←</button>','puzzle');
 document.querySelectorAll('[data-up],[data-down]').forEach(b=>b.onclick=()=>{const up=b.hasAttribute('data-up'),i=+(up?b.dataset.up:b.dataset.down);digits[i]=(digits[i]+(up?1:9))%10;$('digit'+i).textContent=fa(digits[i]);});
 $('submitCode').onclick=async()=>{if(busy)return;const before=snapshot(),r=M.act(s,id,selected,digits.join(''));if(r.ok){setBusy(true);close();try{await applyResult(r,before,(spots[s.scene].find(t=>t[0]===id)||[null,50,55]).slice(1,3));}finally{setBusy(false);}}else{$('puzzleError').textContent='قفل باز نشد. ترتیب سرنخ‌ها را دوباره بررسی کن.';playTone(false);}};
}
function journal(){const count=M.tasks.filter(t=>s.flags[t[0]]).length;open('<div class="kicker">دفتر رها</div><h2>ردّ خاطره‌ها</h2><div class="journal-tabs"><button id="journalClues">سرنخ‌ها</button><button id="journalStory">شخصیت‌ها و داستان</button></div><p>'+fa(count)+' از '+fa(M.tasks.length)+' قدم کشف شده</p><div class="progress"><div style="width:'+count/M.tasks.length*100+'%"></div></div><div class="note"><strong>اکنون: '+M.current(s)[2]+'</strong></div>'+(s.notes.length?s.notes.map(n=>'<div class="note">'+escapeText(n)+'</div>').join(''):'<p>هنوز سرنخی ثبت نشده. گلدان رز را بررسی کن.</p>')+'<button class="subtle" id="letterRead">خواندن نامهٔ مادربزرگ</button>','journal');$('letterRead').disabled=!s.flags.letter;$('letterRead').onclick=showLetter;$('journalClues').onclick=journal;$('journalStory').onclick=storyJournal;}
function storyJournal(){open('<div class="kicker">آدم‌هایی که باغ را خانه کردند</div><h2>چهره‌های باغ</h2><div class="journal-tabs"><button id="backToClues">سرنخ‌ها</button></div><div class="character-list">'+Object.entries(GardenStory.characters).map(([id,c])=>'<div class="character-card"><img src="art/characters/'+id+'-portrait.webp" alt="'+c.name+'"><strong>'+c.name+'</strong><small>'+c.role+'</small></div>').join('')+'</div><p>گفت‌وگوهای کشف‌شده را می‌توانی دوباره ببینی:</p>'+s.storySeen.filter(id=>GardenStory.beats[id]).map(id=>'<button class="story-replay" data-replay="'+id+'">'+GardenStory.beats[id].title+'</button>').join(''),'journal');$('backToClues').onclick=journal;document.querySelectorAll('[data-replay]').forEach(b=>b.onclick=()=>{close();director.show(b.dataset.replay,{replay:true});});}
function map(){const available={garden:true,shed:s.flags.shed,green:s.flags.letter,archive:s.flags.inner};open('<div class="kicker">هر گوشه، یک راز</div><h2>نقشهٔ باغ</h2><div class="locations">'+Object.keys(names).map(id=>'<button class="location" data-place="'+id+'" '+(!available[id]?'disabled':'')+'><img src="art/'+id+'.webp" alt=""><span>'+names[id]+(!available[id]?' · بسته':'')+'</span></button>').join('')+'</div>','map');document.querySelectorAll('[data-place]').forEach(b=>b.onclick=async()=>{if(busy)return;const before=snapshot(),id=b.dataset.place;close();selected='';setBusy(true);try{await applyResult(M.travel(s,id),before);}finally{setBusy(false);}});}
function renovations(){const upgrades=[['roses','باغچهٔ رز','گل‌های تازه کنار مسیر'],['lights','فانوس‌های باغ','نور گرم کنار عمارت'],['water','فوارهٔ حوض','جریان روشنِ آب']];open('<div class="kicker">با هر کشف، یک قدم برای زندگی دوباره</div><h2>بازسازی باغ</h2><p>ستاره‌های تو: '+fa(s.stars)+' ✦ · هر بازسازی ۳ ستاره</p><div class="upgrades">'+upgrades.map(([id,n,d])=>'<button class="upgrade" data-upgrade="'+id+'" '+(s.renovations.includes(id)||s.stars<3||(id==='water'&&!s.flags.valve)?'disabled':'')+'>'+n+'<small>'+d+'</small><small>'+(s.renovations.includes(id)?'✓ انجام شد':id==='water'&&!s.flags.valve?'اول آب را راه بینداز':'۳ ✦')+'</small></button>').join('')+'</div><p>بازسازی‌ها ستارهٔ کشف می‌خواهند؛ پس از یافتن سند و تکمیل هر سه، مهمانی افتتاح باغ را می‌بینی.</p>','renovation');document.querySelectorAll('[data-upgrade]').forEach(b=>b.onclick=async()=>{if(busy)return;if(M.renovate(s,b.dataset.upgrade)){setBusy(true);s.scene='garden';close();render();playTone();try{await director.celebrate(55,60);toast('باغ، یک قدم زیباتر شد.');await inauguration();}finally{setBusy(false);}}});}
async function inauguration(){if(s.flags.ending&&s.renovations.length===3&&!s.storySeen.includes('opening')){await director.show('opening');ending();}}
function settings(){open('<div class="kicker">راز باغ فیروزه · ۰٫۲٫۰</div><h2>تنظیمات</h2><div class="setting"><span>موسیقی و صدا</span><button id="soundToggle">'+(s.sound?'روشن':'خاموش')+'</button></div><div class="setting"><span>حرکت شخصیت‌ها و جلوه‌ها</span><button id="motionToggle">'+(s.motion?'کامل':'کاهش‌یافته')+'</button></div><div class="setting"><span>ادامه از آخرین سرنخ</span><button id="resumeGame">ادامه</button></div><button class="subtle" id="restartBtn">شروع داستان از ابتدا</button><p>پیشرفت خودکار روی همین دستگاه ذخیره می‌شود. گفت‌وگوهای قبلی را از دفتر شخصیت‌ها دوباره ببین.</p>','settings');$('soundToggle').onclick=()=>{s.sound=!s.sound;save();if(s.sound)ambience();else silence();settings();};$('motionToggle').onclick=()=>{s.motion=!s.motion;render();settings();};$('resumeGame').onclick=close;$('restartBtn').onclick=()=>{open('<h2>داستان از ابتدا؟</h2><p>سرنخ‌ها، وسایل، انتخاب‌های گفت‌وگو و بازسازی‌های ذخیره‌شده پاک می‌شوند.</p><button id="confirmReset" class="primary">شروع دوباره</button><button id="cancelReset" class="subtle">ادامهٔ داستان فعلی</button>','confirm');$('cancelReset').onclick=settings;$('confirmReset').onclick=()=>{s=M.fresh();selected='';s.started=true;close();render();intro();};};}
async function intro(){await director.show('intro');toast('روی نشانه‌ها بزن؛ رها به آنجا می‌رود. وسیله را از کیف انتخاب کن و روی محل استفاده بزن.');}
function ending(){const complete=s.storySeen.includes('opening'),future=s.choices.mosaic==='garden'?'باغی باز برای همه، با گلخانه‌ای زنده':'کارگاه هنر و یادگیری برای بچه‌های محله';open('<div class="kicker">'+(complete?'پایان · اولین مهمان‌ها':'راز سند باغ پیدا شد')+'</div><h2>'+(complete?'به خانه خوش آمدی':'خانه‌ای برای همه')+'</h2><p>رها، سهراب و سامان کنار هم باغ را به زندگی برمی‌گردانند. قول رها: '+future+'.</p><p>'+(complete?'با روشن شدن فانوس‌ها و صدای آب، اولین مهمان‌ها از درِ باز باغ وارد می‌شوند. قول مادربزرگ حالا به دست آدم‌های تازه‌ای زنده است.':'هنوز می‌توانی باغ را آمادهٔ اولین مهمان‌ها کنی. هر سه بازسازی را کامل کن تا صحنهٔ افتتاح باغ را ببینی.')+'</p><button class="primary" id="endingGo">برگشت به باغ ←</button>'+(complete?'<p class="opening-badge">میراث پنهان · داستان کامل شد</p>':'')+'<p class="kicker">شخصیت‌ها و تصاویر اختصاصی · روایت و طراحی بازی: راز باغ فیروزه</p>','ending');$('endingGo').onclick=async()=>{close();s.scene='garden';render();if(!complete)await inauguration();};}
async function start(){if(playing)return;$('startBtn').disabled=true;$('startBtn').textContent='آماده‌سازی باغ…';await director.assets;playing=true;$('game').classList.add('playing');$('menu').hidden=true;['hud','objective','inventory'].forEach(id=>$(id).hidden=false);s.started=true;render();ambience();if(!s.storySeen.includes('intro')&&!s.flags.ending)await intro();await inauguration();}
function back(){if(director.active){director.finishDialogue(true);return;}if(busy)return;if(!$('modal').hidden){close();return;}if(selected){selected='';render();return;}if(s.scene!=='garden'){M.travel(s,'garden');render();return;}settings();}
for(const [id,ico]of[['notesBtn','book'],['mapBtn','map'],['settingsBtn','settings'],['bagIcon','bag']])$(id).innerHTML=icon(ico);
 $('startBtn').innerHTML=(s.started?'ادامهٔ داستان':'قدم به باغ بگذار')+' <span>←</span>';$('startBtn').onclick=start;$('notesBtn').onclick=journal;$('mapBtn').onclick=map;$('settingsBtn').onclick=settings;$('closeModal').onclick=close;$('hintBtn').onclick=()=>{open('<div class="kicker">راهنمای قدم بعدی</div><h2>'+M.current(s)[2]+'</h2><p>'+M.current(s)[3]+'</p><p>محل: '+names[M.current(s)[1]]+'</p><button id="hintMap" class="primary">دیدن نقشه ←</button>','hint');$('hintMap').onclick=map;};$('renovateBtn').onclick=renovations;$('returnBtn').onclick=()=>{selected='';s.scene='garden';render();};$('portraitContinue').onclick=()=>$('portraitGuard').style.setProperty('display','none','important');
 document.addEventListener('keydown',e=>{if(e.key==='Escape')back();if(e.key==='Tab'&&!$('modal').hidden){const list=[...$('modal').querySelectorAll('button:not(:disabled)')];if(!list.length)return;const first=list[0],last=list[list.length-1];if(e.shiftKey&&document.activeElement===first){last.focus();e.preventDefault();}else if(!e.shiftKey&&document.activeElement===last){first.focus();e.preventDefault();}}});
 window.addEventListener('resize',layout);document.addEventListener('visibilitychange',()=>{if(document.hidden)silence();else if(playing)ambience();});$('scenery').onerror=()=>toast('یکی از تصاویر بارگذاری نشد. لطفاً فایل نصب را دوباره دریافت کن.');
 window.Game={back,pause:silence};render();
})();


