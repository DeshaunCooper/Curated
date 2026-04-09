"use client";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE ────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ─── SEARCH MAP ──────────────────────────────────────────────────────────────
const SEARCH_MAP = {
  "pregame":["hype","aggressive","energetic","dark trap"],
  "hype":["aggressive","energetic","dark trap","hip-hop"],
  "locker room":["motivational","hype","hip-hop","soul"],
  "highlight":["action","energetic","cinematic","hype"],
  "sad":["ambient","emotional","soul","r&b","melancholic"],
  "dark":["dark trap","tension","cinematic","drill"],
  "angry":["dark trap","drill","trap","action"],
  "happy":["pop","soul","gospel","upbeat"],
  "uplifting":["gospel","pop","soul","orchestral"],
  "romantic":["r&b","soul","jazz","pop"],
  "chill":["lo-fi","ambient","jazz","r&b"],
  "intense":["dark trap","action","tension","hybrid"],
  "peaceful":["ambient","lo-fi","jazz","atmospheric"],
  "mysterious":["ambient","cinematic","tension"],
  "epic":["orchestral","cinematic","action","hybrid"],
  "energetic":["hip-hop","trap","electronic","action"],
  "emotional":["ambient","r&b","soul","orchestral"],
  "summer":["pop","afrobeats","r&b"],
  "night":["lo-fi","r&b","dark trap","ambient"],
  "rain":["ambient","lo-fi","emotional"],
  "film":["cinematic","orchestral","ambient","tension"],
  "trailer":["cinematic","action","orchestral","epic"],
  "villain":["dark trap","tension","cinematic"],
  "hero":["orchestral","cinematic","epic","action"],
  "chase":["action","electronic","hybrid","trap"],
  "menu":["ambient","lo-fi","cinematic","atmospheric"],
  "loop":["ambient","lo-fi","atmospheric"],
  "background":["ambient","lo-fi","atmospheric"],
  "late night":["lo-fi","r&b","ambient","soulful"],
  "workout":["energetic","trap","hip-hop","aggressive"],
  "warmup":["hype","energetic","electronic","trap"],
  "sports":["hype","energetic","action","cinematic"],
  "arena":["orchestral","cinematic","hype","epic"],
  "comeback":["emotional","cinematic","orchestral","intense"],
  "championship":["orchestral","cinematic","epic","uplifting"],
  "documentary":["emotional","cinematic","ambient","soul"],
  "spider-man":["action","electronic","cinematic"],
  "batman":["dark trap","cinematic","tension","orchestral"],
  "interstellar":["ambient","cinematic","orchestral"],
  "inception":["cinematic","tension","electronic"],
  "nolan":["cinematic","orchestral","tension"],
  "drake":["r&b","hip-hop","trap","soulful"],
  "piano":["ambient","orchestral","emotional","cinematic"],
  "no lyrics":["instrumental","ambient","cinematic"],
  "fast":["trap","electronic","action","energetic"],
  "slow":["ambient","lo-fi","r&b","orchestral"],
};

