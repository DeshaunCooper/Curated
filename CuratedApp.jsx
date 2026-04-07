import { useState, useRef, useEffect, useCallback } from "react";

// ─── SEARCH INTELLIGENCE ─────────────────────────────────────────────────────
const SEARCH_MAP = {
  // Sports / Broadcast
  "pregame":["hype","aggressive","energetic","pump"],"hype":["aggressive","energetic","pump","dark trap"],
  "locker room":["motivational","hype","hip-hop","soul"],"highlight":["action","energetic","cinematic","hype"],
  "dunk":["hype","trap","aggressive","energetic"],"comeback":["emotional","cinematic","orchestral","intense"],
  "workout":["energetic","trap","hip-hop","aggressive"],"warmup":["hype","energetic","electronic","trap"],
  "sports":["hype","energetic","action","cinematic"],"game":["hype","cinematic","electronic","action"],
  "halftime":["soul","r&b","hip-hop","energetic"],"arena":["orchestral","cinematic","hype","epic"],
  // Menu / Ambient
  "menu":["ambient","lo-fi","cinematic","atmospheric"],"loop":["ambient","lo-fi","atmospheric","minimal"],
  "background":["ambient","lo-fi","atmospheric","minimal"],"late night":["lo-fi","r&b","ambient","soulful"],
  "menu loop":["ambient","lo-fi","atmospheric","cinematic"],"waiting room":["ambient","lo-fi","calm"],
  // Film / TV
  "film":["cinematic","orchestral","ambient","tension"],"trailer":["cinematic","action","orchestral","epic"],
  "villain":["dark trap","tension","cinematic","dark"],"hero":["orchestral","cinematic","epic","action"],
  "sad":["ambient","emotional","soul","r&b","melancholic"],"emotional":["ambient","r&b","soul","orchestral"],
  "romantic":["r&b","soul","jazz","pop"],"chase":["action","electronic","hybrid","trap"],
  "opening":["cinematic","orchestral","tension"],"credits":["ambient","orchestral","soul"],
  // Mood
  "dark":["dark trap","tension","cinematic","drill"],"chill":["lo-fi","ambient","jazz","r&b"],
  "uplifting":["gospel","pop","soul","orchestral"],"aggressive":["dark trap","drill","trap","action"],
  "peaceful":["ambient","lo-fi","jazz","atmospheric"],"mysterious":["ambient","cinematic","tension"],
  "epic":["orchestral","cinematic","action","hybrid"],"intense":["dark trap","action","tension"],
  "summer":["pop","afrobeats","r&b"],"night":["lo-fi","r&b","dark trap","ambient"],
  // Natural language
  "no lyrics":["instrumental","beat","ambient","cinematic"],"fast":["trap","electronic","action","energetic"],
  "slow":["ambient","lo-fi","r&b","orchestral"],"clean":["pop","r&b","soul","gospel"],
  "piano":["ambient","orchestral","emotional","cinematic"],"bass":["trap","dark trap","hip-hop","electronic"],
  "strings":["orchestral","cinematic","ambient"],"drum":["trap","hip-hop","electronic","action"],
  "drake":["r&b","hip-hop","trap","soulful"],"kendrick":["hip-hop","dark trap","orchestral"],
  "weeknd":["r&b","dark","pop","ambient"],"interstellar":["ambient","cinematic","orchestral"],
  "nolan":["cinematic","orchestral","tension"],"marvel":["orchestral","action","cinematic","epic"],
};

function doSearch(q, tracks) {
  if (!q.trim()) return [];
  const lq = q.toLowerCase();
  const words = lq.split(/\s+/);
  let genres = [];
  for (const [k,v] of Object.entries(SEARCH_MAP)) {
    if (lq.includes(k)) genres = [...genres, ...v];
  }
  words.forEach(w => { if (SEARCH_MAP[w]) genres = [...genres, ...SEARCH_MAP[w]]; });

  const score = (t) => {
    let s = 0;
    if (t.title.toLowerCase().includes(lq)) s += 10;
    if ((t.desc||"").toLowerCase().includes(lq)) s += 5;
    (t.useCases||[]).forEach(u => { if (u.toLowerCase().includes(lq)) s += 8; });
    (t.tags||[]).forEach(tag => { if (tag.toLowerCase().includes(lq)) s += 4; if (genres.some(g=>g.toLowerCase()===tag.toLowerCase())) s += 3; });
    if ((t.genre||"").toLowerCase().includes(lq)) s += 6;
    if ((t.mood||"").toLowerCase().includes(lq)) s += 6;
    const key = t.bpm && words.find(w=>parseInt(w)&&Math.abs(parseInt(w)-t.bpm)<15);
    if (key) s += 5;
    return s;
  };

  return tracks.map(t=>({t,s:score(t)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).map(x=>x.t);
}

// ─── CATALOG ─────────────────────────────────────────────────────────────────
const TRACKS = [
  {
    id:1, title:"FRACTURE", genre:"Dark Trap", mood:"Tense", bpm:138, key:"Dm", dur:"2:34",
    hookStart:0.35, // 35% into track = hook
    price:{sync:350,bundle:500,exclusive:2500},
    desc:"Hard cinematic trap. Villain reveals, interrogation, confrontation.",
    useCases:["Villain Reveal","Locker Room Intimidation","Highlight Reel","Pregame Hype"],
    useCase1:"Villain scene, pregame intensity, highlight reel",
    tags:["dark trap","cinematic","aggressive","intense","hype","locker room"],
    badge:{owned:true,cleared:true,noSamples:true},
    pack:{wav:true,instrumental:true,clean:true,loop30:true,loop60:true},
    art:"linear-gradient(135deg,#1a0a2e 0%,#0d0d1a 50%,#2a0a1a 100%)",
    section:"featured",
  },
  {
    id:2, title:"SOVEREIGN", genre:"Orchestral", mood:"Epic", bpm:72, key:"Cm", dur:"3:12",
    hookStart:0.28,
    price:{sync:420,bundle:600,exclusive:3000},
    desc:"Sweeping strings, thunderous percussion. Final battles, triumph, revelation.",
    useCases:["Championship Moment","Trailer","Epic Highlight Reel","Opening Titles"],
    useCase1:"Championship moment, epic trailer, game-winning highlight",
    tags:["orchestral","cinematic","epic","hero","trailer","arena","comeback"],
    badge:{owned:true,cleared:true,noSamples:true},
    pack:{wav:true,instrumental:true,clean:false,loop30:true,loop60:true},
    art:"linear-gradient(135deg,#0a1a0d 0%,#001a08 60%,#0a2a10 100%)",
    section:"featured",
  },
  {
    id:3, title:"HOLLOW GROUND", genre:"Ambient", mood:"Melancholic", bpm:60, key:"Am", dur:"2:58",
    hookStart:0.20,
    price:{sync:280,bundle:400,exclusive:2000},
    desc:"Sparse piano, soft texture. Grief, reflection, quiet character moments.",
    useCases:["Emotional Cutscene","Player Tribute","Retirement Ceremony","End Credits"],
    useCase1:"Emotional cutscene, player tribute, retirement moment",
    tags:["ambient","emotional","cinematic","sad","slow","piano","atmospheric","menu loop"],
    badge:{owned:true,cleared:true,noSamples:true},
    pack:{wav:true,instrumental:true,clean:false,loop30:true,loop60:true},
    art:"linear-gradient(135deg,#0d0d1e 0%,#0a0a2a 60%,#15152e 100%)",
    section:"emotional",
  },
  {
    id:4, title:"CIRCUIT", genre:"Electronic", mood:"Urgent", bpm:155, key:"Em", dur:"2:20",
    hookStart:0.15,
    price:{sync:320,bundle:480,exclusive:2200},
    desc:"Propulsive synths, relentless momentum. Chase sequences, adrenaline.",
    useCases:["Fast Break Highlight","Chase Scene","Workout Pump","Arena Intro"],
    useCase1:"Fast break highlight, arena intro, workout energy",
    tags:["electronic","action","energetic","aggressive","fast","hype","sports","warmup"],
    badge:{owned:true,cleared:true,noSamples:true},
    pack:{wav:true,instrumental:true,clean:false,loop30:true,loop60:true},
    art:"linear-gradient(135deg,#1a0505 0%,#2a0808 50%,#1a1005 100%)",
    section:"featured",
  },
  {
    id:5, title:"GOLDEN HOUR", genre:"R&B", mood:"Romantic", bpm:92, key:"F#m", dur:"3:45",
    hookStart:0.30,
    price:{sync:280,bundle:420,exclusive:1800},
    desc:"Warm, soulful production. Breakout vocal territory. An artist's defining record.",
    useCases:["Halftime Show","Late Night Menu","Victory Celebration","Artist Record"],
    useCase1:"Halftime show, late night menu loop, victory celebration",
    tags:["r&b","soul","romantic","soulful","late night","menu","halftime","warm"],
    badge:{owned:true,cleared:true,noSamples:true},
    pack:{wav:true,instrumental:true,clean:true,loop30:true,loop60:true},
    art:"linear-gradient(135deg,#1a1000 0%,#2a1800 50%,#1a0c00 100%)",
    section:"emotional",
  },
  {
    id:6, title:"RITUAL", genre:"Trap", mood:"Dark", bpm:145, key:"Bm", dur:"2:55",
    hookStart:0.25,
    price:{sync:350,bundle:520,exclusive:2500},
    desc:"Distorted 808s, eerie keys. For statements. Uncompromising.",
    useCases:["Fighter Walkout","Pregame Intimidation","Villain Arc","Artist Record"],
    useCase1:"Fighter walkout, pregame intimidation, villain arc",
    tags:["trap","dark trap","aggressive","intense","fast","locker room","pregame","hype"],
    badge:{owned:true,cleared:true,noSamples:true},
    pack:{wav:true,instrumental:true,clean:false,loop30:true,loop60:true},
    art:"linear-gradient(135deg,#160008 0%,#0d0010 50%,#1a001a 100%)",
    section:"featured",
  },
  {
    id:7, title:"OBSIDIAN", genre:"Cinematic", mood:"Mysterious", bpm:88, key:"Gm", dur:"3:01",
    hookStart:0.40,
    price:{sync:380,bundle:560,exclusive:2800},
    desc:"Slow-building tension that erupts. Cold opens, title sequences.",
    useCases:["Game Menu Loop","Documentary Open","Mysterious Montage","Title Sequence"],
    useCase1:"Game menu loop, documentary opener, title sequence",
    tags:["cinematic","atmospheric","mysterious","menu","slow","menu loop","background","game"],
    badge:{owned:true,cleared:true,noSamples:true},
    pack:{wav:true,instrumental:true,clean:false,loop30:true,loop60:true},
    art:"linear-gradient(135deg,#0a1a1a 0%,#001a20 60%,#051515 100%)",
    section:"featured",
  },
  {
    id:8, title:"NORTH STAR", genre:"Hip-Hop", mood:"Introspective", bpm:96, key:"C#m", dur:"3:20",
    hookStart:0.33,
    price:{sync:320,bundle:480,exclusive:2200},
    desc:"Laid-back head-nodder with emotional weight. For artists with something to say.",
    useCases:["Player Documentary","Comeback Narrative","Artist Record","Locker Room Chill"],
    useCase1:"Player documentary, comeback narrative, locker room chill",
    tags:["hip-hop","emotional","introspective","chill","slow","soulful","documentary","locker room"],
    badge:{owned:true,cleared:true,noSamples:true},
    pack:{wav:true,instrumental:true,clean:true,loop30:true,loop60:true},
    art:"linear-gradient(135deg,#0a1018 0%,#050e1a 50%,#0a1520 100%)",
    section:"emotional",
  },
  {
    id:9, title:"SUNDAY GRACE", genre:"Gospel", mood:"Uplifting", bpm:78, key:"Ab", dur:"3:55",
    hookStart:0.38,
    price:{sync:260,bundle:380,exclusive:1800},
    desc:"Full choir energy. Anthemic and cinematic. Built for a moment that moves people.",
    useCases:["Championship Celebration","Team Tribute","Comeback Win","Inspirational Cut"],
    useCase1:"Championship celebration, team tribute, comeback win",
    tags:["gospel","soul","uplifting","emotional","comeback","celebration","inspirational","cinematic"],
    badge:{owned:true,cleared:true,noSamples:true},
    pack:{wav:true,instrumental:true,clean:true,loop30:true,loop60:true},
    art:"linear-gradient(135deg,#001a08 0%,#002a10 50%,#001505 100%)",
    section:"emotional",
  },
  {
    id:10, title:"AFTERGLOW", genre:"Ambient", mood:"Reflective", bpm:55, key:"F", dur:"4:10",
    hookStart:0.25,
    price:{sync:260,bundle:380,exclusive:1600},
    desc:"Gentle, resolving melody. The quiet after the storm — end credits, epilogues.",
    useCases:["End Credits","Season Finale Close","Player Farewell","Menu Background"],
    useCase1:"End credits, season finale, player farewell moment",
    tags:["ambient","atmospheric","peaceful","slow","cinematic","menu","background","menu loop","emotional"],
    badge:{owned:true,cleared:true,noSamples:true},
    pack:{wav:true,instrumental:true,clean:false,loop30:true,loop60:true},
    art:"linear-gradient(135deg,#1a1400 0%,#2a1a00 50%,#1a1200 100%)",
    section:"emotional",
  },
  {
    id:11, title:"NEON COAST", genre:"Pop", mood:"Vibrant", bpm:118, key:"G", dur:"2:48",
    hookStart:0.20,
    price:{sync:240,bundle:360,exclusive:1500},
    desc:"Infectious hook-ready production. Summer playlists, streaming, commercial.",
    useCases:["Commercial Spot","Summer Campaign","Highlight Reel","Brand Content"],
    useCase1:"Commercial spot, summer campaign, lifestyle brand",
    tags:["pop","energetic","summer","uplifting","commercial","bright","fast","hype"],
    badge:{owned:true,cleared:true,noSamples:true},
    pack:{wav:true,instrumental:true,clean:true,loop30:true,loop60:true},
    art:"linear-gradient(135deg,#00101a 0%,#001528 50%,#000d18 100%)",
    section:"latest",
  },
  {
    id:12, title:"3AM", genre:"Lo-Fi", mood:"Nostalgic", bpm:70, key:"Dm", dur:"3:30",
    hookStart:0.15,
    price:{sync:200,bundle:300,exclusive:1200},
    desc:"Warm crackle, soft chords. Late nights, introspection, nostalgia.",
    useCases:["Late Night Menu Loop","Locker Room Cool Down","Chill Montage","Background Atmosphere"],
    useCase1:"Late night menu loop, locker room cooldown, chill montage",
    tags:["lo-fi","ambient","chill","nostalgic","slow","night","late night","menu","menu loop","background","atmospheric"],
    badge:{owned:true,cleared:true,noSamples:true},
    pack:{wav:true,instrumental:true,clean:false,loop30:true,loop60:true},
    art:"linear-gradient(135deg,#0a0a18 0%,#10101a 50%,#080812 100%)",
    section:"latest",
  },
];

const COLLECTIONS = [
  {title:"Locker Room",  desc:"High pressure. High stakes.",color:"#1a0808",accent:"#C4921A",ids:[1,6,4],tag:"Sports"},
  {title:"Menu Loops",   desc:"Atmospheric. Seamless.",     color:"#080818",accent:"#6B3FA0",ids:[7,10,12],tag:"Gaming"},
  {title:"Late Night",   desc:"Soulful and intimate.",      color:"#100a00",accent:"#C4821A",ids:[5,8,12],tag:"R&B"},
  {title:"Cinematic Tension",desc:"For the moment before.", color:"#0a0a1a",accent:"#5080A0",ids:[1,3,7],tag:"Film"},
];

const USE_CASES_QUICK = [
  "Pregame Hype","Locker Room","Highlight Reel","Late Night Menu","Emotional Cutscene",
  "Championship Moment","Fighter Walkout","Documentary","Trailer","Comeback Win",
];

const ADMIN_PASS = "curated2024";
const uid = () => Math.random().toString(36).slice(2,9).toUpperCase();
const fmtDate = () => new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});

