(function(root){
'use strict';
const items={
 key:['کلید آهنی','key'], letter:['نامهٔ مادربزرگ','letter'], head:['سرِ تبر','axe'], handle:['دستهٔ چوبی','wood'], axe:['تبر تعمیرشده','axe'], oil:['روغن لولا','oil'], cloth:['دستمال','cloth'], jug:['آب‌پاش خالی','jug'], water:['آب‌پاش پر','jug'], gold:['کلید طلایی','key'], tile:['کاشی فیروزه‌ای','tile'], seal:['مهر خانوادگی','seal'], deed:['سند باغ','letter']
};
const tasks=[
 ['pot','garden','گلدان رز را بررسی کن','کلید انبار پشت گلدان بزرگ سمت چپ پنهان است.'],
 ['shed','garden','درِ انبار را باز کن','کلید آهنی را از کیف انتخاب کن و روی درِ انبار بزن.'],
 ['letter','shed','نامهٔ مادربزرگ را پیدا کن','روی کاغذِ میز وسط انبار بزن.'],
 ['box','shed','قفل جعبه‌ابزار را حل کن','نامه را در دفتر بخوان: «سه سرو، یک حوض، چهار پنجره». رمز ۳۱۴ است.'],
 ['handle','shed','دستهٔ تبر را بردار','کنار میز کار سمت چپ، یک دستهٔ چوبی سالم مانده است.'],
 ['axe','shed','تبر را تعمیر کن','در کیف، سرِ تبر را انتخاب کن و سپس روی دستهٔ چوبی بزن.'],
 ['oil','shed','روغن را بردار','بطری کوچک روی قفسهٔ سمت راست را بررسی کن.'],
 ['green','garden','مسیر گلخانه را پیدا کن','بعد از خواندن نامه، روی گلخانهٔ پشت حیاط بزن.'],
 ['cloth','green','دستمال را بردار','روی میز گلخانه، یک پارچهٔ سفید هست.'],
 ['jug','green','آب‌پاش را بردار','کنار پارچه روی میز گلخانه را بررسی کن.'],
 ['flowers','green','راز ترتیب گل‌ها را کشف کن','روی سه گلدان وسط گلخانه بزن؛ اعداد زیر گل‌ها را بخوان.'],
 ['valve','green','آبِ باغ را دوباره راه بینداز','ترتیب رز، زنبق، یاس روی شیر آب نوشته شده؛ رمز ۲۴۱ است.'],
 ['water','green','آب‌پاش را پر کن','آب‌پاش خالی را انتخاب کن و روی شیر آب بزن.'],
 ['gold','green','کلید طلایی را پیدا کن','پس از جریان آب، محفظهٔ کاشی‌کاری وسط گلخانه باز می‌شود.'],
 ['outer','garden','درِ اول عمارت را باز کن','کلید طلایی را روی درِ بزرگ سمت راست استفاده کن.'],
 ['boards','garden','راهِ درِ دوم را آزاد کن','تبر تعمیرشده را روی تخته‌های درِ عمارت استفاده کن.'],
 ['inner','garden','لولای درِ دوم را آزاد کن','روغن را انتخاب کن و روی درِ عمارت بزن.'],
 ['washed','garden','حوض را تمیز کن','دستمال را از کیف انتخاب کن و روی حوض بزن.'],
 ['tile','garden','کاشی گمشده را پیدا کن','حوض تمیز را دوباره بررسی کن.'],
 ['mosaic','garden','نقش نیمکت را کامل کن','کاشی فیروزه‌ای را روی نیمکت سمت راست قرار بده.'],
 ['archive','garden','وارد اتاق خاطره‌ها شو','پس از باز شدن هر دو در، روی ورودی عمارت بزن.'],
 ['clock','archive','ساعت قدیمی را تنظیم کن','رمز روی نیمکت ۷۲۵ است؛ آن را روی ساعت وارد کن.'],
 ['seal','archive','مهر خانوادگی را بردار','کشوی زیر ساعت باز شده است؛ دوباره روی ساعت بزن.'],
 ['cabinet','archive','صندوق اسناد را باز کن','مهر خانوادگی را انتخاب کن و روی صندوق سمت راست بزن.'],
 ['deed','archive','سند باغ را بردار','دوباره صندوق بازشده را بررسی کن.'],
 ['ending','archive','حقیقت باغ را بخوان','سند را روی میز تحریر وسط اتاق بگذار.']
];
function fresh(){return {v:1,scene:'garden',flags:{},bag:[],stars:0,renovations:[],notes:[],sound:true,started:false};}
function restore(raw){try{const s=JSON.parse(raw);if(!s||s.v!==1||!s.flags||!Array.isArray(s.bag))return fresh();const n=fresh();n.flags=Object.fromEntries(tasks.filter(t=>s.flags[t[0]]===true).map(t=>[t[0],true]));n.bag=[...new Set(s.bag.filter(i=>items[i]))];n.scene=['garden','shed','green','archive'].includes(s.scene)?s.scene:'garden';n.stars=Number.isFinite(s.stars)?Math.max(0,Math.min(100,s.stars)):0;n.renovations=Array.isArray(s.renovations)?[...new Set(s.renovations.filter(i=>['roses','lights','water'].includes(i)))]:[];n.notes=Array.isArray(s.notes)?s.notes.filter(x=>typeof x==='string').slice(0,40):[];n.sound=s.sound!==false;n.started=!!s.started;return n;}catch(e){return fresh();}}
function current(s){return tasks.find(t=>!s.flags[t[0]])||['done','garden','باغ، دوباره خانه شد','فصل اول به پایان رسید. می‌توانی باغ را بازسازی کنی و یادداشت‌ها را بخوانی.'];}
function act(s,id,selected='',answer=''){
 const f=s.flags, has=i=>s.bag.includes(i), result={ok:false,text:'این وسیله اینجا کاربردی ندارد.'};
 const scenes={pot:'garden',shed:'garden',green:'garden',manor:'garden',fountain:'garden',bench:'garden',letter:'shed',box:'shed',handle:'shed',oil:'shed',cloth:'green',jug:'green',flowers:'green',valve:'green',gold:'green',clock:'archive',cabinet:'archive',desk:'archive',portrait:'archive',waterFlowers:'green'};
 if(scenes[id]&&scenes[id]!==s.scene)return {ok:false,text:'این وسیله در محل دیگری است.'};
 if(selected&&!has(selected))return {ok:false,text:'این وسیله در کیف نیست.'};
 const note=t=>{if(!s.notes.includes(t))s.notes.push(t);};
 const done=(flag,text,add,remove)=>{if(f[flag])return {ok:false,text:'این کار را قبلاً انجام داده‌ای.'};f[flag]=true;s.stars++;if(add&&!has(add))s.bag.push(add);if(remove)s.bag=s.bag.filter(i=>!remove.includes(i));return {ok:true,text};};
 const need=(item)=>!selected?{ok:false,text:'یک وسیلهٔ مناسب از کیف انتخاب کن.'}:selected!==item?result:null;
 if(id==='pot')return done('pot','رها: این کلید را یادم هست! مادربزرگ همیشه پشت گلدان پنهانش می‌کرد.','key');
 if(id==='shed'){
  if(f.shed){s.scene='shed';return {ok:true,travel:true,text:'انبار باغبان'};}
  return need('key')||done('shed','قفل چرخید. بوی چوب و خاطره از انبار بیرون زد.',null,['key']);
 }
 if(id==='letter'){
  if(f.letter)return {ok:true,text:'«سه سرو، یک حوض، چهار پنجره. جعبه‌ابزار را باز کن. راهِ آب از گلخانه می‌گذرد.» — مادربزرگ'};
  note('نامهٔ مادربزرگ: سه سرو، یک حوض، چهار پنجره. جعبه‌ابزار رمز ۳۱۴ دارد. راهِ آب از گلخانه می‌گذرد.');
  return done('letter','رها: این نامه برای من نوشته شده… چرا کسی آن را پنهان کرده؟','letter');
 }
 if(id==='box'){
  if(f.box)return {ok:false,text:'جعبه‌ابزار خالی است؛ سرِ تبر را برداشته‌ای.'};
  if(!f.letter)return {ok:false,text:'رمز جعبه را نمی‌دانم. شاید نامهٔ روی میز کمک کند.'};
  if(answer!=='314')return {ok:false,puzzle:'box',text:'سه سرو، یک حوض، چهار پنجره'};
  return done('box','در جعبه، سرِ یک تبر قدیمی پیدا شد. دسته‌اش کجاست؟','head');
 }
 if(id==='handle')return done('handle','دستهٔ سالمی پیدا کردی. سرِ تبر و دسته را در کیف با هم ترکیب کن.','handle');
 if(id==='combine'){
  if(!has('head')||!has('handle'))return {ok:false,text:'برای ساخت تبر، سرِ تبر و دستهٔ چوبی لازم است.'};
  return done('axe','تبر تعمیر شد! حالا می‌شود تخته‌های راهرو را کنار زد.','axe',['head','handle']);
 }
 if(id==='oil')return done('oil','روغن لولا برداشته شد. بویش هنوز شبیه انبار قدیمی است.','oil');
 if(id==='green'){
  if(!f.letter)return {ok:false,text:'راه گلخانه زیر پیچک‌ها پنهان است. اول انبار را بگرد.'};
  s.scene='green';if(!f.green)return done('green','رها: گل‌های مادربزرگ هنوز زنده‌اند. کسی اینجا را نگه داشته.');return {ok:true,travel:true,text:'گلخانهٔ مادربزرگ'};
 }
 if(id==='cloth')return done('cloth','دستمال تمیز برداشته شد. برای پاک کردن کاشی‌ها خوب است.','cloth');
 if(id==='jug')return done('jug','آب‌پاش خالی برداشته شد.','jug');
 if(id==='flowers'){
  note('روی پلاک گل‌ها: رز = ۲، زنبق = ۴، یاس = ۱. روی شیر آب: رز ← زنبق ← یاس.');
  if(f.flowers)return {ok:true,text:'رز = ۲، زنبق = ۴، یاس = ۱. ترتیب شیر: رز، زنبق، یاس.'};
  return done('flowers','پلاک‌ها را خواندی: رز ۲، زنبق ۴، یاس ۱. ترتیب روی شیر آب مهم است.');
 }
 if(id==='valve'){
  if(f.valve){if(selected==='jug'&&has('jug'))return done('water','آب‌پاش پر شد. آب دوباره در رگ‌های باغ می‌دود.','water',['jug']);return {ok:true,text:'آب جاری است. اگر آب‌پاش خالی داری، اینجا پرش کن.'};}
  if(!f.flowers)return {ok:false,text:'روی شیر سه نقش گل هست. اول پلاک گلدان‌ها را بخوان.'};
  if(answer!=='241')return {ok:false,puzzle:'valve',text:'رز، زنبق، یاس؛ از چپ به راست'};
  return done('valve','آب راه افتاد! صدای باز شدن محفظهٔ وسط گلخانه آمد.');
 }
 if(id==='gold'){
  if(!f.valve)return {ok:false,text:'این محفظه با فشار آب باز می‌شود. شیر آب را بررسی کن.'};
  return done('gold','کلید طلایی! روی آن نشانِ درِ عمارت حک شده است.','gold');
 }
 if(id==='manor'){
  if(!f.outer)return need('gold')||done('outer','درِ اول باز شد… اما پشت آن یک درِ تخته‌کوب دیگر است.',null,['gold']);
  if(!f.boards)return need('axe')||done('boards','تخته‌ها کنار رفتند. لولای درِ دوم زنگ زده است.');
  if(!f.inner)return need('oil')||done('inner','درِ دوم هم باز شد. راه اتاق خاطره‌ها آزاد است.',null,['oil']);
  s.scene='archive';if(!f.archive)return done('archive','رها: این اتاق از روز رفتن مادربزرگ دست‌نخورده مانده…');return {ok:true,travel:true,text:'اتاق خاطره‌ها'};
 }
 if(id==='fountain'){
  if(!f.valve)return {ok:false,text:'حوض خشک است. باید آب را از گلخانه راه بیندازی.'};
  if(!f.water)return {ok:false,text:'برای تمیز کردن حوض، آب‌پاش را کنار شیر گلخانه پر کن.'};
  if(!f.washed)return need('cloth')||done('washed','لکه‌ها پاک شدند. چیزی زیر رسوب‌ها برق می‌زند.');
  return done('tile','یک کاشی کوچک پیدا شد؛ شکل جای خالیِ نیمکت است.','tile');
 }
 if(id==='bench'){
  if(f.mosaic)return {ok:true,text:'نقش کامل نیمکت: ۷ • ۲ • ۵. شبیه سه شمارهٔ روی ساعت است.'};
  if(!f.tile)return {ok:false,text:'جای یک کاشی در نقش نیمکت خالی است.'};
  const n=need('tile');if(n)return n;note('نقش نیمکت پس از تکمیل: ۷ • ۲ • ۵. رمز ساعت اتاق خاطره‌ها = ۷۲۵.');return done('mosaic','نقش کامل شد: ۷ • ۲ • ۵. این شماره‌ها را به خاطر بسپار. ',null,['tile']);
 }
 if(id==='clock'){
  if(f.clock)return done('seal','مهر خانوادگی در کشوی ساعت پنهان شده بود.','seal');
  if(!f.mosaic)return {ok:false,text:'سه حلقهٔ ساعت قفل‌اند. نقش ناقص نیمکت باغ راهنمای آن است.'};
  if(answer!=='725')return {ok:false,puzzle:'clock',text:'سه شمارهٔ نقش نیمکت را وارد کن'};
  return done('clock','ساعت دوباره تیک‌تاک کرد. کشوی مخفی پایین آن باز شد.');
 }
 if(id==='cabinet'){
  if(!f.cabinet)return need('seal')||done('cabinet','مهر در فرورفتگی جا افتاد. صندوق اسناد باز شد.');
  return done('deed','سند باغ پیدا شد؛ پشت کاغذ، دست‌خط مادربزرگ دیده می‌شود.','deed');
 }
 if(id==='desk'){
  if(f.ending)return {ok:true,ending:true,text:'«این باغ ارث یک نفر نیست؛ خانهٔ همهٔ کسانی است که مراقبش می‌مانند.»'};
  if(!f.deed)return {ok:false,text:'میز آماده است. باید سندِ پنهان را پیدا کنم.'};
  const n=need('deed');if(n)return n;note('سند باغ: باغ فیروزه باید خانهٔ آموزش و دوستی بماند. مادربزرگ آن را به رها سپرد تا درهایش را به روی محله باز کند.');
  const r=done('ending','مادربزرگ باغ را نفروخته بود. او اینجا را برای بچه‌های محله نگه داشته بود. حالا رها باید قولش را زنده کند.');r.ending=true;return r;
 }
 if(id==='portrait')return {ok:true,text:'پشت قاب نوشته شده: «رها جان، رازها برای پنهان شدن نیستند؛ برای پیدا کردن راه‌اند.»'};
 if(id==='waterFlowers'){
  if(!f.water)return {ok:false,text:'اول آب‌پاش را پر کن.'};
  return {ok:true,text:'رها گل‌ها را آب داد. بوی خاک خیس، خاطرهٔ یک عصر قدیمی را برگرداند.'};
 }
 return result;
}
function renovate(s,id){if(!['roses','lights','water'].includes(id)||s.renovations.includes(id)||s.stars<3)return false;if(id==='water'&&!s.flags.valve)return false;s.stars-=3;s.renovations.push(id);return true;}
const api={items,tasks,fresh,restore,current,act,renovate};if(typeof module!=='undefined')module.exports=api;root.GardenModel=api;
})(typeof window!=='undefined'?window:globalThis);