function doSearch(q, tracks) {
  if (!q.trim()) return [];
  const lq = q.toLowerCase();
  let genres = [];
  for (const [k,v] of Object.entries(SEARCH_MAP)) {
    if (lq.includes(k)) genres = [...genres, ...v];
  }
  const score = (t) => {
    let s = 0;
    if ((t.title||"").toLowerCase().includes(lq)) s += 10;
    if ((t.description||"").toLowerCase().includes(lq)) s += 5;
    (t.use_cases||[]).forEach(u => { if (u.toLowerCase().includes(lq)) s += 8; });
    (t.tags||[]).forEach(tag => {
      if (tag.toLowerCase().includes(lq)) s += 4;
      if (genres.some(g=>g.toLowerCase()===tag.toLowerCase())) s += 3;
    });
    if ((t.genre||"").toLowerCase().includes(lq)) s += 6;
    if ((t.mood||"").toLowerCase().includes(lq)) s += 6;
    genres.forEach(g => {
      if ((t.genre||"").toLowerCase().includes(g.toLowerCase())) s += 4;
      if ((t.mood||"").toLowerCase().includes(g.toLowerCase())) s += 3;
    });
    return s;
  };
  return tracks.map(t=>({t,s:score(t)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).map(x=>x.t);
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const ADMIN_PASS = "curated2024";
const GENRES = ["Dark Trap","Hip-Hop","R&B","Orchestral","Cinematic","Ambient","Electronic","Trap","Gospel","Jazz","Soul","Pop","Lo-Fi","Afrobeats","Drill","Hybrid"];
const USE_CASES_QUICK = ["Pregame Hype","Locker Room","Highlight Reel","Late Night Menu","Emotional Cutscene","Championship Moment","Fighter Walkout","Documentary","Trailer","Comeback Win"];
const ART_GRADIENTS = [
  "linear-gradient(135deg,#1a0a2e,#0d0d1a,#2a0a1a)",
  "linear-gradient(135deg,#0a1a0d,#001a08,#0a2a10)",
  "linear-gradient(135deg,#1a0505,#2a0808,#1a1005)",
  "linear-gradient(135deg,#0a1018,#050e1a,#0a1520)",
  "linear-gradient(135deg,#1a1000,#2a1800,#1a0c00)",
  "linear-gradient(135deg,#160008,#0d0010,#1a001a)",
  "linear-gradient(135deg,#0a1a1a,#001a20,#051515)",
  "linear-gradient(135deg,#0a0a18,#10101a,#080812)",
];

const uid = () => Math.random().toString(36).slice(2,9).toUpperCase();
const fmtDate = () => new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});

// ─── CONTRACT ────────────────────────────────────────────────────────────────
function buildContract(track, tierId, b) {
  const labels = {sync:"SYNC LICENSE", bundle:"BUNDLE LICENSE", exclusive:"EXCLUSIVE LICENSE"};
  const price = tierId==="sync"?track.price_sync:tierId==="bundle"?track.price_bundle:track.price_exclusive;
  const ref = `CUR-${uid()}-${new Date().getFullYear()}`;
  const L = "─".repeat(52);
  return `CURATED  ·  MUSIC LICENSING AGREEMENT
Ref: ${ref}  ·  Date: ${fmtDate()}
${L}
LICENSOR: [YOUR LEGAL NAME] · CURATED · hello@wedesignsstudio.com
LICENSEE: ${b.name||"[NAME]"} · ${b.company||"[COMPANY]"}
ARTIST: ${b.artist||"[ARTIST]"}  PROJECT: ${b.project||"[PROJECT]"}
${L}
TRACK: "${track.title}" · ${track.genre} · ${track.bpm} BPM · ${track.key||""}
LICENSE: ${labels[tierId]||tierId} · $${price} USD (non-refundable)
RIGHTS: 100% Master Owned · Publishing Cleared · No Samples

AI DISCLOSURE: Created under human creative direction of [YOUR LEGAL NAME].
AI used as instrument of production. All IP rights vest in human
author under 17 U.S.C. § 101 et seq.
${L}
GRANT OF RIGHTS
${tierId==="sync"
  ?"Non-exclusive sync license for specified project only.\nMaster and publishing rights remain with Licensor."
  :tierId==="bundle"
  ?"Includes WAV, Instrumental, Clean, 30s and 60s loop.\nNon-exclusive. All five files licensed for specified project."
  :"EXCLUSIVE full buyout. Track removed from marketplace.\nLicensor waives right to re-license to any third party."}
${L}
CO-WRITE CLAUSE
Lyric changes require: (a) written request before recording,
(b) min 50% songwriting share retained by Licensor,
(c) signed Co-Write Addendum before release.
Violation = up to $150,000 statutory damages (17 U.S.C. § 504).
${L}
ROYALTIES
ONE-TIME: $${price} USD · Non-refundable
PERFORMANCE: 100% to Licensor via PRO (ASCAP/BMI/SESAC)
MECHANICAL: All reproductions — streams, downloads, physical
SYNC: Any visual sync requires separate negotiated fee
NO BUYOUT unless Exclusive tier selected.
${L}
SPLIT SHEET
Composition: [YOUR LEGAL NAME] — 100%
Master: [YOUR LEGAL NAME] — 100%
Samples: NONE — fully original
${L}
CREDIT: Licensor credited on all streaming metadata,
physical releases, PRO registrations, and press.
TERRITORY: Worldwide · TERM: Perpetual
${L}
ENFORCEMENT: Breach = immediate termination + $150K/infringement
+ attorney fees + DMCA takedown across all platforms.
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
  gold:"#C4921A",goldL:"#E0A820",
  green:"#2A8A4A",red:"#E05050",purple:"#6B3FA0",
};

// ─── UI ATOMS ────────────────────────────────────────────────────────────────
const Tag = ({label,c,sm}) => (
  <span style={{background:(c||D.gold)+"18",color:c||D.gold,border:`1px solid ${(c||D.gold)+"28"}`,fontSize:sm?8:9,padding:sm?"1px 6px":"2px 8px",borderRadius:3,fontWeight:700,letterSpacing:0.7,textTransform:"uppercase",whiteSpace:"nowrap"}}>{label}</span>
);

const GBtn = ({ch,onClick,v="gold",sm,full,disabled,sx={}}) => {
  const base={border:"none",borderRadius:5,fontWeight:700,cursor:disabled?"not-allowed":"pointer",fontFamily:"'IBM Plex Sans',sans-serif",letterSpacing:0.5,transition:"all 0.15s",opacity:disabled?0.3:1,padding:sm?"5px 12px":"9px 20px",fontSize:sm?10:12,textTransform:"uppercase",display:"inline-flex",alignItems:"center",gap:5,width:full?"100%":undefined,justifyContent:full?"center":undefined};
  const vs={
    gold:{background:`linear-gradient(135deg,${D.gold},${D.goldL})`,color:"#0B0B0B",boxShadow:`0 3px 12px ${D.gold}38`},
    ghost:{background:"transparent",color:D.text3,border:`1px solid ${D.border3}`},
    dark:{background:D.bg3,color:D.text2,border:`1px solid ${D.border2}`},
    outline:{background:"transparent",color:D.gold,border:`1px solid ${D.gold}60`},
    green:{background:D.green+"18",color:D.green,border:`1px solid ${D.green}30`},
    red:{background:"transparent",color:D.red,border:`1px solid ${D.red}28`},
  };
  return <button onClick={onClick} disabled={disabled} style={{...base,...(vs[v]||vs.gold),...sx}}>{ch}</button>;
};

const Modal = ({title,sub,onClose,children,wide}) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflowY:"auto",backdropFilter:"blur(12px)"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div style={{background:D.bg2,border:`1px solid ${D.border2}`,borderRadius:12,padding:26,width:"100%",maxWidth:wide?820:480,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 32px 80px rgba(0,0,0,0.85)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div>
          <h2 style={{margin:0,fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:D.text,letterSpacing:2}}>{title}</h2>
          {sub&&<p style={{margin:"3px 0 0",color:D.text3,fontSize:10}}>{sub}</p>}
        </div>
        <button onClick={onClose} style={{background:"none",border:`1px solid ${D.border2}`,color:D.text4,fontSize:13,cursor:"pointer",padding:"3px 8px",borderRadius:4,marginLeft:14,flexShrink:0}}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const Fld = ({label,as,children,...p}) => (
  <div style={{marginBottom:11}}>
    {label&&<label style={{display:"block",color:D.text4,fontSize:9,marginBottom:4,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600}}>{label}</label>}
    {as==="textarea"
      ?<textarea {...p} style={{width:"100%",background:D.bg3,border:`1px solid ${D.border2}`,borderRadius:5,color:D.text,padding:"8px 11px",fontSize:12,resize:"vertical",minHeight:64,outline:"none",boxSizing:"border-box",fontFamily:"'IBM Plex Sans',sans-serif"}}/>
      :as==="select"
      ?<select {...p} style={{width:"100%",background:D.bg3,border:`1px solid ${D.border2}`,borderRadius:5,color:D.text,padding:"8px 11px",fontSize:12,outline:"none",boxSizing:"border-box",cursor:"pointer",appearance:"none"}}>{children}</select>
      :<input {...p} style={{width:"100%",background:D.bg3,border:`1px solid ${D.border2}`,borderRadius:5,color:D.text,padding:"8px 11px",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
    }
  </div>
);

const ZeroBadge = ({track}) => (
  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
    {track.badge_owned&&<span style={{background:"#2A8A4A18",color:D.green,border:"1px solid #2A8A4A28",fontSize:8,padding:"2px 7px",borderRadius:3,fontWeight:800,letterSpacing:0.7}}>✓ 100% MASTER OWNED</span>}
    {track.badge_cleared&&<span style={{background:"#2A8A4A18",color:D.green,border:"1px solid #2A8A4A28",fontSize:8,padding:"2px 7px",borderRadius:3,fontWeight:800,letterSpacing:0.7}}>✓ PUBLISHING CLEARED</span>}
    {track.badge_no_samples&&<span style={{background:"#2A8A4A18",color:D.green,border:"1px solid #2A8A4A28",fontSize:8,padding:"2px 7px",borderRadius:3,fontWeight:800,letterSpacing:0.7}}>✓ NO SAMPLES</span>}
  </div>
);

// ─── VINYL CARD ──────────────────────────────────────────────────────────────
function VinylCard({track, onSelect, onPlay, isPlaying, progress, supervisorMode}) {
  const [hov, setHov] = useState(false);
  const art = track.artwork_url || track.gradient || ART_GRADIENTS[0];
  const isUrl = art.startsWith("http");

  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={()=>onSelect(track)}
      style={{cursor:"pointer",transition:"all 0.22s cubic-bezier(.25,.8,.25,1)",transform:hov?"translateY(-5px)":"translateY(0)"}}>
      <div style={{borderRadius:8,aspectRatio:"1",position:"relative",overflow:"hidden",boxShadow:hov?`0 18px 44px rgba(0,0,0,0.75), 0 0 0 1px ${D.border2}`:`0 5px 18px rgba(0,0,0,0.55), 0 0 0 1px ${D.border}`,background:isUrl?"#111":art}}>
        {isUrl&&<img src={art} alt={track.title} style={{width:"100%",height:"100%",objectFit:"cover",position:"absolute",inset:0}}/>}
        {/* Vinyl peek */}
        <div style={{position:"absolute",right:hov?-6:6,top:"50%",transform:"translateY(-50%)",width:"80%",height:"80%",borderRadius:"50%",background:"radial-gradient(circle,#111 28%,#1a1a1a 29%,#111 44%,#1a1a1a 45%,#111 58%,#222 59%,#111 72%)",opacity:hov?0.95:0,transition:"all 0.28s"}}>
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:13,height:13,borderRadius:"50%",background:D.gold}}/>
        </div>
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
          <button onClick={e=>{e.stopPropagation();onPlay(track);}} style={{width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${D.gold},${D.goldL})`,border:"none",color:"#0B0B0B",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:`0 4px 18px ${D.gold}55`,zIndex:2}}>
            {isPlaying?"▮▮":"▶"}
          </button>
        </div>
        {/* Skip to hook */}
        {hov&&(
          <button onClick={e=>{e.stopPropagation();onPlay(track,true);}} style={{position:"absolute",bottom:8,left:8,background:"rgba(0,0,0,0.7)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.6)",fontSize:8,padding:"3px 8px",borderRadius:20,cursor:"pointer",fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",zIndex:3}}>
            ▶▶ Hook
          </button>
        )}
        <div style={{position:"absolute",bottom:10,left:10,right:10}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:2,color:"rgba(255,255,255,0.95)",lineHeight:1,textShadow:"0 2px 8px rgba(0,0,0,0.9)"}}>{track.title}</div>
          <div style={{fontSize:8,color:"rgba(255,255,255,0.38)",letterSpacing:1.5,marginTop:2,textTransform:"uppercase"}}>{track.genre} · {track.bpm} BPM</div>
        </div>
        {isPlaying&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:"rgba(255,255,255,0.1)"}}><div style={{width:`${(progress||0)*100}%`,height:"100%",background:D.gold,transition:"width 0.1s"}}/></div>}
      </div>
      <div style={{padding:"8px 2px 0"}}>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>
          <Tag label={track.mood||track.genre}/>
          {track.use_cases?.[0]&&<Tag label={track.use_cases[0]} c={D.text3} sm/>}
        </div>
        {supervisorMode&&<ZeroBadge track={track}/>}
        {track.use_case_1&&<div style={{fontSize:10,color:D.text4,marginTop:3,lineHeight:1.4}}>{track.use_case_1}</div>}
      </div>
    </div>
  );
}