function buildContract(track, tierId, b) {
  const labels={sync:"SYNC LICENSE",bundle:"BUNDLE LICENSE",exclusive:"EXCLUSIVE LICENSE"};
  const ref=`CUR-${uid()}-${new Date().getFullYear()}`;
  const L="─".repeat(52);
  return `CURATED  ·  MUSIC LICENSING AGREEMENT
Ref: ${ref}  ·  Date: ${fmtDate()}
${L}
LICENSOR: [YOUR LEGAL NAME] · CURATED · [PRO] · [hello@wedesignsstudio.com]
LICENSEE: ${b.name||"[NAME]"} · ${b.company||"[COMPANY]"}
ARTIST: ${b.artist||"[ARTIST]"}  PROJECT: ${b.project||"[PROJECT]"}
${L}
TRACK: "${track.title}"
GENRE: ${track.genre} · KEY: ${track.key} · BPM: ${track.bpm}
LICENSE: ${labels[tierId]||tierId} · $${track.price[tierId]} USD (non-refundable)
RIGHTS STATUS: 100% Master Owned · 100% Publishing Cleared · No Samples

AI DISCLOSURE: Created under human creative direction of [YOUR LEGAL NAME].
AI used as instrument of production. All IP rights vest in human
author under 17 U.S.C. § 101 et seq.
${L}
GRANT OF RIGHTS
${tierId==="sync"?"Non-exclusive sync license for the use case specified.\nMaster and publishing rights remain with Licensor.\nLicensee may NOT sub-license or resell."
:tierId==="bundle"?"Includes WAV, Instrumental, Clean, 30s and 60s loop versions.\nNon-exclusive. All five files licensed for the specified project."
:"EXCLUSIVE full buyout license. Licensor waives right to re-license\nto any third party after execution. One-time payment."}
${L}
ROYALTIES
ONE-TIME FEE: $${track.price[tierId]} USD · Non-refundable
PERFORMANCE: 100% to Licensor via PRO (ASCAP/BMI/SESAC)
MECHANICAL: All reproductions — streams, downloads, physical
NO BUYOUT UNLESS EXCLUSIVE TIER: Royalty rights perpetual.
${L}
SPLIT SHEET
Composition: [YOUR LEGAL NAME] — 100%
Master:      [YOUR LEGAL NAME] — 100%
Publishing:  [YOUR LEGAL NAME] — 100%
Samples:     NONE — fully original composition
${L}
CREDIT: "[Track Title] by [YOUR NAME] · Licensed via CURATED"
TERRITORY: Worldwide · TERM: Perpetual
${L}
ENFORCEMENT: Breach = immediate termination + $150K/infringement
(17 U.S.C. § 504) + attorney fees + DMCA takedown.
${L}
LICENSOR: _________________________  Date: ${fmtDate()}
LICENSEE: _________________________  Date: __________
${b.name||"_________________________"}
${L}
CURATED © ${new Date().getFullYear()} · Ref: ${ref}
For deals above $10,000 consult a licensed music attorney.
${L}`.trim();
}

// ─── DESIGN ──────────────────────────────────────────────────────────────────
const D = {
  bg:"#0B0B0B",bg2:"#111111",bg3:"#171717",bg4:"#1E1E1E",bg5:"#252525",
  border:"#1E1E1E",border2:"#2A2A2A",border3:"#333",
  text:"#F0F0F0",text2:"#C0C0C0",text3:"#808080",text4:"#484848",
  gold:"#C4921A",goldL:"#E0A820",goldD:"#8A6410",
  green:"#2A8A4A",red:"#E05050",purple:"#6B3FA0",blue:"#3A6A9A",
};

const Tag=({label,c,sm})=>(
  <span style={{background:(c||D.gold)+"18",color:c||D.gold,border:`1px solid ${(c||D.gold)+"28"}`,fontSize:sm?8:9,padding:sm?"1px 6px":"2px 8px",borderRadius:3,fontWeight:700,letterSpacing:0.7,textTransform:"uppercase",whiteSpace:"nowrap"}}>{label}</span>
);

const GBtn=({ch,onClick,v="gold",sm,full,disabled,sx={}})=>{
  const base={border:"none",borderRadius:5,fontWeight:700,cursor:disabled?"not-allowed":"pointer",fontFamily:"'IBM Plex Sans',sans-serif",letterSpacing:0.5,transition:"all 0.15s",opacity:disabled?0.3:1,padding:sm?"5px 12px":"9px 20px",fontSize:sm?10:12,textTransform:"uppercase",display:"inline-flex",alignItems:"center",gap:5,width:full?"100%":undefined,justifyContent:full?"center":undefined};
  const vs={
    gold:{background:`linear-gradient(135deg,${D.gold},${D.goldL})`,color:"#0B0B0B",boxShadow:`0 3px 12px ${D.gold}38`},
    ghost:{background:"transparent",color:D.text3,border:`1px solid ${D.border3}`},
    dark:{background:D.bg3,color:D.text2,border:`1px solid ${D.border2}`},
    outline:{background:"transparent",color:D.gold,border:`1px solid ${D.gold}60`},
    green:{background:D.green+"18",color:D.green,border:`1px solid ${D.green}30`},
    red:{background:"transparent",color:D.red,border:`1px solid ${D.red}28`},
    blue:{background:D.blue+"18",color:D.blue,border:`1px solid ${D.blue}28`},
  };
  return <button onClick={onClick} disabled={disabled} style={{...base,...(vs[v]||vs.gold),...sx}}>{ch}</button>;
};

const Modal=({title,sub,onClose,ch,wide})=>(
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflowY:"auto",backdropFilter:"blur(12px)"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div style={{background:D.bg2,border:`1px solid ${D.border2}`,borderRadius:12,padding:26,width:"100%",maxWidth:wide?820:480,maxHeight:"92vh",overflowY:"auto",boxShadow:`0 32px 80px rgba(0,0,0,0.85)`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div>
          <h2 style={{margin:0,fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:D.text,letterSpacing:2}}>{title}</h2>
          {sub&&<p style={{margin:"3px 0 0",color:D.text3,fontSize:10,fontFamily:"'IBM Plex Sans',sans-serif"}}>{sub}</p>}
        </div>
        <button onClick={onClose} style={{background:"none",border:`1px solid ${D.border2}`,color:D.text4,fontSize:13,cursor:"pointer",padding:"3px 8px",borderRadius:4,marginLeft:14,flexShrink:0}}>✕</button>
      </div>
      {ch}
    </div>
  </div>
);

const Fld=({label,as,children,...p})=>(
  <div style={{marginBottom:11}}>
    {label&&<label style={{display:"block",color:D.text4,fontSize:9,marginBottom:4,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600}}>{label}</label>}
    {as==="textarea"?<textarea {...p} style={{width:"100%",background:D.bg3,border:`1px solid ${D.border2}`,borderRadius:5,color:D.text,padding:"8px 11px",fontSize:12,resize:"vertical",minHeight:64,outline:"none",boxSizing:"border-box",fontFamily:"'IBM Plex Sans',sans-serif"}}/>
    :as==="select"?<select {...p} style={{width:"100%",background:D.bg3,border:`1px solid ${D.border2}`,borderRadius:5,color:D.text,padding:"8px 11px",fontSize:12,outline:"none",boxSizing:"border-box",cursor:"pointer",appearance:"none"}}>{children}</select>
    :<input {...p} style={{width:"100%",background:D.bg3,border:`1px solid ${D.border2}`,borderRadius:5,color:D.text,padding:"8px 11px",fontSize:12,outline:"none",boxSizing:"border-box"}}/>}
  </div>
);

// ─── ZERO-RISK BADGE ─────────────────────────────────────────────────────────
const ZeroBadge=({badge})=>(
  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
    {badge.owned&&<span style={{background:"#2A8A4A18",color:D.green,border:"1px solid #2A8A4A28",fontSize:8,padding:"2px 7px",borderRadius:3,fontWeight:800,letterSpacing:0.7}}>✓ 100% MASTER OWNED</span>}
    {badge.cleared&&<span style={{background:"#2A8A4A18",color:D.green,border:"1px solid #2A8A4A28",fontSize:8,padding:"2px 7px",borderRadius:3,fontWeight:800,letterSpacing:0.7}}>✓ PUBLISHING CLEARED</span>}
    {badge.noSamples&&<span style={{background:"#2A8A4A18",color:D.green,border:"1px solid #2A8A4A28",fontSize:8,padding:"2px 7px",borderRadius:3,fontWeight:800,letterSpacing:0.7}}>✓ NO SAMPLES</span>}
  </div>
);

// ─── TRACK CARD ───────────────────────────────────────────────────────────────
function TrackCard({track,onSelect,onDownload,onPlay,isPlaying,progress,supervisorMode,compact}){
  const [hov,setHov]=useState(false);
  const [previewTimeout,setPreviewTimeout]=useState(null);

  const handleMouseEnter=()=>{
    setHov(true);
    // Auto-hover preview after 600ms
    const t=setTimeout(()=>onPlay(track,true),600);
    setPreviewTimeout(t);
  };
  const handleMouseLeave=()=>{
    setHov(false);
    if(previewTimeout)clearTimeout(previewTimeout);
    if(!isPlaying)return; // let full play continue
  };

  return(
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={()=>onSelect(track)}
      style={{cursor:"pointer",transition:"all 0.22s cubic-bezier(.25,.8,.25,1)",transform:hov?"translateY(-5px)":"translateY(0)",position:"relative"}}>
      {/* Sleeve */}
      <div style={{background:track.art,borderRadius:8,aspectRatio:"1",position:"relative",overflow:"hidden",boxShadow:hov?`0 18px 44px rgba(0,0,0,0.75), 0 0 0 1px ${D.border2}`:`0 5px 18px rgba(0,0,0,0.55), 0 0 0 1px ${D.border}`}}>
        {/* Vinyl peek */}
        <div style={{position:"absolute",right:hov?-6:6,top:"50%",transform:"translateY(-50%)",width:"80%",height:"80%",borderRadius:"50%",background:"radial-gradient(circle,#111 28%,#1a1a1a 29%,#111 44%,#1a1a1a 45%,#111 58%,#222 59%,#111 72%)",opacity:hov?0.95:0,transition:"all 0.28s",boxShadow:"inset 0 0 16px rgba(0,0,0,0.9),0 0 20px rgba(0,0,0,0.5)"}}>
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:13,height:13,borderRadius:"50%",background:D.gold,boxShadow:`0 0 6px ${D.gold}`}}/>
        </div>
        {/* Gradient */}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.85) 0%,transparent 55%)"}}/>
        {/* Playing EQ */}
        {isPlaying&&(
          <div style={{position:"absolute",top:10,right:10,display:"flex",gap:2,alignItems:"flex-end",height:12}}>
            {[5,9,7,11,6].map((h,i)=>(
              <div key={i} style={{width:2,borderRadius:1,background:D.gold,height:h,animation:`eq ${0.35+i*0.1}s ease-in-out infinite alternate`}}/>
            ))}
          </div>
        )}
        {/* Hover controls */}
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",opacity:hov?1:0,transition:"opacity 0.18s",flexDirection:"column",gap:8}}>
          <button onClick={e=>{e.stopPropagation();onPlay(track,false);}} style={{width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${D.gold},${D.goldL})`,border:"none",color:"#0B0B0B",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:`0 4px 18px ${D.gold}55`,zIndex:2}}>
            {isPlaying?"▮▮":"▶"}
          </button>
          {supervisorMode&&(
            <button onClick={e=>{e.stopPropagation();onDownload(track);}} style={{background:"rgba(0,0,0,0.7)",border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.8)",fontSize:9,padding:"4px 10px",borderRadius:20,cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif",fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",zIndex:2}}>
              ⬇ Download Pack
            </button>
          )}
        </div>
        {/* Skip to hook */}
        {hov&&(
          <button onClick={e=>{e.stopPropagation();onPlay(track,true);}} style={{position:"absolute",bottom:8,left:8,background:"rgba(0,0,0,0.7)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.6)",fontSize:8,padding:"3px 8px",borderRadius:20,cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif",fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",zIndex:3}}>
            ▶▶ Skip to Hook
          </button>
        )}
        {/* Bottom info */}
        <div style={{position:"absolute",bottom:10,left:10,right:10}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:compact?16:20,letterSpacing:2,color:"rgba(255,255,255,0.95)",lineHeight:1,textShadow:"0 2px 8px rgba(0,0,0,0.9)"}}>{track.title}</div>
          {!compact&&<div style={{fontSize:8,color:"rgba(255,255,255,0.38)",letterSpacing:1.5,marginTop:2,textTransform:"uppercase",fontFamily:"'IBM Plex Sans',sans-serif"}}>{track.key} · {track.bpm} BPM</div>}
        </div>
        {/* Progress bar if playing */}
        {isPlaying&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:"rgba(255,255,255,0.1)"}}><div style={{width:`${(progress||0)*100}%`,height:"100%",background:D.gold,transition:"width 0.1s"}}/></div>}
      </div>
      {/* Metadata below */}
      <div style={{padding:"9px 2px 0"}}>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:5}}>
          <Tag label={track.mood}/>
          {track.useCases[0]&&<Tag label={track.useCases[0]} c={D.text3} sm/>}
        </div>
        {supervisorMode&&<ZeroBadge badge={track.badge}/>}
        {!compact&&<div style={{fontSize:10,color:D.text4,marginTop:4,fontFamily:"'IBM Plex Sans',sans-serif",lineHeight:1.4}}>{track.useCase1}</div>}
      </div>
    </div>
  );
}

// ─── MINI PLAYER ─────────────────────────────────────────────────────────────
function MiniPlayer({track,isPlaying,onToggle,progress,onExpand,onLicense,onDownload}){
  if(!track)return null;
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:5000,background:`linear-gradient(to right,#0D0D0D,#111)`,borderTop:`1px solid ${D.border2}`,padding:"10px 24px",display:"flex",alignItems:"center",gap:16,boxShadow:"0 -6px 28px rgba(0,0,0,0.7)"}}>
      <div style={{width:40,height:40,borderRadius:6,background:track.art,flexShrink:0,cursor:"pointer"}} onClick={onExpand}/>
      <div style={{minWidth:140,flexShrink:0,cursor:"pointer"}} onClick={onExpand}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:1.5,color:D.text,lineHeight:1}}>{track.title}</div>
        <div style={{fontSize:9,color:D.text3,marginTop:1,fontFamily:"'IBM Plex Sans',sans-serif"}}>{track.genre} · {track.key} · {track.bpm} BPM</div>
      </div>
      <button onClick={onToggle} style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${D.gold},${D.goldL})`,border:"none",color:"#0B0B0B",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
        {isPlaying?"▮▮":"▶"}
      </button>
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:3}}>
        <div style={{height:2,background:D.bg5,borderRadius:1}}>
          <div style={{width:`${(progress||0)*100}%`,height:"100%",background:`linear-gradient(to right,${D.gold},${D.goldL})`,borderRadius:1,transition:"width 0.1s"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:9,color:D.text4,fontFamily:"'IBM Plex Mono',monospace"}}>{track.bpm} BPM · {track.key}</span>
          <span style={{fontSize:9,color:D.text4,fontFamily:"'IBM Plex Mono',monospace"}}>{track.dur}</span>
        </div>
      </div>
      <div style={{display:"flex",gap:7,flexShrink:0}}>
        <GBtn ch="⬇ Download Pack" v="dark" sm onClick={onDownload}/>
        <GBtn ch="License →" v="gold" sm onClick={onLicense}/>
      </div>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App(){
  const [tracks,setTracks]=useState(TRACKS);
  const [supervisorMode,setSupervisorMode]=useState(false);
  const [threePicksMode,setThreePicksMode]=useState(false);
  const [searchQ,setSearchQ]=useState("");
  const [searchRes,setSearchRes]=useState([]);
  const [isSearching,setIsSearching]=useState(false);
  const [playing,setPlaying]=useState(null);
  const [progress,setProgress]=useState({});
  const [selected,setSelected]=useState(null);
  const [licModal,setLicModal]=useState(null);
  const [licTier,setLicTier]=useState("sync");
  const [dlModal,setDlModal]=useState(null);
  const [ctModal,setCtModal]=useState(null);
  const [buyerF,setBuyerF]=useState({name:"",company:"",artist:"",project:"",email:""});
  const [contactModal,setContactModal]=useState(null);
  const [contactF,setContactF]=useState({name:"",company:"",role:"",project:"",medium:"",scene:"",notes:"",email:""});
  const [contactDone,setContactDone]=useState(false);
  const [page,setPage]=useState("home");
  const [authed,setAuthed]=useState(false);
  const [pw,setPw]=useState("");
  const [pwErr,setPwErr]=useState(false);
  const [showUpload,setShowUpload]=useState(false);
  const [uploadForm,setUploadForm]=useState({hookStart:0.3,section:"featured"});
  const [uploadErr,setUploadErr]=useState("");
  const [inbox,setInbox]=useState([
    {id:"INQ-001",date:"March 20, 2026",track:"FRACTURE",name:"Jordan Ellis",company:"Paramount Television",role:"Music Supervisor",project:"Crime Drama S2",medium:"TV Series",scene:"Villain Reveal",notes:"Need a 30-sec edit.",email:"j.ellis@paramount.com",status:"pending"},
    {id:"INQ-002",date:"March 22, 2026",track:"SOVEREIGN",name:"Aisha Monroe",company:"A24",role:"Director",project:"Feature Film",medium:"Film",scene:"Climax",notes:"Interested in exclusivity.",email:"a.monroe@a24.com",status:"pending"},
  ]);
  const audioRefs=useRef({});
  const pending=inbox.filter(r=>r.status==="pending").length;

  const togglePlay=(track,hookJump=false)=>{
    const id=track.id;
    const audio=audioRefs.current[id];
    if(playing===id&&!hookJump){audio?.pause();setPlaying(null);return;}
    Object.values(audioRefs.current).forEach(a=>a?.pause());
    setPlaying(id);
    if(audio){
      if(hookJump&&track.hookStart&&audio.duration){
        audio.currentTime=audio.duration*track.hookStart;
      }
      audio.play().catch(()=>{});
    }
  };

  const handleSearch=(q)=>{
    setSearchQ(q);
    if(q.trim().length>1){setSearchRes(doSearch(q,tracks));setIsSearching(true);}
    else{setIsSearching(false);setSearchRes([]);}
  };

  const openDownload=(track)=>{
    setDlModal(track);
    setBuyerF({name:"",company:"",artist:"",project:"",email:""});
  };

  const openContact=(track)=>{
    setContactF({name:"",company:"",role:"",project:"",medium:"",scene:"",notes:"",email:""});
    setContactDone(false);
    setContactModal(track);
  };

  const submitContact=()=>{
    setInbox(i=>[{id:`INQ-${String(i.length+1).padStart(3,"0")}`,date:fmtDate(),track:contactModal.title,...contactF,status:"pending"},...i]);
    const s=`[CURATED] Sync Request — "${contactModal.title}"`;
    const b=`Track: ${contactModal.title}\nFrom: ${contactF.name} (${contactF.role})\nCompany: ${contactF.company}\nProject: ${contactF.project}\nMedium: ${contactF.medium}\nEmail: ${contactF.email}\nNotes: ${contactF.notes}`;
    window.open(`mailto:hello@wedesignsstudio.com?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(b)}`);
    setContactDone(true);
  };

  const sCol={pending:D.gold,reviewing:D.purple,approved:D.green,declined:D.red};

  const displayTracks=(list)=>supervisorMode
    ?list.filter(t=>t.badge?.owned&&t.badge?.cleared&&t.badge?.noSamples)
    :list;

  const showTracks=(list)=>threePicksMode?displayTracks(list).slice(0,3):displayTracks(list);

  const featured=tracks.filter(t=>t.section==="featured");
  const emotional=tracks.filter(t=>t.section==="emotional");
  const latest=tracks.filter(t=>t.section==="latest");

  const Section=({title,sub,tracks:tList})=>{
    const shown=showTracks(tList);
    if(!shown.length)return null;
    return(
      <section style={{marginBottom:48}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:18}}>
          <div>
            <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:3,color:D.text,margin:0}}>{title}</h2>
            {sub&&<p style={{fontSize:11,color:D.text3,margin:"3px 0 0",fontFamily:"'IBM Plex Sans',sans-serif"}}>{sub}</p>}
          </div>
          <span style={{fontSize:9,color:D.text4,letterSpacing:1,fontWeight:700}}>{shown.length} TRACKS</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fill,minmax(${supervisorMode?"200px":"180px"},1fr))`,gap:16}}>
          {shown.map((t,i)=>(
            <div key={t.id} style={{animation:`up 0.28s ${i*0.06}s both`}}>
              <TrackCard track={t} onSelect={setSelected} onDownload={openDownload} onPlay={togglePlay} isPlaying={playing===t.id} progress={progress[t.id]||0} supervisorMode={supervisorMode}/>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return(
    <>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{background:${D.bg};color:${D.text};font-family:'IBM Plex Sans',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${D.bg}}::-webkit-scrollbar-thumb{background:${D.border3};border-radius:2px}
        @keyframes up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes eq{from{transform:scaleY(0.25)}to{transform:scaleY(1)}}
        @keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}
        @keyframes glow{0%,100%{box-shadow:0 0 12px ${D.gold}40}50%{box-shadow:0 0 24px ${D.gold}80}}
        .srch::placeholder{color:${D.text4}}
        .srch:focus{border-color:${D.gold}!important;outline:none;box-shadow:0 0 0 2px ${D.gold}20}
        input:focus,textarea:focus,select:focus{border-color:${D.gold}!important;outline:none}
        .sup-pill:hover{background:${D.gold}18!important;color:${D.gold}!important}
      `}</style>

      {/* Hidden audio elements — renders for any track with a file */}
      {tracks.filter(t=>t.file).map(t=>(
        <audio key={t.id} ref={el=>audioRefs.current[t.id]=el}
          src={typeof t.file==="string" ? t.file : URL.createObjectURL(t.file)}
          onTimeUpdate={e=>setProgress(p=>({...p,[t.id]:e.target.currentTime/e.target.duration}))}
          onEnded={()=>setPlaying(null)}/>
      ))}

      {/* ── NAV ── */}
      <nav style={{position:"sticky",top:0,zIndex:4000,background:"rgba(11,11,11,0.94)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${D.border}`,padding:"0 28px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:6,color:D.text}}>CURATED</div>
          <div style={{width:4,height:4,borderRadius:"50%",background:D.gold,animation:"pulse 2s infinite"}}/>
        </div>
        {/* CENTER: Supervisor Mode Toggle */}
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={()=>setSupervisorMode(v=>!v)} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 14px",borderRadius:20,border:`1px solid ${supervisorMode?D.gold:D.border3}`,background:supervisorMode?D.gold+"18":"transparent",cursor:"pointer",transition:"all 0.2s",fontFamily:"'IBM Plex Sans',sans-serif",animation:supervisorMode?"glow 2s infinite":undefined}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:supervisorMode?D.gold:D.text4,transition:"all 0.2s",boxShadow:supervisorMode?`0 0 6px ${D.gold}`:undefined}}/>
            <span style={{fontSize:10,fontWeight:700,letterSpacing:1,color:supervisorMode?D.gold:D.text4,textTransform:"uppercase"}}>Supervisor Mode</span>
          </button>
          <button onClick={()=>setThreePicksMode(v=>!v)} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:20,border:`1px solid ${threePicksMode?D.blue:D.border3}`,background:threePicksMode?D.blue+"18":"transparent",cursor:"pointer",transition:"all 0.2s",fontFamily:"'IBM Plex Sans',sans-serif"}}>
            <span style={{fontSize:10,fontWeight:700,letterSpacing:1,color:threePicksMode?D.blue:D.text4,textTransform:"uppercase"}}>3 Picks Only</span>
          </button>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {page==="admin"
            ?<GBtn ch="← Home" v="ghost" sm onClick={()=>setPage("home")}/>
            :<button onClick={()=>setPage("admin")} style={{background:"none",border:`1px solid ${D.border2}`,color:D.text4,fontSize:9,fontWeight:700,letterSpacing:1,padding:"5px 11px",borderRadius:4,cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif",textTransform:"uppercase",position:"relative"}}>
              Admin{pending>0&&<span style={{position:"absolute",top:-3,right:-3,width:7,height:7,borderRadius:"50%",background:D.red}}/>}
            </button>
          }
        </div>
      </nav>

      {/* ── SUPERVISOR MODE BANNER ── */}
      {supervisorMode&&(
        <div style={{background:`linear-gradient(to right,${D.gold}18,${D.gold}08)`,borderBottom:`1px solid ${D.gold}30`,padding:"10px 28px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:D.gold,animation:"pulse 1.5s infinite"}}/>
            <span style={{fontSize:11,fontWeight:700,color:D.gold,letterSpacing:0.5}}>SUPERVISOR MODE ACTIVE</span>
            <span style={{fontSize:10,color:D.text3}}>Showing only pre-cleared, download-ready tracks · All rights verified</span>
          </div>
          <div style={{display:"flex",gap:8}}>
            <span style={{fontSize:9,color:D.green,fontWeight:700,letterSpacing:0.7}}>✓ 100% MASTER OWNED · ✓ PUBLISHING CLEARED · ✓ NO SAMPLES</span>
          </div>
        </div>
      )}

      {/* ══ HOME ══════════════════════════════════════════════════════════════ */}
      {page==="home"&&(
        <>
          {/* ── HERO ── */}
          <section style={{padding:"52px 28px 44px",borderBottom:`1px solid ${D.border}`,maxWidth:1200,margin:"0 auto",width:"100%"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:44,alignItems:"center"}}>
              <div style={{animation:"up 0.4s both"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                  <div style={{width:20,height:1,background:D.gold}}/>
                  <span style={{fontSize:9,color:D.gold,letterSpacing:3,textTransform:"uppercase",fontWeight:700}}>Premium Music Licensing</span>
                </div>
                <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:68,letterSpacing:2,color:D.text,lineHeight:0.92,marginBottom:16}}>
                  A Search Engine<br/><span style={{color:D.gold}}>for Feelings.</span>
                </h1>
                <p style={{fontSize:13,color:D.text2,lineHeight:1.85,maxWidth:400,marginBottom:24,fontFamily:"'IBM Plex Sans',sans-serif"}}>
                  Find, preview, and license music in under 30 seconds. Every track ships with WAV, instrumental, clean, and loop versions. Zero legal risk.
                </p>
                {/* Search */}
                <div style={{position:"relative",maxWidth:480,marginBottom:14}}>
                  <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:D.text4,fontSize:15,pointerEvents:"none"}}>⌕</span>
                  <input className="srch" value={searchQ} onChange={e=>handleSearch(e.target.value)}
                    placeholder='Try "pregame hype", "sad piano 60 bpm", "locker room energy"...'
                    style={{width:"100%",background:D.bg3,border:`1px solid ${D.border2}`,borderRadius:6,padding:"12px 40px 12px 38px",fontSize:12,color:D.text,fontFamily:"'IBM Plex Sans',sans-serif",transition:"all 0.15s"}}/>
                  {searchQ&&<button onClick={()=>{setSearchQ("");setIsSearching(false);}} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:D.text4,cursor:"pointer",fontSize:15,padding:2}}>✕</button>}
                </div>
                {/* Quick use-case pills */}
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {USE_CASES_QUICK.slice(0,8).map(u=>(
                    <button key={u} className="sup-pill" onClick={()=>{handleSearch(u.toLowerCase());}} style={{padding:"4px 11px",borderRadius:20,border:`1px solid ${D.border2}`,background:"transparent",color:D.text4,fontSize:9,fontWeight:700,cursor:"pointer",letterSpacing:0.5,textTransform:"uppercase",transition:"all 0.15s",fontFamily:"'IBM Plex Sans',sans-serif"}}>{u}</button>
                  ))}
                </div>
              </div>
              {/* Vinyl collage */}
              <div style={{position:"relative",height:360,animation:"up 0.5s 0.1s both"}}>
                {tracks.slice(0,4).map((t,i)=>{
                  const pos=[{top:0,left:0,rot:-7,z:1},{top:24,left:90,rot:4,z:2},{top:55,left:175,rot:-5,z:3},{top:8,left:255,rot:6,z:4}][i];
                  return(
                    <div key={t.id} onClick={()=>setSelected(t)} style={{position:"absolute",top:pos.top,left:pos.left,width:185,height:185,cursor:"pointer",zIndex:pos.z,transform:`rotate(${pos.rot}deg)`,transition:"all 0.28s",borderRadius:9,overflow:"hidden",boxShadow:`0 10px 36px rgba(0,0,0,0.65), 0 0 0 1px ${D.border}`}}
                      onMouseEnter={e=>{e.currentTarget.style.transform=`rotate(${pos.rot}deg) scale(1.07) translateY(-7px)`;e.currentTarget.style.zIndex="10";e.currentTarget.style.boxShadow=`0 22px 56px rgba(0,0,0,0.85), 0 0 0 1px ${D.border2}`;}}
                      onMouseLeave={e=>{e.currentTarget.style.transform=`rotate(${pos.rot}deg)`;e.currentTarget.style.zIndex=pos.z;e.currentTarget.style.boxShadow=`0 10px 36px rgba(0,0,0,0.65), 0 0 0 1px ${D.border}`;}} >
                      <div style={{width:"100%",height:"100%",background:t.art,position:"relative"}}>
                        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.75) 0%,transparent 50%)"}}/>
                        <div style={{position:"absolute",bottom:9,left:10}}>
                          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:2,color:"rgba(255,255,255,0.92)"}}>{t.title}</div>
                          <div style={{fontSize:7,color:"rgba(255,255,255,0.35)",letterSpacing:2,textTransform:"uppercase"}}>{t.genre}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Floating info card */}
                <div style={{position:"absolute",bottom:16,right:0,background:`linear-gradient(135deg,${D.bg3},${D.bg4})`,border:`1px solid ${D.border2}`,borderRadius:9,padding:"13px 16px",zIndex:20,boxShadow:`0 12px 36px rgba(0,0,0,0.65)`}}>
                  <div style={{fontSize:7,color:D.gold,letterSpacing:3,textTransform:"uppercase",fontWeight:700,marginBottom:3}}>Ready to License</div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:2,color:D.text}}>Curated Sounds</div>
                  <div style={{fontSize:9,color:D.text3,marginTop:3}}>{tracks.length} tracks · Every pack ready to download</div>
                </div>
              </div>
            </div>
          </section>

          <div style={{maxWidth:1200,margin:"0 auto",padding:"0 28px"}}>

            {/* ── SEARCH RESULTS ── */}
            {isSearching&&(
              <section style={{padding:"36px 0",borderBottom:`1px solid ${D.border}`}}>
                <div style={{marginBottom:18}}>
                  <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:3,color:D.text,marginBottom:3}}>
                    {searchRes.length?`"${searchQ}"`:"No Results"}
                  </h2>
                  <p style={{fontSize:10,color:D.text3}}>{searchRes.length} track{searchRes.length!==1?"s":""} matched{threePicksMode?` · showing top ${Math.min(3,searchRes.length)}`:""}</p>
                </div>
                {searchRes.length>0?(
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:16}}>
                    {(threePicksMode?searchRes.slice(0,3):searchRes).map((t,i)=>(
                      <div key={t.id} style={{animation:`up 0.24s ${i*0.05}s both`}}>
                        <TrackCard track={t} onSelect={setSelected} onDownload={openDownload} onPlay={togglePlay} isPlaying={playing===t.id} progress={progress[t.id]||0} supervisorMode={supervisorMode}/>
                      </div>
                    ))}
                  </div>
                ):(
                  <div style={{textAlign:"center",padding:"44px",color:D.text4,border:`1px dashed ${D.border}`,borderRadius:8}}>
                    <div style={{fontSize:28,marginBottom:10,opacity:0.25}}>♫</div>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:2,color:D.text3,marginBottom:5}}>Nothing matched</div>
                    <div style={{fontSize:11}}>Try: pregame · sad · dark · menu loop · trailer · locker room · chill</div>
                  </div>
                )}
              </section>
            )}

            {/* ── BROWSE BY USE CASE ── */}
            <section style={{padding:"40px 0 28px",borderBottom:`1px solid ${D.border}`}}>
              <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:3,color:D.text,marginBottom:4}}>Browse by Use Case</h2>
              <p style={{fontSize:10,color:D.text3,marginBottom:16}}>Not by genre — by what you're building</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:7}}>
                {USE_CASES_QUICK.map(u=>(
                  <button key={u} onClick={()=>{handleSearch(u.toLowerCase());window.scrollTo({top:0,behavior:"smooth"});}} style={{background:D.bg3,border:`1px solid ${D.border}`,borderRadius:6,padding:"12px 14px",cursor:"pointer",textAlign:"left",transition:"all 0.15s",fontFamily:"'IBM Plex Sans',sans-serif"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=D.gold;e.currentTarget.style.background=D.gold+"0C";}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=D.border;e.currentTarget.style.background=D.bg3;}}>
                    <div style={{fontSize:11,fontWeight:700,color:D.text,marginBottom:2}}>{u}</div>
                    <div style={{fontSize:8,color:D.text4,letterSpacing:0.5,textTransform:"uppercase"}}>Browse tracks →</div>
                  </button>
                ))}
              </div>
            </section>

            {/* Sections */}
            <div style={{paddingTop:44}}>
              <Section title="Featured Sounds" sub="Hand-picked for film, TV, and broadcast" tracks={featured}/>
              <Section title="Emotional Catalog" sub="Soul, R&B, Ambient — for the moments that hit" tracks={emotional}/>
              <Section title="Latest Drops" sub="Freshly composed and ready to license" tracks={latest}/>
            </div>

            {/* ── COLLECTIONS ── */}
            <section style={{marginBottom:52}}>
              <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:3,color:D.text,marginBottom:4}}>Collections</h2>
              <p style={{fontSize:10,color:D.text3,marginBottom:18}}>Curated packs built for specific moments</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
                {COLLECTIONS.map(col=>{
                  const colTracks=col.ids.map(id=>tracks.find(t=>t.id===id)).filter(Boolean);
                  return(
                    <div key={col.title} style={{background:`linear-gradient(135deg,${col.color},${D.bg3})`,border:`1px solid ${D.border}`,borderRadius:10,padding:"18px 18px 14px",cursor:"pointer",transition:"all 0.2s"}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=col.accent;e.currentTarget.style.boxShadow=`0 6px 28px rgba(0,0,0,0.45)`;}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=D.border;e.currentTarget.style.boxShadow="none";}}>
                      <div style={{fontSize:8,color:col.accent,letterSpacing:2,textTransform:"uppercase",fontWeight:700,marginBottom:5}}>{col.tag}</div>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:2,color:D.text,marginBottom:4}}>{col.title}</div>
                      <div style={{fontSize:10,color:D.text3,marginBottom:12}}>{col.desc}</div>
                      <div style={{display:"flex",gap:5,alignItems:"center"}}>
                        {colTracks.map(t=>(
                          <div key={t.id} onClick={e=>{e.stopPropagation();setSelected(t);}} style={{width:38,height:38,borderRadius:5,background:t.art,flexShrink:0,boxShadow:"0 2px 8px rgba(0,0,0,0.5)",transition:"transform 0.15s"}}
                            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.12)"}
                            onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}/>
                        ))}
                        <span style={{fontSize:9,color:D.text4,marginLeft:3}}>{colTracks.length} tracks</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <div style={{height:76}}/>
          </div>
        </>
      )}

      {/* ══ ADMIN ═════════════════════════════════════════════════════════════ */}
      {page==="admin"&&(
        <div style={{maxWidth:1100,margin:"0 auto",padding:"36px 28px 80px"}}>
          {!authed?(
            <div style={{maxWidth:320,margin:"56px auto",textAlign:"center"}}>
              <div style={{width:50,height:50,borderRadius:"50%",background:D.bg3,border:`1px solid ${D.border2}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:20,color:D.text3}}>⚙</div>
              <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:3,color:D.text,marginBottom:5}}>Admin Access</h2>
              <p style={{color:D.text3,fontSize:11,marginBottom:18}}>Private dashboard — enter your password</p>
              <Fld label="Password" type="password" value={pw} onChange={e=>{setPw(e.target.value);setPwErr(false);}}
                onKeyDown={e=>{if(e.key==="Enter"){if(pw===ADMIN_PASS)setAuthed(true);else setPwErr(true);}}} placeholder="Admin password" autoFocus/>
              {pwErr&&<p style={{color:D.red,fontSize:10,marginBottom:8,marginTop:-6}}>Incorrect password.</p>}
              <GBtn full ch="Sign In" v="gold" onClick={()=>{if(pw===ADMIN_PASS){setAuthed(true);setPwErr(false);}else setPwErr(true);}}/>
            </div>
          ):(
            <>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:24,paddingBottom:18,borderBottom:`1px solid ${D.border}`}}>
                <div>
                  <p style={{fontSize:8,color:D.text4,letterSpacing:3,textTransform:"uppercase",marginBottom:5}}>Private Dashboard</p>
                  <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:38,letterSpacing:4,color:D.text}}>CURATED ADMIN</h1>
                </div>
                <div style={{display:"flex",gap:7}}>
                  <GBtn sm ch="Sign Out" v="ghost" onClick={()=>{setAuthed(false);setPw("");}}/>
                </div>
              </div>
              {/* Stats */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,background:D.border,borderRadius:7,overflow:"hidden",marginBottom:28}}>
                {[{l:"Tracks",v:tracks.length},{l:"Open Requests",v:pending},{l:"Total Inquiries",v:inbox.length},{l:"Genres",v:[...new Set(tracks.map(t=>t.genre))].length}].map(s=>(
                  <div key={s.l} style={{background:D.bg2,padding:"14px 18px"}}>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:34,color:s.l==="Open Requests"&&s.v>0?D.red:D.gold,lineHeight:1}}>{s.v}</div>
                    <div style={{fontSize:8,color:D.text4,letterSpacing:1.5,textTransform:"uppercase",marginTop:3,fontWeight:600}}>{s.l}</div>
                  </div>
                ))}
              </div>
              {/* Inbox */}
              <div style={{marginBottom:32}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <h3 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:2,color:D.text}}>Sync Request Inbox</h3>
                  {pending>0&&<Tag label={`${pending} Pending`}/>}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  {inbox.map(req=>(
                    <div key={req.id} style={{background:D.bg2,border:"1px solid",borderRadius:7,padding:"12px 16px",borderColor:req.status==="pending"?D.gold+"44":D.border}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:14,alignItems:"flex-start"}}>
                        <div>
                          <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:5,flexWrap:"wrap"}}>
                            <span style={{fontWeight:700,fontSize:13,color:D.text}}>{req.name}</span>
                            <span style={{color:D.border3}}>·</span>
                            <span style={{color:D.text2,fontSize:11}}>{req.company}</span>
                            <span style={{color:D.border3}}>·</span>
                            <span style={{color:D.text3,fontSize:10}}>{req.role}</span>
                            <Tag label={req.status.toUpperCase()} c={sCol[req.status]}/>
                          </div>
                          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:4}}>
                            <Tag label={`↳ ${req.track}`}/><Tag label={req.medium} c={D.text3}/><Tag label={req.scene} c={D.text3}/><Tag label={req.date} c={D.text4} sm/>
                          </div>
                          <p style={{color:D.text3,fontSize:10,marginBottom:req.notes?2:0}}><b style={{color:D.text2}}>Project:</b> {req.project}</p>
                          {req.notes&&<p style={{color:D.text4,fontSize:10,fontStyle:"italic"}}>"{req.notes}"</p>}
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:4,minWidth:90}}>
                          <GBtn sm ch="✉ Reply" v="gold" onClick={()=>window.open(`mailto:${req.email}?subject=${encodeURIComponent(`Re: "${req.track}" | CURATED`)}`)}/>
                          {["reviewing","approved","declined"].map(s=>(
                            <GBtn key={s} sm ch={s.charAt(0).toUpperCase()+s.slice(1)} v={s==="approved"?"green":s==="declined"?"red":"ghost"} sx={{justifyContent:"center"}} onClick={()=>setInbox(i=>i.map(r=>r.id===req.id?{...r,status:s}:r))}/>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {inbox.length===0&&<div style={{textAlign:"center",padding:"28px",color:D.text4,border:`1px dashed ${D.border}`,borderRadius:7,fontSize:11}}>No requests yet.</div>}
                </div>
              </div>
              {/* ── UPLOAD NEW TRACK ── */}
              <div style={{marginBottom:32}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <h3 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:2,color:D.text}}>Upload New Track</h3>
                  <GBtn sm ch={showUpload?"− Hide Form":"+ Upload Track"} v="gold" onClick={()=>setShowUpload(v=>!v)}/>
                </div>

                {showUpload&&(
                  <div style={{background:D.bg2,border:`1px solid ${D.border2}`,borderRadius:10,padding:22}}>
                    {/* File upload zones */}
                    <div style={{marginBottom:18}}>
                      <div style={{fontSize:9,color:D.gold,letterSpacing:1.5,textTransform:"uppercase",fontWeight:700,marginBottom:10}}>Audio Files</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                        {[
                          {key:"fileMain",   label:"Master WAV / MP3",  required:true},
                          {key:"fileInst",   label:"Instrumental",       required:false},
                          {key:"fileClean",  label:"Clean Version",      required:false},
                          {key:"fileLoop30", label:"30-Second Loop",     required:false},
                          {key:"fileLoop60", label:"60-Second Cut",      required:false},
                        ].map(f=>(
                          <label key={f.key} style={{display:"block",background:D.bg3,border:`1px dashed ${uploadForm[f.key]?D.gold:D.border2}`,borderRadius:7,padding:"12px 14px",cursor:"pointer",transition:"all 0.15s"}}
                            onMouseEnter={e=>e.currentTarget.style.borderColor=D.gold}
                            onMouseLeave={e=>e.currentTarget.style.borderColor=uploadForm[f.key]?D.gold:D.border2}>
                            <div style={{fontSize:9,color:D.text4,letterSpacing:1,textTransform:"uppercase",fontWeight:700,marginBottom:3}}>
                              {f.label}{f.required&&<span style={{color:D.gold}}> *</span>}
                            </div>
                            {uploadForm[f.key]
                              ?<div style={{fontSize:11,color:D.green,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>✓ {uploadForm[f.key].name}</div>
                              :<div style={{fontSize:10,color:D.text4}}>Click to upload</div>
                            }
                            <input type="file" accept="audio/*" style={{display:"none"}} onChange={e=>{const file=e.target.files[0];if(file)setUploadForm(f=>({...f,[f.key]:file}));e.target.value="";}}
                              ref={el=>{if(el)el.onchange=e=>{const file=e.target.files[0];if(file)setUploadForm(prev=>({...prev,[f.key]:file}));}}}/>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Track metadata */}
                    <div style={{height:1,background:D.border,marginBottom:16}}/>
                    <div style={{fontSize:9,color:D.gold,letterSpacing:1.5,textTransform:"uppercase",fontWeight:700,marginBottom:10}}>Track Info</div>

                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                      <Fld label="Title *" value={uploadForm.title||""} onChange={e=>setUploadForm(f=>({...f,title:e.target.value}))} placeholder="e.g. FRACTURE"/>
                      <Fld label="Genre *" as="select" value={uploadForm.genre||""} onChange={e=>setUploadForm(f=>({...f,genre:e.target.value}))}>
                        <option value="">Select genre...</option>
                        {["Dark Trap","Hip-Hop","R&B","Orchestral","Cinematic","Ambient","Electronic","Trap","Gospel","Jazz","Soul","Pop","Lo-Fi","Afrobeats","Drill","Hybrid"].map(g=><option key={g}>{g}</option>)}
                      </Fld>
                    </div>

                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
                      <Fld label="Mood *" value={uploadForm.mood||""} onChange={e=>setUploadForm(f=>({...f,mood:e.target.value}))} placeholder="e.g. Tense"/>
                      <Fld label="BPM *" type="number" value={uploadForm.bpm||""} onChange={e=>setUploadForm(f=>({...f,bpm:e.target.value}))} placeholder="138"/>
                      <Fld label="Key" value={uploadForm.key||""} onChange={e=>setUploadForm(f=>({...f,key:e.target.value}))} placeholder="Dm"/>
                    </div>

                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
                      <Fld label="Sync Price ($)" type="number" value={uploadForm.pSync||""} onChange={e=>setUploadForm(f=>({...f,pSync:e.target.value}))} placeholder="350"/>
                      <Fld label="Bundle Price ($)" type="number" value={uploadForm.pBundle||""} onChange={e=>setUploadForm(f=>({...f,pBundle:e.target.value}))} placeholder="500"/>
                      <Fld label="Exclusive Price ($)" type="number" value={uploadForm.pExcl||""} onChange={e=>setUploadForm(f=>({...f,pExcl:e.target.value}))} placeholder="2500"/>
                    </div>

                    <Fld label="One-Line Use Case" value={uploadForm.useCase1||""} onChange={e=>setUploadForm(f=>({...f,useCase1:e.target.value}))} placeholder="Pregame hype, villain scene, highlight reel"/>
                    <Fld label="Description" as="textarea" value={uploadForm.desc||""} onChange={e=>setUploadForm(f=>({...f,desc:e.target.value}))} placeholder="Describe the mood, energy, and best placement for this track..."/>
                    <Fld label="Use Cases (comma separated)" value={uploadForm.useCasesRaw||""} onChange={e=>setUploadForm(f=>({...f,useCasesRaw:e.target.value}))} placeholder="Pregame Hype, Highlight Reel, Villain Reveal, Locker Room"/>
                    <Fld label="Search Tags (comma separated)" value={uploadForm.tagsRaw||""} onChange={e=>setUploadForm(f=>({...f,tagsRaw:e.target.value}))} placeholder="dark trap, hype, aggressive, cinematic, locker room"/>

                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                      <Fld label="Section" as="select" value={uploadForm.section||"featured"} onChange={e=>setUploadForm(f=>({...f,section:e.target.value}))}>
                        <option value="featured">Featured</option>
                        <option value="emotional">Emotional</option>
                        <option value="latest">Latest Drops</option>
                      </Fld>
                      <Fld label="Duration" value={uploadForm.dur||""} onChange={e=>setUploadForm(f=>({...f,dur:e.target.value}))} placeholder="2:34"/>
                    </div>

                    {/* Hook start */}
                    <div style={{marginBottom:14}}>
                      <label style={{display:"block",color:D.text4,fontSize:9,marginBottom:5,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600}}>Hook Jump Point — {Math.round((uploadForm.hookStart||0.3)*100)}% into track</label>
                      <input type="range" min="0" max="0.9" step="0.05" value={uploadForm.hookStart||0.3} onChange={e=>setUploadForm(f=>({...f,hookStart:parseFloat(e.target.value)}))}
                        style={{width:"100%",accentColor:D.gold,cursor:"pointer"}}/>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:D.text4,marginTop:3}}>
                        <span>Intro (0%)</span><span>← Drag to where the hook hits →</span><span>End (90%)</span>
                      </div>
                    </div>

                    {uploadErr&&<p style={{color:D.red,fontSize:11,marginBottom:8}}>⚠ {uploadErr}</p>}

                    <GBtn full ch="Add Track to Catalog →" v="gold" sx={{padding:11,fontSize:12}} onClick={()=>{
                      if(!uploadForm.title){setUploadErr("Title is required.");return;}
                      if(!uploadForm.genre){setUploadErr("Genre is required.");return;}
                      if(!uploadForm.mood){setUploadErr("Mood is required.");return;}
                      if(!uploadForm.bpm){setUploadErr("BPM is required.");return;}
                      if(!uploadForm.fileMain){setUploadErr("Master audio file is required.");return;}
                      setUploadErr("");
                      const artColors=["linear-gradient(135deg,#1a0a2e,#0d0d1a,#2a0a1a)","linear-gradient(135deg,#0a1a0d,#001a08,#0a2a10)","linear-gradient(135deg,#1a0505,#2a0808,#1a1005)","linear-gradient(135deg,#0a1018,#050e1a,#0a1520)","linear-gradient(135deg,#1a1000,#2a1800,#1a0c00)","linear-gradient(135deg,#160008,#0d0010,#1a001a)","linear-gradient(135deg,#0a1a1a,#001a20,#051515)"];
                      const newTrack={
                        id:Date.now(),
                        title:uploadForm.title.toUpperCase(),
                        genre:uploadForm.genre,
                        mood:uploadForm.mood,
                        bpm:parseInt(uploadForm.bpm)||120,
                        key:uploadForm.key||"—",
                        dur:uploadForm.dur||"—",
                        hookStart:uploadForm.hookStart||0.3,
                        price:{sync:parseInt(uploadForm.pSync)||300,bundle:parseInt(uploadForm.pBundle)||450,exclusive:parseInt(uploadForm.pExcl)||2000},
                        desc:uploadForm.desc||"",
                        useCase1:uploadForm.useCase1||"",
                        useCases:(uploadForm.useCasesRaw||"").split(",").map(s=>s.trim()).filter(Boolean),
                        tags:(uploadForm.tagsRaw||"").split(",").map(s=>s.trim().toLowerCase()).filter(Boolean),
                        badge:{owned:true,cleared:true,noSamples:true},
                        pack:{wav:true,instrumental:!!uploadForm.fileInst,clean:!!uploadForm.fileClean,loop30:!!uploadForm.fileLoop30,loop60:!!uploadForm.fileLoop60},
                        art:artColors[Math.floor(Math.random()*artColors.length)],
                        section:uploadForm.section||"featured",
                        file:uploadForm.fileMain,
                        fileInst:uploadForm.fileInst||null,
                        fileClean:uploadForm.fileClean||null,
                        fileLoop30:uploadForm.fileLoop30||null,
                        fileLoop60:uploadForm.fileLoop60||null,
                      };
                      setTracks(ts=>[newTrack,...ts]);
                      setUploadForm({hookStart:0.3,section:"featured"});
                      setShowUpload(false);
                    }}/>
                  </div>
                )}
              </div>

              {/* ── CATALOG TABLE ── */}
              <div>
                <h3 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:2,color:D.text,marginBottom:12}}>Track Catalog <span style={{fontSize:12,color:D.text4,fontWeight:400,letterSpacing:0}}>({tracks.length} tracks)</span></h3>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  {tracks.map(t=>(
                    <div key={t.id} style={{background:D.bg2,border:`1px solid ${D.border}`,borderRadius:7,padding:"11px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:14}}>
                      <div style={{display:"flex",gap:11,alignItems:"center",flex:1,minWidth:0}}>
                        <div style={{width:38,height:38,borderRadius:5,background:t.art,flexShrink:0,position:"relative"}}>
                          {t.file&&<div style={{position:"absolute",bottom:2,right:2,width:8,height:8,borderRadius:"50%",background:D.green,boxShadow:`0 0 4px ${D.green}`}}/>}
                        </div>
                        <div style={{minWidth:0}}>
                          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:1.5,color:D.text,display:"flex",alignItems:"center",gap:7}}>
                            {t.title}
                            {t.file&&<span style={{fontSize:8,color:D.green,fontWeight:700,letterSpacing:0.5}}>● AUDIO LOADED</span>}
                          </div>
                          <div style={{display:"flex",gap:4,marginTop:2,flexWrap:"wrap"}}>
                            <Tag label={t.genre} sm/><Tag label={t.mood} c={D.text3} sm/><Tag label={`${t.bpm} BPM`} c={D.text4} sm/><Tag label={t.key} c={D.text4} sm/>
                            {t.pack?.instrumental&&<Tag label="Inst" c={D.text4} sm/>}
                            {t.pack?.clean&&<Tag label="Clean" c={D.text4} sm/>}
                            {t.pack?.loop30&&<Tag label="30s" c={D.text4} sm/>}
                            {t.pack?.loop60&&<Tag label="60s" c={D.text4} sm/>}
                          </div>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
                        <ZeroBadge badge={t.badge}/>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:D.gold,fontWeight:700}}>${t.price.sync}</span>
                        <GBtn sm ch="Remove" v="red" onClick={()=>setTracks(ts=>ts.filter(tr=>tr.id!==t.id))}/>
                      </div>
                    </div>
                  ))}
                  {tracks.length===0&&<div style={{textAlign:"center",padding:"28px",color:D.text4,border:`1px dashed ${D.border}`,borderRadius:7,fontSize:11}}>No tracks yet. Upload your first track above.</div>}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── MINI PLAYER ── */}
      {playing&&(
        <MiniPlayer
          track={tracks.find(t=>t.id===playing)}
          isPlaying={true}
          onToggle={()=>{audioRefs.current[playing]?.pause();setPlaying(null);}}
          progress={progress[playing]||0}
          onExpand={()=>setSelected(tracks.find(t=>t.id===playing))}
          onLicense={()=>setLicModal(tracks.find(t=>t.id===playing))}
          onDownload={()=>openDownload(tracks.find(t=>t.id===playing))}
        />
      )}

      {/* ── TRACK DETAIL MODAL ── */}
      {selected&&(
        <Modal wide title={selected.title} sub={`${selected.genre} · ${selected.key} · ${selected.bpm} BPM · ${selected.dur}`} onClose={()=>setSelected(null)} ch={
          <div>
            <div style={{display:"grid",gridTemplateColumns:"160px 1fr",gap:18,marginBottom:18}}>
              <div style={{background:selected.art,borderRadius:9,aspectRatio:"1",boxShadow:`0 6px 28px rgba(0,0,0,0.6)`}}/>
              <div>
                <div style={{marginBottom:10}}><ZeroBadge badge={selected.badge}/></div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
                  <Tag label={selected.mood}/><Tag label={selected.genre} c={D.text3}/><Tag label={`${selected.bpm} BPM`} c={D.text4}/><Tag label={selected.key} c={D.text4}/>
                </div>
                <p style={{color:D.text2,fontSize:12,lineHeight:1.75,marginBottom:10,fontFamily:"'IBM Plex Sans',sans-serif"}}>{selected.desc}</p>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:9,color:D.text4,letterSpacing:1,textTransform:"uppercase",marginBottom:5,fontWeight:700}}>Use Cases</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {selected.useCases.map(u=><Tag key={u} label={u} c={D.text3}/>)}
                  </div>
                </div>
                {/* Pack contents */}
                <div style={{background:D.bg3,border:`1px solid ${D.border}`,borderRadius:6,padding:"10px 12px",marginBottom:10}}>
                  <div style={{fontSize:9,color:D.gold,letterSpacing:1.5,textTransform:"uppercase",fontWeight:700,marginBottom:6}}>Download Pack Includes</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                    {[["WAV Master",selected.pack.wav],["Instrumental",selected.pack.instrumental],["Clean Version",selected.pack.clean],["30-Sec Loop",selected.pack.loop30],["60-Sec Cut",selected.pack.loop60]].map(([l,v])=>(
                      <div key={l} style={{fontSize:10,color:v?D.text2:D.text4,display:"flex",alignItems:"center",gap:5}}>
                        <span style={{color:v?D.green:D.text4,fontWeight:700}}>{v?"✓":"—"}</span>{l}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Playback */}
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <button onClick={()=>togglePlay(selected)} style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${D.gold},${D.goldL})`,border:"none",color:"#0B0B0B",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
                    {playing===selected.id?"▮▮":"▶"}
                  </button>
                  <div style={{flex:1,height:2,background:D.bg5,borderRadius:1}}>
                    <div style={{width:`${(progress[selected.id]||0)*100}%`,height:"100%",background:`linear-gradient(to right,${D.gold},${D.goldL})`,borderRadius:1,transition:"width 0.1s"}}/>
                  </div>
                  <button onClick={()=>togglePlay(selected,true)} style={{background:D.bg3,border:`1px solid ${D.border2}`,color:D.text3,fontSize:9,padding:"4px 10px",borderRadius:20,cursor:"pointer",fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",whiteSpace:"nowrap"}}>▶▶ Skip to Hook</button>
                </div>
              </div>
            </div>
            {/* Pricing */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
              {[{id:"sync",label:"Sync License",desc:"One track, one project"},{id:"bundle",label:"Bundle Pack",desc:"All 5 file versions"},{id:"exclusive",label:"Exclusive",desc:"Full buyout"}].map(tier=>(
                <div key={tier.id} style={{background:D.bg3,border:`1px solid ${D.border2}`,borderRadius:7,padding:"12px",textAlign:"center",cursor:"pointer",transition:"all 0.15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=D.gold;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=D.border2;}}>
                  <div style={{fontSize:10,fontWeight:700,color:D.text,letterSpacing:0.5,marginBottom:3,textTransform:"uppercase"}}>{tier.label}</div>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:20,fontWeight:700,color:D.gold,marginBottom:3}}>${selected.price[tier.id]}</div>
                  <div style={{fontSize:9,color:D.text4}}>{tier.desc}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <GBtn full ch="⬇ Download Pack" v="dark" onClick={()=>{openDownload(selected);setSelected(null);}} sx={{flex:1,padding:10}}/>
              <GBtn full ch="License This Track →" v="gold" onClick={()=>{setLicModal(selected);setSelected(null);}} sx={{flex:1,padding:10}}/>
              <GBtn ch="Contact Creator" v="ghost" onClick={()=>{openContact(selected);setSelected(null);}} sx={{padding:10}}/>
            </div>
          </div>
        }/>
      )}

      {/* ── DOWNLOAD PACK MODAL ── */}
      {dlModal&&(
        <Modal title="Download Pack" sub={`"${dlModal.title}" · ${dlModal.genre} · ${dlModal.bpm} BPM · ${dlModal.key}`} onClose={()=>setDlModal(null)} ch={
          <div>
            <div style={{background:D.bg3,border:`1px solid ${D.border}`,borderRadius:7,padding:"12px 14px",marginBottom:16}}>
              <div style={{fontSize:9,color:D.gold,letterSpacing:1.5,textTransform:"uppercase",fontWeight:700,marginBottom:8}}>Pack Contents</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                {[["WAV Master (Full Quality)",dlModal.pack.wav],["Instrumental",dlModal.pack.instrumental],["Clean Version",dlModal.pack.clean],["30-Second Loop",dlModal.pack.loop30],["60-Second Cut",dlModal.pack.loop60],["BPM / Key / Mood Metadata","✓"]].map(([l,v])=>(
                  <div key={l} style={{fontSize:11,color:v?D.text2:D.text4,display:"flex",alignItems:"center",gap:6}}>
                    <span style={{color:v?D.green:D.text4,fontWeight:800,fontSize:10}}>{v?"✓":"—"}</span>{l}
                  </div>
                ))}
              </div>
              <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${D.border}`}}>
                <ZeroBadge badge={dlModal.badge}/>
              </div>
            </div>
            <Fld label="Your Name *" value={buyerF.name} onChange={e=>setBuyerF(b=>({...b,name:e.target.value}))} placeholder="Jordan Ellis"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Fld label="Company / Studio" value={buyerF.company} onChange={e=>setBuyerF(b=>({...b,company:e.target.value}))} placeholder="Paramount"/>
              <Fld label="Project" value={buyerF.project} onChange={e=>setBuyerF(b=>({...b,project:e.target.value}))} placeholder="Crime Drama S2"/>
            </div>
            <Fld label="Email *" type="email" value={buyerF.email} onChange={e=>setBuyerF(b=>({...b,email:e.target.value}))} placeholder="you@studio.com"/>
            <div style={{background:D.bg3,border:`1px solid ${D.border}`,borderRadius:6,padding:"10px 12px",marginBottom:12}}>
              <div style={{fontSize:9,color:D.text4,lineHeight:1.7}}>
                By downloading you agree to license this track for the project stated above. A copy of your license agreement will be sent to your email. One-time fee of <strong style={{color:D.gold}}>${dlModal.price.bundle}</strong> for the full bundle.
              </div>
            </div>
            <GBtn full ch={`⬇ Get Full Pack — $${dlModal.price.bundle}`} v="gold" disabled={!buyerF.name||!buyerF.email} sx={{padding:11,fontSize:12}} onClick={()=>{setCtModal({text:buildContract(dlModal,"bundle",buyerF)});setDlModal(null);}}/>
          </div>
        }/>
      )}

      {/* ── LICENSE MODAL ── */}
      {licModal&&(
        <Modal title="License This Track" sub={`"${licModal.title}" · Choose your license type`} onClose={()=>setLicModal(null)} ch={
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:18}}>
              {[{id:"sync",label:"Sync License",icon:"◉",desc:"One placement, one project. Full rights for specified use."},{id:"bundle",label:"Bundle Pack",icon:"◈",desc:"WAV + Instrumental + Clean + 30s + 60s loop."},{id:"exclusive",label:"Exclusive",icon:"◆",desc:"Full buyout. Track removed from marketplace."}].map(tier=>(
                <div key={tier.id} onClick={()=>setLicTier(tier.id)} style={{background:licTier===tier.id?D.gold+"14":D.bg3,border:`1px solid ${licTier===tier.id?D.gold:D.border2}`,borderRadius:8,padding:"13px",cursor:"pointer",textAlign:"center",transition:"all 0.15s"}}>
                  <div style={{fontSize:16,color:D.gold,marginBottom:4}}>{tier.icon}</div>
                  <div style={{fontSize:9,fontWeight:700,color:D.text,letterSpacing:0.5,marginBottom:4,textTransform:"uppercase"}}>{tier.label}</div>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,fontWeight:700,color:licTier===tier.id?D.goldL:D.text,marginBottom:4}}>${licModal.price[tier.id]}</div>
                  <div style={{fontSize:8,color:D.text4,lineHeight:1.4}}>{tier.desc}</div>
                </div>
              ))}
            </div>
            <div style={{height:1,background:D.border,margin:"14px 0"}}/>
            <Fld label="Full Name *" value={buyerF.name} onChange={e=>setBuyerF(b=>({...b,name:e.target.value}))} placeholder="Chris Davis"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Fld label="Label / Company" value={buyerF.company} onChange={e=>setBuyerF(b=>({...b,company:e.target.value}))} placeholder="Def Jam"/>
              <Fld label="Artist Name" value={buyerF.artist} onChange={e=>setBuyerF(b=>({...b,artist:e.target.value}))} placeholder="Stage name"/>
            </div>
            <Fld label="Project / Album" value={buyerF.project} onChange={e=>setBuyerF(b=>({...b,project:e.target.value}))} placeholder="Debut EP"/>
            <Fld label="Email *" type="email" value={buyerF.email} onChange={e=>setBuyerF(b=>({...b,email:e.target.value}))} placeholder="you@label.com"/>
            <GBtn full ch="Generate Licensing Contract →" v="gold" disabled={!buyerF.name||!buyerF.email} sx={{marginTop:5,padding:11,fontSize:12}} onClick={()=>{setCtModal({text:buildContract(licModal,licTier,buyerF)});setLicModal(null);}}/>
          </div>
        }/>
      )}

      {/* ── CONTACT MODAL ── */}
      {contactModal&&(
        <Modal title="Contact the Creator" sub={`Sync inquiry for "${contactModal.title}"`} onClose={()=>setContactModal(null)} ch={
          contactDone?(
            <div style={{textAlign:"center",padding:"18px 0"}}>
              <div style={{width:44,height:44,borderRadius:"50%",background:D.gold+"18",border:`1px solid ${D.gold+"38"}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontSize:18,color:D.gold}}>✓</div>
              <h3 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:2,color:D.text,marginBottom:7}}>Request Sent</h3>
              <p style={{color:D.text3,fontSize:12,lineHeight:1.9}}>Your inquiry for <em>"{contactModal.title}"</em> was logged. Expect a response at <b style={{color:D.text}}>{contactF.email}</b> within 48 hours.</p>
              <GBtn ch="Done" v="gold" sx={{marginTop:16}} onClick={()=>setContactModal(null)}/>
            </div>
          ):(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <Fld label="Full Name *" value={contactF.name} onChange={e=>setContactF(f=>({...f,name:e.target.value}))} placeholder="Jordan Ellis"/>
                <Fld label="Company *" value={contactF.company} onChange={e=>setContactF(f=>({...f,company:e.target.value}))} placeholder="Paramount"/>
              </div>
              <Fld label="Your Role" as="select" value={contactF.role} onChange={e=>setContactF(f=>({...f,role:e.target.value}))}>
                <option value="">Select...</option>
                {["Music Supervisor","Director","Producer","Ad Agency","Game Studio","Creator / YouTuber","Other"].map(r=><option key={r}>{r}</option>)}
              </Fld>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <Fld label="Project Title" value={contactF.project} onChange={e=>setContactF(f=>({...f,project:e.target.value}))} placeholder="Feature Film"/>
                <Fld label="Medium" as="select" value={contactF.medium} onChange={e=>setContactF(f=>({...f,medium:e.target.value}))}>
                  <option value="">Select...</option>
                  {["Film","TV Series","Streaming","Advertisement","YouTube","Video Game","Short Film","Podcast","Other"].map(m=><option key={m}>{m}</option>)}
                </Fld>
              </div>
              <Fld label="Intended Scene / Use" value={contactF.scene} onChange={e=>setContactF(f=>({...f,scene:e.target.value}))} placeholder="Opening title, villain entrance..."/>
              <Fld as="textarea" label="Notes — budget, exclusivity, timeline" value={contactF.notes} onChange={e=>setContactF(f=>({...f,notes:e.target.value}))}/>
              <Fld label="Email *" type="email" value={contactF.email} onChange={e=>setContactF(f=>({...f,email:e.target.value}))} placeholder="you@studio.com"/>
              <GBtn full ch="Submit Inquiry →" v="gold" disabled={!contactF.name||!contactF.email||!contactF.company} sx={{marginTop:5,padding:11,fontSize:12}} onClick={submitContact}/>
            </div>
          )
        }/>
      )}

      {/* ── CONTRACT MODAL ── */}
      {ctModal&&(
        <Modal wide title="Licensing Agreement" sub="Download · Sign · Return to creator to finalize" onClose={()=>setCtModal(null)} ch={
          <div>
            <div style={{display:"flex",gap:8,marginBottom:11}}>
              <GBtn ch="⬇ Download Contract" v="gold" onClick={()=>{const b=new Blob([ctModal.text],{type:"text/plain"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=`CURATED_${uid()}.txt`;a.click();}}/>
              <GBtn ch="Copy Text" v="ghost" onClick={()=>navigator.clipboard?.writeText(ctModal.text)}/>
            </div>
            <pre style={{background:D.bg3,border:`1px solid ${D.border}`,borderRadius:6,padding:14,fontSize:9,lineHeight:1.85,color:D.text3,overflowX:"auto",whiteSpace:"pre-wrap",fontFamily:"'IBM Plex Mono',monospace",maxHeight:400,overflowY:"auto"}}>{ctModal.text}</pre>
            <p style={{marginTop:9,color:D.text4,fontSize:9,lineHeight:1.7}}>⚠ Template based on standard U.S. music licensing law. For deals above $10,000, consult a licensed music attorney.</p>
          </div>
        }/>
      )}
    </>
  );
}