// ─── MINI PLAYER ─────────────────────────────────────────────────────────────
function MiniPlayer({track, isPlaying, onToggle, progress, onExpand, onLicense}) {
  if (!track) return null;
  const art = track.artwork_url || track.gradient || ART_GRADIENTS[0];
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:5000,background:"linear-gradient(to right,#0D0D0D,#111)",borderTop:`1px solid ${D.border2}`,padding:"10px 24px",display:"flex",alignItems:"center",gap:16,boxShadow:"0 -6px 28px rgba(0,0,0,0.7)"}}>
      <div onClick={onExpand} style={{width:40,height:40,borderRadius:6,background:art.startsWith("http")?"#111":art,flexShrink:0,cursor:"pointer",overflow:"hidden",position:"relative"}}>
        {art.startsWith("http")&&<img src={art} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
      </div>
      <div style={{minWidth:140,flexShrink:0,cursor:"pointer"}} onClick={onExpand}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:1.5,color:D.text,lineHeight:1}}>{track.title}</div>
        <div style={{fontSize:9,color:D.text3,marginTop:1}}>{track.genre} · {track.bpm} BPM</div>
      </div>
      <button onClick={onToggle} style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${D.gold},${D.goldL})`,border:"none",color:"#0B0B0B",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
        {isPlaying?"▮▮":"▶"}
      </button>
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:3}}>
        <div style={{height:2,background:D.bg5,borderRadius:1}}>
          <div style={{width:`${(progress||0)*100}%`,height:"100%",background:`linear-gradient(to right,${D.gold},${D.goldL})`,borderRadius:1,transition:"width 0.1s"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:9,color:D.text4}}>{track.bpm} BPM · {track.key||""}</span>
          <span style={{fontSize:9,color:D.text4}}>{track.duration||""}</span>
        </div>
      </div>
      <div style={{display:"flex",gap:7,flexShrink:0}}>
        <GBtn ch="License →" v="gold" sm onClick={onLicense}/>
      </div>
    </div>
  );
}

// ─── UPLOAD ZONE ─────────────────────────────────────────────────────────────
function UploadZone({label, required, file, onChange, accept}) {
  const [hov, setHov] = useState(false);
  const ref = useRef();
  return (
    <label onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:"block",background:D.bg3,border:`1px dashed ${file?D.gold:hov?D.gold:D.border2}`,borderRadius:7,padding:"12px 14px",cursor:"pointer",transition:"all 0.15s"}}>
      <div style={{fontSize:9,color:D.text4,letterSpacing:1,textTransform:"uppercase",fontWeight:700,marginBottom:3}}>
        {label}{required&&<span style={{color:D.gold}}> *</span>}
      </div>
      {file
        ?<div style={{fontSize:11,color:D.green,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>✓ {typeof file==="string"?file:file.name}</div>
        :<div style={{fontSize:10,color:D.text4}}>Tap to select file</div>
      }
      <input ref={ref} type="file" accept={accept||"audio/*"} style={{display:"none"}} onChange={e=>{if(e.target.files[0])onChange(e.target.files[0]);}}/>
    </label>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [tracks,     setTracks]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [supervisorMode, setSupervisorMode] = useState(false);
  const [threePicksMode, setThreePicksMode] = useState(false);
  const [searchQ,    setSearchQ]    = useState("");
  const [searchRes,  setSearchRes]  = useState([]);
  const [isSearching,setIsSearching]= useState(false);
  const [playing,    setPlaying]    = useState(null);
  const [progress,   setProgress]   = useState({});
  const [selected,   setSelected]   = useState(null);
  const [licModal,   setLicModal]   = useState(null);
  const [licTier,    setLicTier]    = useState("sync");
  const [buyerF,     setBuyerF]     = useState({name:"",company:"",artist:"",project:"",email:""});
  const [contactModal,setContactModal]=useState(null);
  const [contactF,   setContactF]   = useState({name:"",company:"",role:"",project:"",medium:"",scene:"",notes:"",email:""});
  const [contactDone,setContactDone]= useState(false);
  const [ctModal,    setCtModal]    = useState(null);
  const [page,       setPage]       = useState("home");
  const [authed,     setAuthed]     = useState(false);
  const [pw,         setPw]         = useState("");
  const [pwErr,      setPwErr]      = useState(false);
  const [inbox,      setInbox]      = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadErr,  setUploadErr]  = useState("");

  // Upload form state
  const [uTitle,   setUTitle]   = useState("");
  const [uGenre,   setUGenre]   = useState("");
  const [uMood,    setUMood]    = useState("");
  const [uBpm,     setUBpm]     = useState("");
  const [uKey,     setUKey]     = useState("");
  const [uDur,     setUDur]     = useState("");
  const [uDesc,    setUDesc]    = useState("");
  const [uUseCase1,setUUseCase1]= useState("");
  const [uUseCases,setUUseCases]= useState("");
  const [uTags,    setUTags]    = useState("");
  const [uSection, setUSection] = useState("featured");
  const [uPSync,   setUPSync]   = useState("");
  const [uPBundle, setUPBundle] = useState("");
  const [uPExcl,   setUPExcl]  = useState("");
  const [uHook,    setUHook]    = useState(0.3);
  const [uArtGrad, setUArtGrad] = useState(ART_GRADIENTS[0]);
  const [fileMain,  setFileMain]  = useState(null);
  const [fileInst,  setFileInst]  = useState(null);
  const [fileClean, setFileClean] = useState(null);
  const [fileLoop30,setFileLoop30]= useState(null);
  const [fileLoop60,setFileLoop60]= useState(null);
  const [fileArt,   setFileArt]   = useState(null);
  const [artPreview,setArtPreview]= useState(null);

  const audioRefs = useRef({});

  // ── Load tracks from Supabase ──────────────────────────────────────────────
  useEffect(() => {
    loadTracks();
    loadInbox();
  }, []);

  const loadTracks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setTracks(data);
    setLoading(false);
  };

  const loadInbox = async () => {
    const { data } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setInbox(data);
  };

  // ── Audio ──────────────────────────────────────────────────────────────────
  const togglePlay = (track, hookJump=false) => {
    const id = track.id;
    const audio = audioRefs.current[id];
    if (playing === id && !hookJump) { audio?.pause(); setPlaying(null); return; }
    Object.values(audioRefs.current).forEach(a=>a?.pause());
    setPlaying(id);
    if (audio) {
      if (hookJump && track.hook_start && audio.duration) {
        audio.currentTime = audio.duration * track.hook_start;
      }
      audio.play().catch(()=>{});
    }
  };

  // ── Search ─────────────────────────────────────────────────────────────────
  const handleSearch = (q) => {
    setSearchQ(q);
    if (q.trim().length > 1) { setSearchRes(doSearch(q, tracks)); setIsSearching(true); }
    else { setIsSearching(false); setSearchRes([]); }
  };

  // ── Upload to Supabase ─────────────────────────────────────────────────────
  const uploadFile = async (file, bucket, folder) => {
    if (!file) return null;
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}_${uid()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleUpload = async () => {
    if (!uTitle.trim()) { setUploadErr("Title is required."); return; }
    if (!uGenre) { setUploadErr("Genre is required."); return; }
    if (!uMood.trim()) { setUploadErr("Mood is required."); return; }
    if (!uBpm) { setUploadErr("BPM is required."); return; }
    if (!fileMain) { setUploadErr("Master audio file is required."); return; }

    setUploadErr("");
    setUploading(true);

    try {
      const trackId = `track_${Date.now()}`;

      setUploadProgress("Uploading master audio...");
      const audioMasterUrl = await uploadFile(fileMain, "audio", trackId);

      setUploadProgress("Uploading instrumental...");
      const audioInstUrl = await uploadFile(fileInst, "audio", trackId);

      setUploadProgress("Uploading clean version...");
      const audioCleanUrl = await uploadFile(fileClean, "audio", trackId);

      setUploadProgress("Uploading 30-second loop...");
      const audioLoop30Url = await uploadFile(fileLoop30, "audio", trackId);

      setUploadProgress("Uploading 60-second cut...");
      const audioLoop60Url = await uploadFile(fileLoop60, "audio", trackId);

      setUploadProgress("Uploading artwork...");
      const artworkUrl = await uploadFile(fileArt, "artwork", trackId);

      setUploadProgress("Saving to database...");
      const { error } = await supabase.from("tracks").insert({
        title: uTitle.toUpperCase().trim(),
        genre: uGenre,
        mood: uMood.trim(),
        bpm: parseInt(uBpm) || 120,
        key: uKey.trim(),
        duration: uDur.trim(),
        hook_start: uHook,
        price_sync: parseInt(uPSync) || 300,
        price_bundle: parseInt(uPBundle) || 450,
        price_exclusive: parseInt(uPExcl) || 2000,
        description: uDesc.trim(),
        use_case_1: uUseCase1.trim(),
        use_cases: uUseCases.split(",").map(s=>s.trim()).filter(Boolean),
        tags: uTags.split(",").map(s=>s.trim().toLowerCase()).filter(Boolean),
        section: uSection,
        gradient: artworkUrl ? null : uArtGrad,
        artwork_url: artworkUrl,
        badge_owned: true,
        badge_cleared: true,
        badge_no_samples: true,
        pack_instrumental: !!fileInst,
        pack_clean: !!fileClean,
        pack_loop30: !!fileLoop30,
        pack_loop60: !!fileLoop60,
        audio_master_url: audioMasterUrl,
        audio_inst_url: audioInstUrl,
        audio_clean_url: audioCleanUrl,
        audio_loop30_url: audioLoop30Url,
        audio_loop60_url: audioLoop60Url,
      });

      if (error) throw new Error(error.message);

      setUploadProgress("Done!");
      await loadTracks();

      // Reset form
      setUTitle(""); setUGenre(""); setUMood(""); setUBpm(""); setUKey("");
      setUDur(""); setUDesc(""); setUUseCase1(""); setUUseCases(""); setUTags("");
      setUSection("featured"); setUPSync(""); setUPBundle(""); setUPExcl("");
      setUHook(0.3); setUArtGrad(ART_GRADIENTS[0]);
      setFileMain(null); setFileInst(null); setFileClean(null);
      setFileLoop30(null); setFileLoop60(null); setFileArt(null); setArtPreview(null);
      setShowUpload(false);
      setUploadProgress("");

    } catch (err) {
      setUploadErr(err.message);
      setUploadProgress("");
    }
    setUploading(false);
  };

  // ── Contact / Sync request ─────────────────────────────────────────────────
  const submitContact = async () => {
    await supabase.from("inquiries").insert({
      track_title: contactModal.title,
      ...contactF,
      status: "pending",
    });
    const s = `[CURATED] Sync Request — "${contactModal.title}"`;
    const b = `Track: ${contactModal.title}\nFrom: ${contactF.name} (${contactF.role})\nCompany: ${contactF.company}\nProject: ${contactF.project}\nMedium: ${contactF.medium}\nEmail: ${contactF.email}\nNotes: ${contactF.notes}`;
    window.open(`mailto:hello@wedesignsstudio.com?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(b)}`);
    setContactDone(true);
    await loadInbox();
  };

  const updateInquiryStatus = async (id, status) => {
    await supabase.from("inquiries").update({status}).eq("id", id);
    setInbox(i=>i.map(r=>r.id===id?{...r,status}:r));
  };

  const deleteTrack = async (id) => {
    await supabase.from("tracks").delete().eq("id", id);
    setTracks(ts=>ts.filter(t=>t.id!==id));
  };

  const pending = inbox.filter(r=>r.status==="pending").length;
  const featured  = tracks.filter(t=>t.section==="featured");
  const emotional = tracks.filter(t=>t.section==="emotional");
  const latest    = tracks.filter(t=>t.section==="latest");
  const showTracks = (list) => threePicksMode
    ? (supervisorMode?list.filter(t=>t.badge_owned&&t.badge_cleared&&t.badge_no_samples):list).slice(0,3)
    : (supervisorMode?list.filter(t=>t.badge_owned&&t.badge_cleared&&t.badge_no_samples):list);
  const sCol = {pending:D.gold,reviewing:D.purple,approved:D.green,declined:D.red};

  const Section = ({title, sub, list}) => {
    const shown = showTracks(list);
    if (!shown.length) return null;
    return (
      <section style={{marginBottom:48}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:18}}>
          <div>
            <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:3,color:D.text,margin:0}}>{title}</h2>
            {sub&&<p style={{fontSize:11,color:D.text3,margin:"3px 0 0"}}>{sub}</p>}
          </div>
          <span style={{fontSize:9,color:D.text4,letterSpacing:1,fontWeight:700}}>{shown.length} TRACKS</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:16}}>
          {shown.map((t,i)=>(
            <div key={t.id} style={{animation:`up 0.28s ${i*0.06}s both`}}>
              {t.audio_master_url&&(
                <audio ref={el=>audioRefs.current[t.id]=el} src={t.audio_master_url}
                  onTimeUpdate={e=>setProgress(p=>({...p,[t.id]:e.target.currentTime/e.target.duration}))}
                  onEnded={()=>setPlaying(null)}/>
              )}
              <VinylCard track={t} onSelect={setSelected} onPlay={togglePlay} isPlaying={playing===t.id} progress={progress[t.id]||0} supervisorMode={supervisorMode}/>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:${D.bg};color:${D.text};font-family:'IBM Plex Sans',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${D.bg}}::-webkit-scrollbar-thumb{background:${D.border3};border-radius:2px}
        @keyframes up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes eq{from{transform:scaleY(0.25)}to{transform:scaleY(1)}}
        @keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .srch::placeholder{color:${D.text4}}
        .srch:focus{border-color:${D.gold}!important;outline:none;box-shadow:0 0 0 2px ${D.gold}20}
        input:focus,textarea:focus,select:focus{border-color:${D.gold}!important;outline:none}
      `}</style>

      {/* ── NAV ── */}
      <nav style={{position:"sticky",top:0,zIndex:4000,background:"rgba(11,11,11,0.94)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${D.border}`,padding:"0 28px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:6,color:D.text}}>CURATED</div>
          <div style={{width:4,height:4,borderRadius:"50%",background:D.gold,animation:"pulse 2s infinite"}}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={()=>setSupervisorMode(v=>!v)} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 14px",borderRadius:20,border:`1px solid ${supervisorMode?D.gold:D.border3}`,background:supervisorMode?D.gold+"18":"transparent",cursor:"pointer",transition:"all 0.2s",fontFamily:"'IBM Plex Sans',sans-serif"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:supervisorMode?D.gold:D.text4,transition:"all 0.2s"}}/>
            <span style={{fontSize:10,fontWeight:700,letterSpacing:1,color:supervisorMode?D.gold:D.text4,textTransform:"uppercase"}}>Supervisor Mode</span>
          </button>
          <button onClick={()=>setThreePicksMode(v=>!v)} style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${threePicksMode?"#3A6A9A":D.border3}`,background:threePicksMode?"#3A6A9A18":"transparent",cursor:"pointer",transition:"all 0.2s",fontFamily:"'IBM Plex Sans',sans-serif",fontSize:10,fontWeight:700,letterSpacing:1,color:threePicksMode?"#3A6A9A":D.text4,textTransform:"uppercase"}}>
            3 Picks Only
          </button>
          {page==="admin"
            ?<GBtn ch="← Home" v="ghost" sm onClick={()=>setPage("home")}/>
            :<button onClick={()=>setPage("admin")} style={{background:"none",border:`1px solid ${D.border2}`,color:D.text4,fontSize:9,fontWeight:700,letterSpacing:1,padding:"5px 11px",borderRadius:4,cursor:"pointer",textTransform:"uppercase",position:"relative"}}>
              Admin{pending>0&&<span style={{position:"absolute",top:-3,right:-3,width:7,height:7,borderRadius:"50%",background:D.red}}/>}
            </button>
          }
        </div>
      </nav>

      {supervisorMode&&(
        <div style={{background:`linear-gradient(to right,${D.gold}18,${D.gold}08)`,borderBottom:`1px solid ${D.gold}30`,padding:"8px 28px",display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:D.gold,animation:"pulse 1.5s infinite"}}/>
          <span style={{fontSize:11,fontWeight:700,color:D.gold,letterSpacing:0.5}}>SUPERVISOR MODE</span>
          <span style={{fontSize:10,color:D.text3}}>Pre-cleared · Download-ready · All rights verified</span>
          <span style={{fontSize:9,color:D.green,fontWeight:700,marginLeft:"auto"}}>✓ MASTER OWNED · ✓ PUBLISHING CLEARED · ✓ NO SAMPLES</span>
        </div>
      )}

      {/* ══ HOME ══ */}
      {page==="home"&&(
        <>
          <section style={{padding:"52px 28px 44px",borderBottom:`1px solid ${D.border}`,maxWidth:1200,margin:"0 auto"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:44,alignItems:"center"}}>
              <div style={{animation:"up 0.4s both"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                  <div style={{width:20,height:1,background:D.gold}}/>
                  <span style={{fontSize:9,color:D.gold,letterSpacing:3,textTransform:"uppercase",fontWeight:700}}>Premium Music Licensing</span>
                </div>
                <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:68,letterSpacing:2,color:D.text,lineHeight:0.92,marginBottom:16}}>
                  A Search Engine<br/><span style={{color:D.gold}}>for Feelings.</span>
                </h1>
                <p style={{fontSize:13,color:D.text2,lineHeight:1.85,maxWidth:400,marginBottom:24}}>
                  Find, preview, and license music in under 30 seconds. Every track is pre-cleared, fully owned, and ships with a complete download pack.
                </p>
                <div style={{position:"relative",maxWidth:480,marginBottom:14}}>
                  <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:D.text4,fontSize:15,pointerEvents:"none"}}>⌕</span>
                  <input className="srch" value={searchQ} onChange={e=>handleSearch(e.target.value)}
                    placeholder='Try "pregame hype", "sad film", "villain scene", "locker room"...'
                    style={{width:"100%",background:D.bg3,border:`1px solid ${D.border2}`,borderRadius:6,padding:"12px 40px 12px 38px",fontSize:12,color:D.text,transition:"all 0.15s"}}/>
                  {searchQ&&<button onClick={()=>{setSearchQ("");setIsSearching(false);}} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:D.text4,cursor:"pointer",fontSize:15,padding:2}}>✕</button>}
                </div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {USE_CASES_QUICK.slice(0,8).map(u=>(
                    <button key={u} onClick={()=>handleSearch(u.toLowerCase())} style={{padding:"4px 11px",borderRadius:20,border:`1px solid ${D.border2}`,background:"transparent",color:D.text4,fontSize:9,fontWeight:700,cursor:"pointer",letterSpacing:0.5,textTransform:"uppercase",transition:"all 0.15s"}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=D.gold;e.currentTarget.style.color=D.gold;}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=D.border2;e.currentTarget.style.color=D.text4;}}>{u}</button>
                  ))}
                </div>
              </div>
              {/* Vinyl collage */}
              <div style={{position:"relative",height:360,animation:"up 0.5s 0.1s both"}}>
                {tracks.slice(0,4).map((t,i)=>{
                  const pos=[{top:0,left:0,rot:-7,z:1},{top:24,left:90,rot:4,z:2},{top:55,left:175,rot:-5,z:3},{top:8,left:255,rot:6,z:4}][i];
                  if(!pos)return null;
                  const art = t.artwork_url || t.gradient || ART_GRADIENTS[i%ART_GRADIENTS.length];
                  return(
                    <div key={t.id} onClick={()=>setSelected(t)} style={{position:"absolute",top:pos.top,left:pos.left,width:185,height:185,cursor:"pointer",zIndex:pos.z,transform:`rotate(${pos.rot}deg)`,transition:"all 0.28s",borderRadius:9,overflow:"hidden",boxShadow:`0 10px 36px rgba(0,0,0,0.65), 0 0 0 1px ${D.border}`,background:art.startsWith("http")?"#111":art}}
                      onMouseEnter={e=>{e.currentTarget.style.transform=`rotate(${pos.rot}deg) scale(1.07) translateY(-7px)`;e.currentTarget.style.zIndex="10";}}
                      onMouseLeave={e=>{e.currentTarget.style.transform=`rotate(${pos.rot}deg)`;e.currentTarget.style.zIndex=pos.z;}}>
                      {art.startsWith("http")&&<img src={art} alt="" style={{width:"100%",height:"100%",objectFit:"cover",position:"absolute",inset:0}}/>}
                      <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.75) 0%,transparent 50%)"}}/>
                      <div style={{position:"absolute",bottom:9,left:10}}>
                        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:2,color:"rgba(255,255,255,0.92)"}}>{t.title}</div>
                        <div style={{fontSize:7,color:"rgba(255,255,255,0.35)",letterSpacing:2,textTransform:"uppercase"}}>{t.genre}</div>
                      </div>
                    </div>
                  );
                })}
                <div style={{position:"absolute",bottom:16,right:0,background:`linear-gradient(135deg,${D.bg3},${D.bg4})`,border:`1px solid ${D.border2}`,borderRadius:9,padding:"13px 16px",zIndex:20,boxShadow:`0 12px 36px rgba(0,0,0,0.65)`}}>
                  <div style={{fontSize:7,color:D.gold,letterSpacing:3,textTransform:"uppercase",fontWeight:700,marginBottom:3}}>Ready to License</div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:2,color:D.text}}>Curated Sounds</div>
                  <div style={{fontSize:9,color:D.text3,marginTop:3}}>{tracks.length} tracks · Pre-cleared · Download ready</div>
                </div>
              </div>
            </div>
          </section>

          <div style={{maxWidth:1200,margin:"0 auto",padding:"0 28px"}}>
            {/* Search results */}
            {isSearching&&(
              <section style={{padding:"36px 0",borderBottom:`1px solid ${D.border}`}}>
                <div style={{marginBottom:18}}>
                  <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:3,color:D.text,marginBottom:3}}>
                    {searchRes.length?`Results for "${searchQ}"`:`No results for "${searchQ}"`}
                  </h2>
                  <p style={{fontSize:10,color:D.text3}}>{searchRes.length} track{searchRes.length!==1?"s":""} matched</p>
                </div>
                {searchRes.length>0?(
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:16}}>
                    {(threePicksMode?searchRes.slice(0,3):searchRes).map((t,i)=>(
                      <div key={t.id} style={{animation:`up 0.24s ${i*0.05}s both`}}>
                        {t.audio_master_url&&<audio ref={el=>audioRefs.current[t.id]=el} src={t.audio_master_url} onTimeUpdate={e=>setProgress(p=>({...p,[t.id]:e.target.currentTime/e.target.duration}))} onEnded={()=>setPlaying(null)}/>}
                        <VinylCard track={t} onSelect={setSelected} onPlay={togglePlay} isPlaying={playing===t.id} progress={progress[t.id]||0} supervisorMode={supervisorMode}/>
                      </div>
                    ))}
                  </div>
                ):(
                  <div style={{textAlign:"center",padding:"44px",color:D.text4,border:`1px dashed ${D.border}`,borderRadius:8}}>
                    <div style={{fontSize:28,marginBottom:10,opacity:0.25}}>♫</div>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:2,color:D.text3,marginBottom:5}}>Nothing matched</div>
                    <div style={{fontSize:11}}>Try: pregame · sad · dark · menu loop · trailer · locker room</div>
                  </div>
                )}
              </section>
            )}

            {/* Loading */}
            {loading&&(
              <div style={{textAlign:"center",padding:"80px 0"}}>
                <div style={{width:32,height:32,border:`3px solid ${D.border2}`,borderTop:`3px solid ${D.gold}`,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px"}}/>
                <div style={{color:D.text3,fontSize:12}}>Loading catalog...</div>
              </div>
            )}

            {!loading&&(
              <>
                <div style={{paddingTop:44}}>
                  {featured.length>0
                    ?<Section title="Featured Sounds" sub="Hand-picked for film, TV, and broadcast" list={featured}/>
                    :<div style={{textAlign:"center",padding:"60px 0",color:D.text4,border:`1px dashed ${D.border}`,borderRadius:8,marginTop:44,marginBottom:44}}>
                      <div style={{fontSize:32,marginBottom:12,opacity:0.2}}>♫</div>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:2,color:D.text3,marginBottom:6}}>No tracks yet</div>
                      <div style={{fontSize:12,marginBottom:20}}>Upload your first track in the Admin panel</div>
                      <GBtn ch="Go to Admin →" v="gold" onClick={()=>setPage("admin")}/>
                    </div>
                  }
                  <Section title="Emotional Catalog" sub="R&B, Soul, Ambient — for the moments that hit" list={emotional}/>
                  <Section title="Latest Drops" sub="Freshly composed and ready to license" list={latest}/>
                </div>
                <div style={{height:80}}/>
              </>
            )}
          </div>
        </>
      )}

      {/* ══ ADMIN ══ */}
      {page==="admin"&&(
        <div style={{maxWidth:1100,margin:"0 auto",padding:"36px 28px 80px",animation:"up 0.25s both"}}>
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
                <GBtn sm ch="Sign Out" v="ghost" onClick={()=>{setAuthed(false);setPw("");}}/>
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

              {/* ── UPLOAD SECTION ── */}
              <div style={{marginBottom:32}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <h3 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:2,color:D.text}}>Upload New Track</h3>
                  <GBtn sm ch={showUpload?"− Hide":"+ Upload Track"} v="gold" onClick={()=>setShowUpload(v=>!v)}/>
                </div>

                {showUpload&&(
                  <div style={{background:D.bg2,border:`1px solid ${D.border2}`,borderRadius:10,padding:22}}>

                    {/* ARTWORK */}
                    <div style={{marginBottom:18}}>
                      <div style={{fontSize:9,color:D.gold,letterSpacing:1.5,textTransform:"uppercase",fontWeight:700,marginBottom:10}}>Artwork</div>
                      <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:16,alignItems:"start"}}>
                        {/* Image upload */}
                        <label style={{width:120,height:120,borderRadius:8,border:`2px dashed ${fileArt?D.gold:D.border2}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",flexShrink:0,background:artPreview?"#111":uArtGrad,transition:"border-color 0.15s"}}>
                          {artPreview
                            ?<img src={artPreview} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                            :<div style={{textAlign:"center",padding:10}}>
                              <div style={{fontSize:24,marginBottom:4,opacity:0.4}}>🖼</div>
                              <div style={{fontSize:9,color:D.text4,textTransform:"uppercase",letterSpacing:0.5}}>Upload Art</div>
                            </div>
                          }
                          <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
                            const f=e.target.files[0];
                            if(f){setFileArt(f);setArtPreview(URL.createObjectURL(f));}
                          }}/>
                        </label>
                        {/* Gradient presets */}
                        <div>
                          <div style={{fontSize:9,color:D.text4,marginBottom:7,letterSpacing:0.5}}>Or pick a gradient preset:</div>
                          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                            {ART_GRADIENTS.map((g,i)=>(
                              <button key={i} onClick={()=>{setUArtGrad(g);setFileArt(null);setArtPreview(null);}} style={{width:36,height:36,borderRadius:6,background:g,border:`2px solid ${uArtGrad===g&&!fileArt?D.gold:"transparent"}`,cursor:"pointer",transition:"border-color 0.15s",flexShrink:0}}/>
                            ))}
                          </div>
                          {fileArt&&<div style={{fontSize:10,color:D.green,marginTop:6}}>✓ Using uploaded image</div>}
                        </div>
                      </div>
                    </div>

                    {/* AUDIO FILES */}
                    <div style={{marginBottom:18}}>
                      <div style={{fontSize:9,color:D.gold,letterSpacing:1.5,textTransform:"uppercase",fontWeight:700,marginBottom:10}}>Audio Files</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                        <UploadZone label="Master WAV / MP3" required file={fileMain} onChange={setFileMain}/>
                        <UploadZone label="Instrumental" file={fileInst} onChange={setFileInst}/>
                        <UploadZone label="Clean Version" file={fileClean} onChange={setFileClean}/>
                        <UploadZone label="30-Second Loop" file={fileLoop30} onChange={setFileLoop30}/>
                        <UploadZone label="60-Second Cut" file={fileLoop60} onChange={setFileLoop60}/>
                      </div>
                    </div>

                    {/* TRACK INFO */}
                    <div style={{height:1,background:D.border,marginBottom:16}}/>
                    <div style={{fontSize:9,color:D.gold,letterSpacing:1.5,textTransform:"uppercase",fontWeight:700,marginBottom:10}}>Track Info</div>

                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                      <Fld label="Title *" value={uTitle} onChange={e=>setUTitle(e.target.value)} placeholder="e.g. FRACTURE"/>
                      <Fld label="Genre *" as="select" value={uGenre} onChange={e=>setUGenre(e.target.value)}>
                        <option value="">Select genre...</option>
                        {GENRES.map(g=><option key={g}>{g}</option>)}
                      </Fld>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
                      <Fld label="Mood *" value={uMood} onChange={e=>setUMood(e.target.value)} placeholder="e.g. Tense"/>
                      <Fld label="BPM *" type="number" value={uBpm} onChange={e=>setUBpm(e.target.value)} placeholder="138"/>
                      <Fld label="Key" value={uKey} onChange={e=>setUKey(e.target.value)} placeholder="Dm"/>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
                      <Fld label="Sync Price ($)" type="number" value={uPSync} onChange={e=>setUPSync(e.target.value)} placeholder="350"/>
                      <Fld label="Bundle Price ($)" type="number" value={uPBundle} onChange={e=>setUPBundle(e.target.value)} placeholder="500"/>
                      <Fld label="Exclusive Price ($)" type="number" value={uPExcl} onChange={e=>setUPExcl(e.target.value)} placeholder="2500"/>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                      <Fld label="Duration" value={uDur} onChange={e=>setUDur(e.target.value)} placeholder="2:34"/>
                      <Fld label="Section" as="select" value={uSection} onChange={e=>setUSection(e.target.value)}>
                        <option value="featured">Featured</option>
                        <option value="emotional">Emotional</option>
                        <option value="latest">Latest Drops</option>
                      </Fld>
                    </div>
                    <Fld label="One-Line Use Case" value={uUseCase1} onChange={e=>setUUseCase1(e.target.value)} placeholder="Pregame hype, villain scene, highlight reel"/>
                    <Fld label="Description" as="textarea" value={uDesc} onChange={e=>setUDesc(e.target.value)} placeholder="Describe the mood, energy, and best placement..."/>
                    <Fld label="Use Cases (comma separated)" value={uUseCases} onChange={e=>setUUseCases(e.target.value)} placeholder="Pregame Hype, Highlight Reel, Villain Reveal"/>
                    <Fld label="Search Tags (comma separated)" value={uTags} onChange={e=>setUTags(e.target.value)} placeholder="dark trap, hype, aggressive, cinematic, locker room"/>

                    {/* Hook slider */}
                    <div style={{marginBottom:14}}>
                      <label style={{display:"block",color:D.text4,fontSize:9,marginBottom:5,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600}}>Hook Jump Point — {Math.round(uHook*100)}% into track</label>
                      <input type="range" min="0" max="0.9" step="0.05" value={uHook} onChange={e=>setUHook(parseFloat(e.target.value))} style={{width:"100%",accentColor:D.gold,cursor:"pointer"}}/>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:D.text4,marginTop:3}}>
                        <span>Intro</span><span>← Where does the hook hit? →</span><span>End</span>
                      </div>
                    </div>

                    {uploadErr&&<p style={{color:D.red,fontSize:11,marginBottom:8}}>⚠ {uploadErr}</p>}
                    {uploadProgress&&<p style={{color:D.gold,fontSize:11,marginBottom:8,display:"flex",alignItems:"center",gap:7}}><span style={{display:"inline-block",width:12,height:12,border:`2px solid ${D.gold}40`,borderTop:`2px solid ${D.gold}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>  {uploadProgress}</p>}

                    <GBtn full ch={uploading?"Uploading...":"Add Track to Catalog →"} v="gold" disabled={uploading} sx={{padding:11,fontSize:12}} onClick={handleUpload}/>
                  </div>
                )}
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
                            <Tag label={(req.status||"pending").toUpperCase()} c={sCol[req.status||"pending"]}/>
                          </div>
                          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:4}}>
                            <Tag label={`↳ ${req.track_title||req.track}`}/>
                            {req.medium&&<Tag label={req.medium} c={D.text3}/>}
                            {req.scene&&<Tag label={req.scene} c={D.text3}/>}
                          </div>
                          <p style={{color:D.text3,fontSize:10,marginBottom:req.notes?2:0}}><b style={{color:D.text2}}>Project:</b> {req.project}</p>
                          {req.notes&&<p style={{color:D.text4,fontSize:10,fontStyle:"italic"}}>"{req.notes}"</p>}
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:4,minWidth:90}}>
                          <GBtn sm ch="✉ Reply" v="gold" onClick={()=>window.open(`mailto:${req.email}?subject=${encodeURIComponent(`Re: "${req.track_title||req.track}" | CURATED`)}`)}/>
                          {["reviewing","approved","declined"].map(s=>(
                            <GBtn key={s} sm ch={s.charAt(0).toUpperCase()+s.slice(1)} v={s==="approved"?"green":s==="declined"?"red":"ghost"} sx={{justifyContent:"center"}} onClick={()=>updateInquiryStatus(req.id,s)}/>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {inbox.length===0&&<div style={{textAlign:"center",padding:"24px",color:D.text4,border:`1px dashed ${D.border}`,borderRadius:7,fontSize:11}}>No requests yet.</div>}
                </div>
              </div>

              {/* Catalog */}
              <div>
                <h3 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:2,color:D.text,marginBottom:12}}>Track Catalog <span style={{fontSize:12,color:D.text4,fontWeight:400,letterSpacing:0}}>({tracks.length} tracks)</span></h3>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  {tracks.map(t=>{
                    const art = t.artwork_url||t.gradient||ART_GRADIENTS[0];
                    return(
                      <div key={t.id} style={{background:D.bg2,border:`1px solid ${D.border}`,borderRadius:7,padding:"11px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:14}}>
                        <div style={{display:"flex",gap:11,alignItems:"center",flex:1,minWidth:0}}>
                          <div style={{width:38,height:38,borderRadius:5,background:art.startsWith("http")?"#111":art,flexShrink:0,overflow:"hidden",position:"relative"}}>
                            {art.startsWith("http")&&<img src={art} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
                            {t.audio_master_url&&<div style={{position:"absolute",bottom:2,right:2,width:6,height:6,borderRadius:"50%",background:D.green}}/>}
                          </div>
                          <div style={{minWidth:0}}>
                            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:1.5,color:D.text}}>{t.title}</div>
                            <div style={{display:"flex",gap:4,marginTop:2,flexWrap:"wrap"}}>
                              <Tag label={t.genre} sm/><Tag label={t.mood} c={D.text3} sm/><Tag label={`${t.bpm} BPM`} c={D.text4} sm/>
                              {t.pack_instrumental&&<Tag label="Inst" c={D.text4} sm/>}
                              {t.pack_clean&&<Tag label="Clean" c={D.text4} sm/>}
                            </div>
                          </div>
                        </div>
                        <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:D.gold,fontWeight:700}}>${t.price_sync}</span>
                          <GBtn sm ch="Remove" v="red" onClick={()=>deleteTrack(t.id)}/>
                        </div>
                      </div>
                    );
                  })}
                  {tracks.length===0&&<div style={{textAlign:"center",padding:"28px",color:D.text4,border:`1px dashed ${D.border}`,borderRadius:7,fontSize:11}}>No tracks yet. Upload your first track above.</div>}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Mini player */}
      {playing&&(
        <MiniPlayer track={tracks.find(t=>t.id===playing)} isPlaying={true}
          onToggle={()=>{audioRefs.current[playing]?.pause();setPlaying(null);}}
          progress={progress[playing]||0}
          onExpand={()=>setSelected(tracks.find(t=>t.id===playing))}
          onLicense={()=>setLicModal(tracks.find(t=>t.id===playing))}/>
      )}

      {/* Track detail */}
      {selected&&(()=>{
        const art = selected.artwork_url||selected.gradient||ART_GRADIENTS[0];
        return(
          <Modal wide title={selected.title} sub={`${selected.genre} · ${selected.mood} · ${selected.bpm} BPM · ${selected.key||""}`} onClose={()=>setSelected(null)}>
            <div style={{display:"grid",gridTemplateColumns:"160px 1fr",gap:18,marginBottom:18}}>
              <div style={{borderRadius:9,aspectRatio:"1",background:art.startsWith("http")?"#111":art,overflow:"hidden",boxShadow:"0 6px 28px rgba(0,0,0,0.6)",flexShrink:0}}>
                {art.startsWith("http")&&<img src={art} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
              </div>
              <div>
                <div style={{marginBottom:10}}><ZeroBadge track={selected}/></div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
                  <Tag label={selected.mood}/><Tag label={selected.genre} c={D.text3}/><Tag label={`${selected.bpm} BPM`} c={D.text4}/>
                </div>
                <p style={{color:D.text2,fontSize:12,lineHeight:1.75,marginBottom:10}}>{selected.description}</p>
                {selected.use_cases?.length>0&&(
                  <div style={{marginBottom:10}}>
                    <div style={{fontSize:9,color:D.text4,letterSpacing:1,textTransform:"uppercase",marginBottom:5,fontWeight:700}}>Use Cases</div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {selected.use_cases.map(u=><Tag key={u} label={u} c={D.text3}/>)}
                    </div>
                  </div>
                )}
                <div style={{background:D.bg3,border:`1px solid ${D.border}`,borderRadius:6,padding:"10px 12px",marginBottom:10}}>
                  <div style={{fontSize:9,color:D.gold,letterSpacing:1.5,textTransform:"uppercase",fontWeight:700,marginBottom:6}}>Pack Includes</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                    {[["WAV Master",true],["Instrumental",selected.pack_instrumental],["Clean Version",selected.pack_clean],["30-Sec Loop",selected.pack_loop30],["60-Sec Cut",selected.pack_loop60]].map(([l,v])=>(
                      <div key={l} style={{fontSize:10,color:v?D.text2:D.text4,display:"flex",alignItems:"center",gap:5}}>
                        <span style={{color:v?D.green:D.text4,fontWeight:700}}>{v?"✓":"—"}</span>{l}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <button onClick={()=>togglePlay(selected)} style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${D.gold},${D.goldL})`,border:"none",color:"#0B0B0B",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
                    {playing===selected.id?"▮▮":"▶"}
                  </button>
                  <div style={{flex:1,height:2,background:D.bg5,borderRadius:1}}>
                    <div style={{width:`${(progress[selected.id]||0)*100}%`,height:"100%",background:`linear-gradient(to right,${D.gold},${D.goldL})`,borderRadius:1,transition:"width 0.1s"}}/>
                  </div>
                  <button onClick={()=>togglePlay(selected,true)} style={{background:D.bg3,border:`1px solid ${D.border2}`,color:D.text3,fontSize:9,padding:"4px 10px",borderRadius:20,cursor:"pointer",fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",whiteSpace:"nowrap"}}>▶▶ Hook</button>
                </div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
              {[{id:"sync",label:"Sync License",desc:"One project"},{id:"bundle",label:"Bundle Pack",desc:"All 5 files"},{id:"exclusive",label:"Exclusive",desc:"Full buyout"}].map(tier=>(
                <div key={tier.id} style={{background:D.bg3,border:`1px solid ${D.border2}`,borderRadius:7,padding:"12px",textAlign:"center",cursor:"pointer",transition:"all 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=D.gold} onMouseLeave={e=>e.currentTarget.style.borderColor=D.border2}>
                  <div style={{fontSize:10,fontWeight:700,color:D.text,letterSpacing:0.5,marginBottom:3,textTransform:"uppercase"}}>{tier.label}</div>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:20,fontWeight:700,color:D.gold,marginBottom:3}}>${tierId==="sync"?selected.price_sync:tier.id==="bundle"?selected.price_bundle:selected.price_exclusive}</div>
                  <div style={{fontSize:9,color:D.text4}}>{tier.desc}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <GBtn full ch="License This Track →" v="gold" onClick={()=>{setLicModal(selected);setSelected(null);}} sx={{flex:1,padding:10}}/>
              <GBtn ch="Contact Creator" v="ghost" onClick={()=>{setContactF({name:"",company:"",role:"",project:"",medium:"",scene:"",notes:"",email:""});setContactDone(false);setContactModal(selected);setSelected(null);}} sx={{padding:10}}/>
            </div>
          </Modal>
        );
      })()}

      {/* License modal */}
      {licModal&&(
        <Modal title="License This Track" sub={`"${licModal.title}" · Choose your license`} onClose={()=>setLicModal(null)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:18}}>
            {[{id:"sync",label:"Sync",price:licModal.price_sync,desc:"One project"},{id:"bundle",label:"Bundle",price:licModal.price_bundle,desc:"All 5 files"},{id:"exclusive",label:"Exclusive",price:licModal.price_exclusive,desc:"Full buyout"}].map(tier=>(
              <div key={tier.id} onClick={()=>setLicTier(tier.id)} style={{background:licTier===tier.id?D.gold+"14":D.bg3,border:`1px solid ${licTier===tier.id?D.gold:D.border2}`,borderRadius:8,padding:"13px",cursor:"pointer",textAlign:"center",transition:"all 0.15s"}}>
                <div style={{fontSize:9,fontWeight:700,color:D.text,letterSpacing:0.5,marginBottom:4,textTransform:"uppercase"}}>{tier.label}</div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,fontWeight:700,color:licTier===tier.id?D.goldL:D.text,marginBottom:3}}>${tier.price}</div>
                <div style={{fontSize:8,color:D.text4}}>{tier.desc}</div>
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
          <GBtn full ch="Generate Licensing Contract →" v="gold" disabled={!buyerF.name||!buyerF.email} sx={{marginTop:5,padding:11,fontSize:12}}
            onClick={()=>{setCtModal({text:buildContract(licModal,licTier,buyerF)});setLicModal(null);}}/>
        </Modal>
      )}

      {/* Contact modal */}
      {contactModal&&(
        <Modal title="Contact Creator" sub={`Sync inquiry for "${contactModal.title}"`} onClose={()=>setContactModal(null)}>
          {contactDone?(
            <div style={{textAlign:"center",padding:"18px 0"}}>
              <div style={{width:44,height:44,borderRadius:"50%",background:D.gold+"18",border:`1px solid ${D.gold+"38"}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontSize:18,color:D.gold}}>✓</div>
              <h3 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:2,color:D.text,marginBottom:7}}>Request Sent</h3>
              <p style={{color:D.text3,fontSize:12,lineHeight:1.9}}>Your inquiry was logged. Expect a response at <b style={{color:D.text}}>{contactF.email}</b> within 48 hours.</p>
              <GBtn ch="Done" v="gold" sx={{marginTop:16}} onClick={()=>setContactModal(null)}/>
            </div>
          ):(
            <>
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
            </>
          )}
        </Modal>
      )}

      {/* Contract modal */}
      {ctModal&&(
        <Modal wide title="Licensing Agreement" sub="Download · Sign · Return to creator" onClose={()=>setCtModal(null)}>
          <div style={{display:"flex",gap:8,marginBottom:11}}>
            <GBtn ch="⬇ Download" v="gold" onClick={()=>{const b=new Blob([ctModal.text],{type:"text/plain"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=`CURATED_${uid()}.txt`;a.click();}}/>
            <GBtn ch="Copy" v="ghost" onClick={()=>navigator.clipboard?.writeText(ctModal.text)}/>
          </div>
          <pre style={{background:D.bg3,border:`1px solid ${D.border}`,borderRadius:6,padding:14,fontSize:10,lineHeight:1.85,color:D.text3,overflowX:"auto",whiteSpace:"pre-wrap",fontFamily:"'IBM Plex Mono',monospace",maxHeight:400,overflowY:"auto"}}>{ctModal.text}</pre>
          <p style={{marginTop:9,color:D.text4,fontSize:9,lineHeight:1.7}}>⚠ For deals above $10,000 consult a licensed music attorney.</p>
        </Modal>
      )}
    </>
  );
}
