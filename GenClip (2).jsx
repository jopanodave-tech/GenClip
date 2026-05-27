import { useState, useRef, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const STYLE_PRESETS = [
  { id:"cinematic",  label:"Cinématique", emoji:"🎬" },
  { id:"anime",      label:"Anime",       emoji:"✨" },
  { id:"realistic",  label:"Réaliste",    emoji:"📷" },
  { id:"abstract",   label:"Abstrait",    emoji:"🌀" },
  { id:"neon",       label:"Néon",        emoji:"💜" },
  { id:"watercolor", label:"Aquarelle",   emoji:"🎨" },
];

const IMAGE_RATIOS = [
  { id:"1:1",   label:"1:1",   icon:"⬛", w:1,  h:1  },
  { id:"16:9",  label:"16:9",  icon:"▬",  w:16, h:9  },
  { id:"9:16",  label:"9:16",  icon:"▮",  w:9,  h:16 },
  { id:"4:3",   label:"4:3",   icon:"🟫", w:4,  h:3  },
  { id:"3:4",   label:"3:4",   icon:"📱", w:3,  h:4  },
  { id:"21:9",  label:"21:9",  icon:"🎞️", w:21, h:9  },
];

const VIDEO_RATIOS = [
  { id:"16:9", label:"16:9", icon:"▬",  desc:"Paysage"  },
  { id:"9:16", label:"9:16", icon:"▮",  desc:"Portrait" },
  { id:"1:1",  label:"1:1",  icon:"⬛", desc:"Carré"    },
  { id:"4:3",  label:"4:3",  icon:"🟫", desc:"Classique"},
];

// Image models: Banana 2, Nano Banana Pro, Gemini 3.5 Flash
const IMAGE_MODELS = [
  { id:"banana2",      name:"Banana 2",         badge:"ÉQUILIBRÉ",   badgeColor:"#a3e635", desc:"Qualité premium, vitesse optimisée.",  speed:"~5s",  icon:"🍌",  provider:"GenClip"  },
  { id:"nanobanpro",   name:"Nano Banana Pro",  badge:"PRO",         badgeColor:"#f472b6", desc:"Fusion Nano+Banana — meilleur des deux.",speed:"~8s",  icon:"🚀",  provider:"GenClip"  },
  { id:"gemini35flash",name:"Gemini 3.5 Flash", badge:"GOOGLE AI",   badgeColor:"#4ade80", desc:"Génération Gemini ultra-fidèle.",       speed:"~6s",  icon:"✦",   provider:"Google"   },
];

const VIDEO_MODELS = [
  { id:"veo31lite", name:"Veo 3.1 Lite", badge:"GOOGLE",  badgeColor:"#4ade80", desc:"Génération rapide, aperçus.",   speed:"~20s", icon:"🟢", provider:"Google",    credits:10 },
  { id:"veo31fast", name:"Veo 3.1 Fast", badge:"GOOGLE",  badgeColor:"#fb923c", desc:"Haute fidélité accélérée.",     speed:"~35s", icon:"🔶", provider:"Google",    credits:20 },
  { id:"seedance2", name:"Seedance 2.0", badge:"PREMIUM", badgeColor:"#c084fc", desc:"Cinématique, photoréaliste.",   speed:"~60s", icon:"🌟", provider:"ByteDance", credits:30 },
];

const DURATIONS   = ["6s","8s","10s"];
const TRANSITIONS = ["Fondu","Glisser","Zoom","Rotation","Flash"];
const DAILY_CREDITS = 150;

const TTS_LANGUAGES = [
  { code:"fr", label:"Français",   flag:"🇫🇷" },
  { code:"en", label:"English",    flag:"🇬🇧" },
  { code:"es", label:"Español",    flag:"🇪🇸" },
  { code:"de", label:"Deutsch",    flag:"🇩🇪" },
  { code:"it", label:"Italiano",   flag:"🇮🇹" },
  { code:"pt", label:"Português",  flag:"🇧🇷" },
  { code:"ar", label:"العربية",    flag:"🇸🇦" },
  { code:"zh", label:"中文",        flag:"🇨🇳" },
  { code:"ja", label:"日本語",      flag:"🇯🇵" },
  { code:"ko", label:"한국어",      flag:"🇰🇷" },
  { code:"ru", label:"Русский",    flag:"🇷🇺" },
  { code:"hi", label:"हिन्दी",     flag:"🇮🇳" },
  { code:"nl", label:"Nederlands", flag:"🇳🇱" },
  { code:"pl", label:"Polski",     flag:"🇵🇱" },
  { code:"tr", label:"Türkçe",     flag:"🇹🇷" },
];

const TTS_VOICES = [
  {
    id:"all", label:"ALL", desc:"Voix universelle polyvalente", icon:"🌐",
    authors: {
      female: ["Sophia Bloom","Luna Voss","Nova Pierce"],
      male:   ["Atlas Reeves","Kai Mercer","Orion Drake"],
    }
  },
  {
    id:"narrative", label:"NARRATIVE", desc:"Storytelling posé et professionnel", icon:"📖",
    authors: {
      female: ["Eleanor Vance","Claire Morel","Selene Ashford"],
      male:   ["Victor Crane","James Holloway","Henri Dubois"],
    }
  },
  {
    id:"conversational", label:"CONVERSATIONAL", desc:"Naturelle, chaleureuse et décontractée", icon:"💬",
    authors: {
      female: ["Mia Torres","Zoe Hartley","Camille Renard"],
      male:   ["Ethan Brooks","Leo Fontaine","Marco Silva"],
    }
  },
  {
    id:"expressive", label:"EXPRESSIVE", desc:"Dynamique avec variations émotionnelles", icon:"🎭",
    authors: {
      female: ["Aria Storm","Vivienne Larue","Jade Phoenix"],
      male:   ["Rex Vidal","Dante Moreau","Flynn Castillo"],
    }
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function Particle({ style }) { return <div className="particle" style={style} />; }

function Avatar({ user, size=34 }) {
  const initials = user.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
  return user.photo
    ? <img src={user.photo} alt={user.name} style={{ width:size,height:size,borderRadius:"50%",border:"2px solid rgba(167,139,250,.5)",objectFit:"cover" }} />
    : <div style={{ width:size,height:size,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#0ea5e9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",border:"2px solid rgba(167,139,250,.5)" }}>{initials}</div>;
}

function ProgressBar({ pct, color="#7c3aed" }) {
  return (
    <div style={{ height:7,background:"rgba(255,255,255,.06)",borderRadius:6,overflow:"hidden",position:"relative" }}>
      <div style={{ height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${color},#0ea5e9)`,borderRadius:6,transition:"width .25s ease",position:"relative",overflow:"hidden" }}>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent)",animation:"shimmer 1.6s infinite"}}/>
      </div>
    </div>
  );
}

// Slow at start, fast at end
async function animateProgress(setter, totalMs) {
  setter(0);
  // Phase 1: slow crawl 0-30% (first 55% of time)
  const phase1Steps = 15;
  const phase1Delay = (totalMs * 0.55) / phase1Steps;
  for (let i = 1; i <= phase1Steps; i++) {
    await new Promise(r => setTimeout(r, phase1Delay));
    setter(Math.round((i / phase1Steps) * 30));
  }
  // Phase 2: normal 30-80% (35% of time)
  const phase2Steps = 20;
  const phase2Delay = (totalMs * 0.35) / phase2Steps;
  for (let i = 1; i <= phase2Steps; i++) {
    await new Promise(r => setTimeout(r, phase2Delay));
    setter(30 + Math.round((i / phase2Steps) * 50));
  }
  // Phase 3: fast sprint 80-100% (10% of time)
  const phase3Steps = 10;
  const phase3Delay = (totalMs * 0.10) / phase3Steps;
  for (let i = 1; i <= phase3Steps; i++) {
    await new Promise(r => setTimeout(r, phase3Delay));
    setter(80 + Math.round((i / phase3Steps) * 20));
  }
}

// fake download helper
function fakeDownload(filename, ext) {
  const a = document.createElement("a");
  a.href = "data:text/plain;charset=utf-8,GenClip%20Generated%20Asset";
  a.download = `${filename}.${ext}`;
  a.click();
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGO SVG
// ─────────────────────────────────────────────────────────────────────────────
function GenClipLogo({ size = 42 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6d28d9"/>
          <stop offset="50%" stopColor="#2563eb"/>
          <stop offset="100%" stopColor="#0891b2"/>
        </linearGradient>
        <linearGradient id="lg2" x1="0" y1="0" x2="48" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e879f9"/>
          <stop offset="100%" stopColor="#38bdf8"/>
        </linearGradient>
        <linearGradient id="lg3" x1="0" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
        </linearGradient>
        <filter id="glow2" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Background */}
      <rect width="48" height="48" rx="13" fill="url(#lg1)"/>
      {/* Gloss overlay */}
      <rect width="48" height="24" rx="13" fill="url(#lg3)"/>
      {/* Hexagon / gem shape */}
      <polygon points="24,8 34,14 34,26 24,32 14,26 14,14" fill="none" stroke="url(#lg2)" strokeWidth="1.8" opacity="0.9" filter="url(#glow2)"/>
      {/* Inner triangle — play/gen symbol */}
      <polygon points="20,16 20,26 29,21" fill="url(#lg2)" opacity="0.95" filter="url(#glow2)"/>
      {/* Sparkle dots */}
      <circle cx="38" cy="10" r="1.8" fill="#f0abfc" opacity="0.85"/>
      <circle cx="42" cy="15" r="1.2" fill="#67e8f9" opacity="0.7"/>
      <circle cx="40" cy="19" r="0.9" fill="#a78bfa" opacity="0.6"/>
      {/* Bottom wave bars */}
      <rect x="11" y="36" width="2.5" height="6" rx="1.2" fill="url(#lg2)" opacity="0.75"/>
      <rect x="15" y="34" width="2.5" height="8" rx="1.2" fill="url(#lg2)" opacity="0.85"/>
      <rect x="19" y="37" width="2.5" height="5" rx="1.2" fill="url(#lg2)" opacity="0.7"/>
      <rect x="23" y="35" width="2.5" height="7" rx="1.2" fill="url(#lg2)" opacity="0.9"/>
      <rect x="27" y="36.5" width="2.5" height="5.5" rx="1.2" fill="url(#lg2)" opacity="0.75"/>
      <rect x="31" y="34.5" width="2.5" height="7.5" rx="1.2" fill="url(#lg2)" opacity="0.8"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function GenClip() {
  // auth
  const [user, setUser]             = useState(null);
  const [showLogin, setShowLogin]   = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // tabs
  const [activeTab, setActiveTab] = useState("image");

  // image
  const [imagePrompt, setImagePrompt]             = useState("");
  const [selectedStyle, setSelectedStyle]         = useState("cinematic");
  const [selectedImageModel, setSelectedImageModel] = useState("banana2");
  const [selectedImageRatio, setSelectedImageRatio] = useState("16:9");
  const [imageCount, setImageCount]               = useState(1);
  const [generatingImage, setGeneratingImage]     = useState(false);
  const [imageProgress, setImageProgress]         = useState(0);
  const [generatedImages, setGeneratedImages]     = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // video
  const [videoPrompt, setVideoPrompt]               = useState("");
  const [selectedVideoModel, setSelectedVideoModel] = useState("veo31fast");
  const [selectedVideoRatio, setSelectedVideoRatio] = useState("16:9");
  const [selectedDuration, setSelectedDuration]     = useState("8s");
  const [selectedTransition, setSelectedTransition] = useState("Fondu");
  const [videoPhoto, setVideoPhoto]                 = useState(null);
  const [videoPhotoPreview, setVideoPhotoPreview]   = useState(null);
  const [generatingVideo, setGeneratingVideo]       = useState(false);
  const [videoProgress, setVideoProgress]           = useState(0);
  const [videoFrames, setVideoFrames]               = useState([]);
  const [videoReady, setVideoReady]                 = useState(false);
  const [videoTitle, setVideoTitle]                 = useState("");
  const [credits, setCredits]                       = useState(DAILY_CREDITS);

  // TTS
  const [ttsText, setTtsText]         = useState("");
  const [ttsLang, setTtsLang]         = useState("fr");
  const [ttsGender, setTtsGender]     = useState("female");
  const [ttsVoice, setTtsVoice]       = useState("all");
  const [ttsAuthor, setTtsAuthor]     = useState("");
  const [ttsGenerating, setTtsGenerating] = useState(false);
  const [ttsProgress, setTtsProgress] = useState(0);
  const [ttsResult, setTtsResult]     = useState(null);

  // misc
  const [particles, setParticles] = useState([]);
  const intervalRef  = useRef(null);
  const fileInputRef = useRef(null);

  // derived TTS authors
  const activeTtsVoiceObj = TTS_VOICES.find(v => v.id === ttsVoice);
  const currentAuthors = activeTtsVoiceObj ? activeTtsVoiceObj.authors[ttsGender] : [];

  // auto-select first author when voice/gender changes
  useEffect(() => {
    if (currentAuthors.length > 0) setTtsAuthor(currentAuthors[0]);
  }, [ttsVoice, ttsGender]);

  // particles init
  useEffect(() => {
    setParticles(Array.from({length:22}, () => ({
      left:`${Math.random()*100}%`, top:`${Math.random()*100}%`,
      width:`${2+Math.random()*4}px`, height:`${2+Math.random()*4}px`,
      animationDelay:`${Math.random()*5}s`, animationDuration:`${4+Math.random()*5}s`,
      opacity:.1+Math.random()*.3,
    })));
  }, []);

  // slideshow
  useEffect(() => {
    clearInterval(intervalRef.current);
    if (generatedImages.length > 1) {
      intervalRef.current = setInterval(() => setCurrentImageIndex(p => (p+1)%generatedImages.length), 2200);
    }
    return () => clearInterval(intervalRef.current);
  }, [generatedImages]);

  // close menu
  useEffect(() => {
    const h = () => setShowUserMenu(false);
    if (showUserMenu) window.addEventListener("click", h);
    return () => window.removeEventListener("click", h);
  }, [showUserMenu]);

  // ─── AUTH ───
  function handleGoogleLogin() {
    setLoginLoading(true);
    setTimeout(() => {
      setUser({ name:"Jean-Baptiste Koffi", email:"jb.koffi@gmail.com", photo:null });
      setLoginLoading(false); setShowLogin(false);
    }, 1600);
  }
  function handleLogout() {
    setUser(null); setShowUserMenu(false);
    setGeneratedImages([]); setVideoFrames([]); setVideoReady(false); setTtsResult(null);
  }

  // ─── CLAUDE API ───
  async function callClaude(prompt, type, extra={}) {
    const sysImage = `Tu es GenClip AI. Réponds UNIQUEMENT avec JSON valide, sans markdown. Format:
{"descriptions":["desc1","desc2"],"mood":"string","palette":["#hex1","#hex2","#hex3"],"title":"string"}`;
    const sysVideo = `Tu es GenClip AI. Réponds UNIQUEMENT avec JSON valide, sans markdown. Format:
{"frames":["desc1","desc2","desc3","desc4","desc5"],"mood":"string","palette":["#hex1","#hex2","#hex3"],"title":"string","synopsis":"string"}`;
    const sysTTS = `Tu es GenClip TTS. Analyse le texte et génère JSON uniquement, sans markdown. Format:
{"phonetics":"string","emotion":"string","pace":"slow|normal|fast","preview":"string (50 chars max)","duration_estimate":"string","voice_notes":"string"}`;

    const userMsg = type==="image"
      ? `Prompt:"${prompt}"\nStyle:${extra.style}\nModèle:${extra.model}\nRatio:${extra.ratio}\nNombre:${extra.count}`
      : type==="video"
      ? `Prompt:"${prompt}"\nModèle:${extra.model}\nDurée:${extra.duration}\nRatio:${extra.ratio}\nTransition:${extra.transition}${extra.hasPhoto?"\n[Photo source]":""}`
      : `Texte:"${prompt}"\nLangue:${extra.lang}\nGenre:${extra.gender}\nVoix:${extra.voice}\nAuteur:${extra.author}`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        model:"claude-sonnet-4-20250514", max_tokens:1000,
        system: type==="image"?sysImage:type==="video"?sysVideo:sysTTS,
        messages:[{role:"user",content:userMsg}],
      }),
    });
    const data = await res.json();
    const text = data.content.map(b=>b.text||"").join("");
    const clean = text.replace(/```json|```/g,"").trim();
    return JSON.parse(clean);
  }

  // ─── GENERATE IMAGE ───
  async function handleGenerateImage() {
    if (!imagePrompt.trim()) return;
    if (!user) { setShowLogin(true); return; }
    setGeneratingImage(true); setImageProgress(0); setGeneratedImages([]);

    const modelMs = selectedImageModel==="banana2"?9000
      : selectedImageModel==="nanobanpro"?14000
      : 11000; // gemini

    try {
      const [result] = await Promise.all([
        callClaude(imagePrompt,"image",{ style:selectedStyle, model:selectedImageModel, ratio:selectedImageRatio, count:imageCount }),
        animateProgress(setImageProgress, modelMs),
      ]);
      setGeneratedImages(
        result.descriptions.slice(0,imageCount).map((desc,i) => ({
          id:i, description:desc, mood:result.mood,
          palette:result.palette||["#7c3aed","#0ea5e9","#f472b6"], title:result.title,
        }))
      );
      setCurrentImageIndex(0);
    } catch(e) {
      console.error(e);
    }
    setGeneratingImage(false);
  }

  // ─── GENERATE VIDEO ───
  async function handleGenerateVideo() {
    if (!videoPrompt.trim()) return;
    if (!user) { setShowLogin(true); return; }
    const model = VIDEO_MODELS.find(m=>m.id===selectedVideoModel);
    if (credits < model.credits) return;

    setGeneratingVideo(true); setVideoProgress(0); setVideoReady(false);
    setVideoFrames([]); setVideoTitle("");

    const modelMs = selectedVideoModel==="veo31lite"?16000
      : selectedVideoModel==="veo31fast"?24000
      : 36000;

    try {
      const [result] = await Promise.all([
        callClaude(videoPrompt,"video",{ model:selectedVideoModel, duration:selectedDuration, ratio:selectedVideoRatio, transition:selectedTransition, hasPhoto:!!videoPhoto }),
        animateProgress(setVideoProgress, modelMs),
      ]);
      setVideoTitle(result.title||"");
      setVideoFrames(result.frames.map((desc,i) => ({ id:i, description:desc, palette:result.palette||["#7c3aed","#0ea5e9","#f472b6"] })));
      setCredits(c => c - model.credits);
      setVideoReady(true);
    } catch(e) {
      console.error(e);
    }
    setGeneratingVideo(false);
  }

  // ─── GENERATE TTS ───
  async function handleGenerateTTS() {
    if (!ttsText.trim()) return;
    if (!user) { setShowLogin(true); return; }
    setTtsGenerating(true); setTtsProgress(0); setTtsResult(null);

    try {
      const [result] = await Promise.all([
        callClaude(ttsText,"tts",{ lang:ttsLang, gender:ttsGender, voice:ttsVoice, author:ttsAuthor }),
        animateProgress(setTtsProgress, 3500),
      ]);
      setTtsResult(result);
    } catch(e) {
      console.error(e);
    }
    setTtsGenerating(false);
  }

  // ─── PHOTO UPLOAD ───
  function handlePhotoUpload(e) {
    const file = e.target.files[0]; if (!file) return;
    setVideoPhoto(file);
    const reader = new FileReader();
    reader.onload = ev => setVideoPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  }
  function removePhoto() { setVideoPhoto(null); setVideoPhotoPreview(null); if(fileInputRef.current)fileInputRef.current.value=""; }

  // ─── DERIVED ───
  const currentImage   = generatedImages[currentImageIndex];
  const activeImgModel = IMAGE_MODELS.find(m=>m.id===selectedImageModel);
  const activeVidModel = VIDEO_MODELS.find(m=>m.id===selectedVideoModel);
  const creditsLeft    = credits;
  const creditsPct     = (credits/DAILY_CREDITS)*100;

  function ratioPad(ratioId, list=IMAGE_RATIOS) {
    const r = list.find(x=>x.id===ratioId);
    if (!r) return "56.25%";
    return `${(r.h/r.w)*100}%`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
<style>{`
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Outfit:wght@400;600;700;800;900&family=JetBrains+Mono:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:#03020c;color:#ede8ff;font-family:'Space Grotesk',sans-serif;}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(124,58,237,.4);border-radius:3px}

@keyframes revealResult{0%{opacity:0;transform:translateY(30px) scale(.97)}60%{transform:translateY(-4px) scale(1.01)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes shimmer{to{transform:translateX(200%)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes fadeSlideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes scaleIn{from{transform:scale(.93);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes floatP{0%{transform:translateY(0) scale(1);opacity:0}20%{opacity:1}80%{opacity:.5}100%{transform:translateY(-90px) scale(.4);opacity:0}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes gradShift{0%{filter:hue-rotate(0deg) brightness(.9)}100%{filter:hue-rotate(40deg) brightness(1.15)}}
@keyframes wavePulse{0%{height:4px;opacity:.35}100%{height:100%;opacity:1}}
@keyframes logoGlow{0%,100%{filter:drop-shadow(0 0 8px rgba(124,58,237,.5))}50%{filter:drop-shadow(0 0 20px rgba(56,189,248,.7))}}
@keyframes borderAnim{0%,100%{border-color:rgba(124,58,237,.4)}50%{border-color:rgba(56,189,248,.6)}}
@keyframes countUp{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}

.app{min-height:100vh;background:radial-gradient(ellipse at 15% 0%,#1a0636 0%,transparent 50%),radial-gradient(ellipse at 85% 100%,#001a2e 0%,transparent 50%),#03020c;position:relative;overflow-x:hidden;}

/* Background effects */
.grid-bg{position:fixed;inset:0;z-index:0;background-image:linear-gradient(rgba(120,80,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(120,80,255,.035) 1px,transparent 1px);background-size:52px 52px;pointer-events:none;}
.glow-orb{position:fixed;border-radius:50%;filter:blur(90px);pointer-events:none;z-index:0;}
.orb1{width:600px;height:600px;background:rgba(100,40,255,.1);top:-200px;left:-150px;}
.orb2{width:450px;height:450px;background:rgba(0,180,230,.07);bottom:-100px;right:-120px;}
.orb3{width:320px;height:320px;background:rgba(240,60,140,.06);top:45%;left:55%;}
.orb4{width:200px;height:200px;background:rgba(74,222,128,.05);top:20%;right:10%;}
.particle{position:fixed;border-radius:50%;background:rgba(167,139,250,.6);animation:floatP linear infinite;pointer-events:none;z-index:0;}

.container{position:relative;z-index:1;max-width:960px;margin:0 auto;padding:0 22px 100px;}

/* HEADER */
header{display:flex;align-items:center;justify-content:space-between;padding:26px 0 44px;}
.logo{display:flex;align-items:center;gap:13px;cursor:default;}
.logo-svg{animation:logoGlow 3s ease infinite;}
.logo-text{display:flex;flex-direction:column;}
.logo-name{font-family:'Outfit',sans-serif;font-size:28px;font-weight:900;background:linear-gradient(90deg,#c4b5fd 0%,#67e8f9 55%,#f0abfc 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-1px;line-height:1;}
.logo-tag{font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(167,139,250,.45);letter-spacing:3px;text-transform:uppercase;margin-top:2px;}
.header-right{display:flex;align-items:center;gap:10px;}

/* Buttons */
.google-btn{display:flex;align-items:center;gap:9px;padding:9px 20px;border-radius:11px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#ede8ff;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;}
.google-btn:hover{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.2);}
.google-icon{width:17px;height:17px;flex-shrink:0;}

/* User pill */
.user-pill{position:relative;display:flex;align-items:center;gap:9px;padding:5px 14px 5px 5px;border-radius:40px;border:1px solid rgba(167,139,250,.2);background:rgba(167,139,250,.05);cursor:pointer;transition:all .2s;}
.user-pill:hover{background:rgba(167,139,250,.1);}
.user-pill-name{font-size:13px;font-weight:600;color:#c4b5fd;}
.user-menu{position:absolute;top:calc(100% + 9px);right:0;background:#0f0c20;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:8px;min-width:215px;z-index:100;box-shadow:0 24px 64px rgba(0,0,0,.7);animation:fadeSlideUp .15s ease;}
.user-menu-email{font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(160,140,255,.45);padding:6px 12px 10px;letter-spacing:.5px;}
.user-menu-item{width:100%;padding:9px 12px;border-radius:9px;border:none;background:transparent;color:rgba(200,190,255,.7);font-family:'Space Grotesk',sans-serif;font-size:13px;cursor:pointer;text-align:left;transition:background .15s;display:block;}
.user-menu-item:hover{background:rgba(255,255,255,.05);color:#ede8ff;}
.user-menu-divider{height:1px;background:rgba(255,255,255,.06);margin:4px 0;}
.logout-item{color:rgba(248,113,113,.7)!important;}
.logout-item:hover{background:rgba(248,113,113,.08)!important;color:#fca5a5!important;}

/* MODAL */
.modal-overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.8);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;animation:fadeIn .2s ease;}
.modal{background:linear-gradient(135deg,#0f0c20,#080514);border:1px solid rgba(255,255,255,.1);border-radius:22px;padding:44px 36px;max-width:380px;width:90%;text-align:center;position:relative;box-shadow:0 40px 100px rgba(0,0,0,.9);animation:scaleIn .2s ease;}
.modal-close{position:absolute;top:14px;right:16px;background:none;border:none;color:rgba(200,190,255,.4);font-size:20px;cursor:pointer;padding:4px 8px;border-radius:6px;transition:all .15s;}
.modal-close:hover{color:#ede8ff;background:rgba(255,255,255,.06);}
.modal-logo-wrap{margin:0 auto 22px;animation:logoGlow 3s ease infinite;}
.modal-title{font-family:'Outfit',sans-serif;font-size:24px;font-weight:800;margin-bottom:8px;color:#ede8ff;letter-spacing:-0.5px;}
.modal-sub{font-size:13px;color:rgba(160,140,255,.55);margin-bottom:30px;line-height:1.7;}
.modal-google-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:12px;padding:15px 20px;border-radius:13px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#ede8ff;font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;margin-bottom:12px;}
.modal-google-btn:hover:not(:disabled){background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.22);transform:translateY(-1px);}
.modal-google-btn:disabled{opacity:.6;cursor:not-allowed;}
.modal-footer{font-size:11px;font-family:'JetBrains Mono',monospace;color:rgba(160,140,255,.3);margin-top:20px;letter-spacing:.8px;}

/* HERO */
.hero{text-align:center;margin-bottom:48px;}
.hero-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:3px;color:#67e8f9;text-transform:uppercase;margin-bottom:16px;display:inline-flex;align-items:center;gap:8px;}
.hero-eyebrow::before,.hero-eyebrow::after{content:'';display:inline-block;width:24px;height:1px;background:linear-gradient(90deg,transparent,#67e8f9);}
.hero-eyebrow::after{background:linear-gradient(90deg,#67e8f9,transparent);}
.hero-title{font-family:'Outfit',sans-serif;font-size:clamp(34px,6vw,62px);font-weight:900;line-height:1.04;letter-spacing:-2.5px;margin-bottom:18px;}
.hero-title span{background:linear-gradient(135deg,#a78bfa 0%,#38bdf8 45%,#f472b6 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.hero-sub{font-size:16px;color:rgba(200,190,255,.45);max-width:500px;margin:0 auto;line-height:1.75;}
.hero-badges{display:flex;justify-content:center;gap:10px;margin-top:22px;flex-wrap:wrap;}
.hero-badge{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.5px;padding:5px 12px;border-radius:20px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:rgba(200,190,255,.5);}

/* TABS */
.tabs{display:flex;gap:4px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:5px;margin:0 auto 30px;width:fit-content;}
.tab-btn{padding:10px 24px;border-radius:12px;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;border:none;cursor:pointer;transition:all .25s;display:flex;align-items:center;gap:7px;background:transparent;color:rgba(200,190,255,.4);}
.tab-btn.active{background:linear-gradient(135deg,rgba(124,58,237,.65),rgba(14,165,233,.45));color:#fff;box-shadow:0 4px 22px rgba(124,58,237,.35);}
.tab-btn:hover:not(.active){color:rgba(200,190,255,.75);background:rgba(255,255,255,.04);}

/* PANEL */
.panel{background:rgba(255,255,255,.022);border:1px solid rgba(255,255,255,.07);border-radius:22px;padding:30px;backdrop-filter:blur(16px);}
.field-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;color:rgba(160,140,255,.55);text-transform:uppercase;margin-bottom:9px;display:block;}
textarea,input[type="text"]{width:100%;background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.08);border-radius:13px;color:#ede8ff;font-family:'Space Grotesk',sans-serif;font-size:14px;padding:13px 16px;outline:none;resize:none;transition:border-color .2s,box-shadow .2s;line-height:1.6;}
textarea:focus,input[type="text"]:focus{border-color:rgba(124,58,237,.55);box-shadow:0 0 0 3px rgba(124,58,237,.12);}
textarea::placeholder,input::placeholder{color:rgba(160,140,255,.28);}

/* SECTION TITLE */
.section-title{font-size:12px;font-weight:700;color:rgba(200,190,255,.75);margin-bottom:13px;display:flex;align-items:center;gap:9px;}
.section-title span{font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(103,232,249,.5);letter-spacing:2px;}

/* MODEL CARDS */
.model-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-top:9px;}
.model-card{border-radius:13px;border:1px solid rgba(255,255,255,.07);background:rgba(0,0,0,.28);padding:14px 12px;cursor:pointer;transition:all .2s;position:relative;overflow:hidden;}
.model-card.selected{border-color:rgba(124,58,237,.6);background:rgba(124,58,237,.1);box-shadow:0 0 20px rgba(124,58,237,.22);}
.model-card:hover:not(.selected){border-color:rgba(255,255,255,.13);background:rgba(255,255,255,.03);}
.model-card.selected::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#7c3aed,#0ea5e9);}
.model-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:7px;}
.model-icon{font-size:20px;}
.model-badge{font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:1px;padding:3px 7px;border-radius:5px;font-weight:500;}
.model-name{font-size:12px;font-weight:700;color:#ede8ff;margin-bottom:3px;}
.model-desc{font-size:10px;color:rgba(160,140,255,.5);line-height:1.4;margin-bottom:5px;}
.model-speed{font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(103,232,249,.55);letter-spacing:1px;}
.model-provider{font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(160,140,255,.3);letter-spacing:.5px;margin-top:2px;}
.model-credits{font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(251,191,36,.65);letter-spacing:.5px;margin-top:3px;}

/* IMAGE MODEL GRID: 3 cols */
.model-grid-img{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:9px;}

/* RATIO SELECTOR */
.ratio-row{display:flex;flex-wrap:wrap;gap:7px;margin-top:9px;}
.ratio-chip{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:9px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.22);color:rgba(200,190,255,.5);font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:500;cursor:pointer;transition:all .2s;min-width:58px;}
.ratio-chip.selected{border-color:rgba(124,58,237,.6);background:rgba(124,58,237,.14);color:#c4b5fd;box-shadow:0 0 12px rgba(124,58,237,.2);}
.ratio-chip:hover:not(.selected){border-color:rgba(255,255,255,.14);color:rgba(200,190,255,.85);}
.ratio-chip-icon{font-size:16px;}
.ratio-chip-desc{font-size:9px;color:rgba(160,140,255,.45);margin-top:1px;}

/* STYLE GRID */
.style-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:9px;}
.style-chip{padding:9px 6px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.22);color:rgba(200,190,255,.55);font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:600;cursor:pointer;text-align:center;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:5px;}
.style-chip.selected{border-color:rgba(124,58,237,.6);background:rgba(124,58,237,.15);color:#c4b5fd;box-shadow:0 0 12px rgba(124,58,237,.2);}
.style-chip:hover:not(.selected){border-color:rgba(255,255,255,.14);color:rgba(200,190,255,.85);}

/* COUNT ROW */
.count-row{display:flex;align-items:center;gap:13px;margin-top:9px;}
.count-btn{width:34px;height:34px;border-radius:9px;border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.32);color:#ede8ff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;}
.count-btn:hover{border-color:rgba(124,58,237,.5);color:#a78bfa;}
.count-val{font-family:'Outfit',sans-serif;font-size:22px;font-weight:800;color:#c4b5fd;min-width:28px;text-align:center;animation:countUp .2s ease;}

/* OPTIONS ROW */
.options-row{display:flex;flex-wrap:wrap;gap:14px;margin:18px 0;}
.option-group{flex:1;min-width:140px;}
select{width:100%;background:rgba(0,0,0,.38);border:1px solid rgba(255,255,255,.08);border-radius:11px;color:#ede8ff;font-family:'Space Grotesk',sans-serif;font-size:13px;padding:11px 13px;outline:none;cursor:pointer;margin-top:9px;}

/* PHOTO UPLOAD */
.photo-upload-zone{position:relative;border:1.5px dashed rgba(255,255,255,.1);border-radius:13px;padding:18px;text-align:center;cursor:pointer;transition:all .2s;margin-top:9px;background:rgba(0,0,0,.18);}
.photo-upload-zone:hover{border-color:rgba(124,58,237,.45);background:rgba(124,58,237,.05);}
.photo-upload-zone input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;}
.puz-icon{font-size:26px;margin-bottom:7px;}
.puz-text{font-size:11px;color:rgba(160,140,255,.55);line-height:1.7;}
.puz-text strong{color:rgba(167,139,250,.85);}
.photo-preview-wrap{position:relative;margin-top:9px;border-radius:13px;overflow:hidden;border:1px solid rgba(255,255,255,.08);}
.photo-preview-img{width:100%;max-height:160px;object-fit:cover;display:block;}
.photo-remove-btn{position:absolute;top:8px;right:8px;width:28px;height:28px;border-radius:7px;background:rgba(0,0,0,.72);border:1px solid rgba(255,255,255,.15);color:#fff;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;}
.photo-remove-btn:hover{background:rgba(248,113,113,.35);}

/* CREDITS */
.credits-bar{display:flex;align-items:center;gap:13px;padding:13px 17px;border-radius:13px;background:rgba(251,191,36,.04);border:1px solid rgba(251,191,36,.14);margin-bottom:20px;}
.credits-icon{font-size:20px;}
.credits-info{flex:1;}
.credits-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:7px;}
.credits-label{font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(251,191,36,.65);letter-spacing:1.5px;}
.credits-value{font-family:'JetBrains Mono',monospace;font-size:13px;color:#fbbf24;font-weight:500;}
.credits-low{color:#f87171!important;}

/* GEN BUTTON */
.gen-btn{width:100%;padding:15px;border:none;border-radius:13px;font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#7c3aed,#0ea5e9);color:#fff;margin-top:7px;position:relative;overflow:hidden;transition:transform .15s,box-shadow .15s,opacity .15s;box-shadow:0 6px 30px rgba(124,58,237,.38);letter-spacing:.4px;display:flex;align-items:center;justify-content:center;gap:10px;}
.gen-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 42px rgba(124,58,237,.52);}
.gen-btn:active:not(:disabled){transform:translateY(0);}
.gen-btn:disabled{opacity:.48;cursor:not-allowed;}
.gen-btn::after{content:'';position:absolute;top:0;left:-200%;width:200%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent);animation:shimmer 2.2s infinite;}
.login-hint{font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(248,196,113,.55);text-align:center;margin-top:8px;letter-spacing:.5px;}

/* PROGRESS SECTION */
.progress-section{margin-top:20px;padding:18px;border-radius:14px;background:rgba(0,0,0,.32);border:1px solid rgba(255,255,255,.07);animation:borderAnim 2s ease infinite;}
.progress-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px;}
.progress-label{font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(103,232,249,.7);letter-spacing:2px;}
.progress-pct{font-family:'JetBrains Mono',monospace;font-size:15px;color:#67e8f9;font-weight:600;animation:pulse 1s ease infinite;}
.progress-sub{font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(160,140,255,.38);letter-spacing:1px;margin-top:8px;}
.progress-stage{font-size:11px;color:rgba(167,139,250,.6);margin-top:5px;font-style:italic;}

/* RESULTS */
.result-section{margin-top:30px;animation:revealResult .6s cubic-bezier(.22,1,.36,1) forwards;}
.result-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;color:rgba(103,232,249,.55);text-transform:uppercase;margin-bottom:14px;}

/* IMAGE CARD */
.image-card{border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,.08);animation:fadeSlideUp .5s ease forwards;box-shadow:0 20px 60px rgba(0,0,0,.5);}
.image-canvas{width:100%;position:relative;overflow:hidden;}
.image-canvas-inner{position:relative;width:100%;}
.img-bg{position:absolute;inset:0;}
.img-gradient-1{position:absolute;inset:0;animation:gradShift 8s ease infinite alternate;}
.img-noise{position:absolute;inset:0;opacity:.04;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:cover;}
.img-scanlines{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.025) 2px,rgba(0,0,0,.025) 4px);pointer-events:none;}
.img-center-content{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:28px;z-index:2;}
.img-icon{font-size:50px;margin-bottom:14px;filter:drop-shadow(0 0 24px rgba(255,255,255,.35));}
.img-model-badge{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;padding:3px 11px;border-radius:5px;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.55);margin-bottom:9px;display:inline-block;}
.img-ratio-badge{font-family:'JetBrains Mono',monospace;font-size:9px;padding:3px 9px;border-radius:5px;background:rgba(0,0,0,.45);border:1px solid rgba(103,232,249,.22);color:rgba(103,232,249,.6);margin-left:5px;}
.img-title{font-family:'Outfit',sans-serif;font-size:21px;font-weight:800;color:#fff;margin-bottom:7px;text-shadow:0 3px 24px rgba(0,0,0,.7);letter-spacing:-.5px;}
.img-mood{font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(255,255,255,.38);letter-spacing:2px;text-transform:uppercase;}
.img-desc-box{padding:16px 20px;background:rgba(0,0,0,.42);border-top:1px solid rgba(255,255,255,.06);}
.img-desc-num{font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(167,139,250,.45);margin-bottom:5px;letter-spacing:1px;}
.img-desc-text{font-size:13px;color:rgba(200,190,255,.65);line-height:1.75;}
.img-dots{display:flex;gap:6px;justify-content:center;margin-top:11px;}
.img-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.14);transition:all .2s;cursor:pointer;}
.img-dot.active{background:#a78bfa;transform:scale(1.4);}
.palette-row{display:flex;gap:5px;margin-top:12px;align-items:center;}
.palette-swatch{width:18px;height:18px;border-radius:5px;border:1px solid rgba(255,255,255,.1);}
.palette-label{font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(160,140,255,.38);letter-spacing:1px;}

/* DOWNLOAD BUTTON */
.download-btn{display:inline-flex;align-items:center;gap:8px;margin-top:14px;padding:10px 22px;border-radius:11px;background:rgba(103,232,249,.08);border:1px solid rgba(103,232,249,.28);color:#67e8f9;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;}
.download-btn:hover{background:rgba(103,232,249,.16);box-shadow:0 0 20px rgba(103,232,249,.18);transform:translateY(-1px);}
.download-btn-img{display:inline-flex;align-items:center;gap:8px;padding:9px 18px;border-radius:10px;background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.25);color:#a78bfa;font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;margin-top:10px;}
.download-btn-img:hover{background:rgba(167,139,250,.16);transform:translateY(-1px);}

/* FRAMES */
.frames-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-top:14px;}
.frame-card{border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,.08);position:relative;animation:fadeSlideUp .4s ease forwards;}
.frame-canvas{position:relative;width:100%;}
.frame-canvas-inner{position:relative;width:100%;}
.frame-bg{position:absolute;inset:0;}
.frame-overlay{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:space-between;padding:7px;}
.frame-num{font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(255,255,255,.5);background:rgba(0,0,0,.42);border-radius:3px;padding:2px 5px;width:fit-content;}
.frame-desc{font-size:9px;color:rgba(255,255,255,.75);line-height:1.4;text-shadow:0 1px 5px rgba(0,0,0,.9);background:linear-gradient(transparent,rgba(0,0,0,.65));margin:-7px;padding:7px;}

/* VIDEO READY */
.video-ready-card{border-radius:18px;overflow:hidden;border:1px solid rgba(103,232,249,.2);background:rgba(0,0,0,.4);padding:26px;text-align:center;margin-top:20px;animation:fadeSlideUp .5s ease forwards;}
.video-ready-icon{font-size:44px;margin-bottom:11px;}
.video-ready-title{font-family:'Outfit',sans-serif;font-size:18px;font-weight:800;color:#67e8f9;margin-bottom:5px;letter-spacing:-.3px;}
.video-ready-sub{font-size:12px;color:rgba(160,140,255,.5);line-height:1.7;}

/* TTS LANG */
.tts-lang-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-top:9px;}
.tts-lang-chip{padding:8px 5px;border-radius:9px;border:1px solid rgba(255,255,255,.07);background:rgba(0,0,0,.22);cursor:pointer;text-align:center;transition:all .2s;}
.tts-lang-chip.selected{border-color:rgba(124,58,237,.55);background:rgba(124,58,237,.12);box-shadow:0 0 10px rgba(124,58,237,.18);}
.tts-lang-chip:hover:not(.selected){border-color:rgba(255,255,255,.12);}
.tts-lang-flag{font-size:18px;display:block;margin-bottom:3px;}
.tts-lang-name{font-size:9px;font-family:'JetBrains Mono',monospace;color:rgba(200,190,255,.55);letter-spacing:.5px;}
.tts-lang-chip.selected .tts-lang-name{color:#c4b5fd;}

/* TTS GENDER */
.tts-gender-row{display:flex;gap:10px;margin-top:9px;}
.tts-gender-btn{flex:1;padding:11px;border-radius:11px;border:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.22);color:rgba(200,190,255,.55);font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px;}
.tts-gender-btn.selected{border-color:rgba(124,58,237,.55);background:rgba(124,58,237,.12);color:#c4b5fd;}
.tts-gender-btn:hover:not(.selected){border-color:rgba(255,255,255,.13);}

/* TTS VOICE GRID */
.tts-voice-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;margin-top:9px;}
.tts-voice-card{padding:14px 13px;border-radius:12px;border:1px solid rgba(255,255,255,.07);background:rgba(0,0,0,.22);cursor:pointer;transition:all .2s;}
.tts-voice-card.selected{border-color:rgba(124,58,237,.55);background:rgba(124,58,237,.1);box-shadow:0 0 14px rgba(124,58,237,.2);}
.tts-voice-card:hover:not(.selected){border-color:rgba(255,255,255,.12);}
.tts-voice-top{display:flex;align-items:center;gap:8px;margin-bottom:5px;}
.tts-voice-icon{font-size:18px;}
.tts-voice-name{font-size:12px;font-weight:700;color:#ede8ff;font-family:'JetBrains Mono',monospace;letter-spacing:1px;}
.tts-voice-desc{font-size:11px;color:rgba(160,140,255,.5);line-height:1.4;margin-bottom:8px;}

/* AUTHORS */
.authors-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;}
.author-chip{padding:5px 12px;border-radius:20px;border:1px solid rgba(255,255,255,.07);background:rgba(0,0,0,.22);font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(200,190,255,.5);cursor:pointer;transition:all .2s;letter-spacing:.3px;}
.author-chip.selected{border-color:rgba(124,58,237,.55);background:rgba(124,58,237,.12);color:#c4b5fd;}
.author-chip:hover:not(.selected){border-color:rgba(255,255,255,.12);color:rgba(200,190,255,.8);}

/* TTS RESULT */
.tts-result-card{border-radius:15px;background:rgba(0,0,0,.32);border:1px solid rgba(167,139,250,.2);padding:22px;margin-top:20px;animation:fadeSlideUp .4s ease forwards;}
.tts-result-title{font-size:14px;font-weight:700;color:#c4b5fd;margin-bottom:13px;display:flex;align-items:center;justify-content:space-between;}
.tts-result-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px;}
.tts-result-meta{font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(160,140,255,.45);letter-spacing:1px;}
.tts-result-val{font-family:'JetBrains Mono',monospace;font-size:11px;color:#a78bfa;}
.tts-audio-bar{height:52px;background:rgba(0,0,0,.42);border-radius:11px;border:1px solid rgba(255,255,255,.07);display:flex;align-items:center;padding:0 15px;gap:13px;margin-top:13px;}
.tts-play-btn{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#0ea5e9);border:none;color:#fff;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 0 14px rgba(124,58,237,.45);}
.tts-wave{flex:1;height:32px;position:relative;overflow:hidden;}
.tts-wave-bar{position:absolute;bottom:50%;width:3px;border-radius:2px;background:linear-gradient(to top,#7c3aed,#67e8f9);transform:translateY(50%);animation:wavePulse ease infinite alternate;}
.tts-dl-btn{display:flex;align-items:center;gap:7px;padding:9px 18px;border-radius:9px;background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.25);color:#a78bfa;font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;margin-top:11px;}
.tts-dl-btn:hover{background:rgba(167,139,250,.18);transform:translateY(-1px);}

/* MISC */
.spinner{display:inline-block;width:15px;height:15px;border:2px solid rgba(255,255,255,.22);border-top-color:#fff;border-radius:50%;animation:spin .65s linear infinite;}
.divider{height:1px;background:rgba(255,255,255,.05);margin:22px 0;}

/* COST WARNING */
.cost-warning{padding:10px 15px;border-radius:10px;background:rgba(251,191,36,.05);border:1px solid rgba(251,191,36,.14);font-size:12px;color:rgba(251,191,36,.75);font-family:'JetBrains Mono',monospace;margin-bottom:9px;letter-spacing:.3px;}

@media(max-width:680px){
  .model-grid-img{grid-template-columns:1fr 1fr}
  .model-grid{grid-template-columns:1fr 1fr}
  .style-grid{grid-template-columns:repeat(2,1fr)}
  .frames-grid{grid-template-columns:repeat(3,1fr)}
  .options-row{flex-direction:column}
  header{flex-direction:column;gap:14px}
  .tabs{flex-direction:column;width:100%}
  .tts-lang-grid{grid-template-columns:repeat(3,1fr)}
  .tts-voice-grid{grid-template-columns:1fr}
}
`}</style>

      {/* ── LOGIN MODAL ── */}
      {showLogin && (
        <div className="modal-overlay" onClick={()=>setShowLogin(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <button className="modal-close" onClick={()=>setShowLogin(false)}>✕</button>
            <div className="modal-logo-wrap" style={{display:"flex",justifyContent:"center"}}>
              <GenClipLogo size={56}/>
            </div>
            <div className="modal-title">Bienvenue sur GenClip</div>
            <div className="modal-sub">Connecte-toi pour générer des images, vidéos et synthèse vocale avec l'IA.</div>
            <button className="modal-google-btn" onClick={handleGoogleLogin} disabled={loginLoading}>
              {loginLoading
                ? <><div className="spinner"/> Connexion…</>
                : <><svg className="google-icon" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> Continuer avec Google</>
              }
            </button>
            <div className="modal-footer">✦ CONNEXION SÉCURISÉE · DONNÉES PROTÉGÉES</div>
          </div>
        </div>
      )}

      <div className="app">
        <div className="grid-bg"/>
        <div className="glow-orb orb1"/><div className="glow-orb orb2"/><div className="glow-orb orb3"/><div className="glow-orb orb4"/>
        {particles.map((p,i)=><Particle key={i} style={p}/>)}

        <div className="container">

          {/* ── HEADER ── */}
          <header>
            <div className="logo">
              <div className="logo-svg"><GenClipLogo size={44}/></div>
              <div className="logo-text">
                <div className="logo-name">GenClip</div>
                <div className="logo-tag">AI Multimedia Studio</div>
              </div>
            </div>
            <div className="header-right">
              {user ? (
                <div style={{position:"relative"}}>
                  <div className="user-pill" onClick={e=>{e.stopPropagation();setShowUserMenu(v=>!v);}}>
                    <Avatar user={user}/>
                    <span className="user-pill-name">{user.name.split(" ")[0]}</span>
                    <span style={{fontSize:10,color:"rgba(167,139,250,.45)",marginLeft:2}}>▾</span>
                  </div>
                  {showUserMenu && (
                    <div className="user-menu" onClick={e=>e.stopPropagation()}>
                      <div className="user-menu-email">{user.email}</div>
                      <div className="user-menu-divider"/>
                      <button className="user-menu-item">⚙ Paramètres</button>
                      <button className="user-menu-item">🖼 Mes créations</button>
                      <div className="user-menu-divider"/>
                      <button className="user-menu-item logout-item" onClick={handleLogout}>↩ Se déconnecter</button>
                    </div>
                  )}
                </div>
              ) : (
                <button className="google-btn" onClick={()=>setShowLogin(true)}>
                  <svg className="google-icon" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Se connecter
                </button>
              )}
            </div>
          </header>

          {/* ── HERO ── */}
          <div className="hero">
            <div className="hero-eyebrow">Studio Multimédia IA</div>
            <h1 className="hero-title">Crée. Génère.<br/><span>Imagine tout.</span></h1>
            <p className="hero-sub">Images, vidéos et voix IA — du prompt au chef-d'œuvre en quelques secondes.</p>
            <div className="hero-badges">
              <span className="hero-badge">✦ GEMINI 3.5 FLASH</span>
              <span className="hero-badge">⚡ NANO BANANA PRO</span>
              <span className="hero-badge">🎙 TTS MULTI-VOIX</span>
              <span className="hero-badge">🎬 VEO 3.1</span>
            </div>
          </div>

          {/* ── TABS ── */}
          <div className="tabs">
            <button className={`tab-btn ${activeTab==="image"?"active":""}`} onClick={()=>setActiveTab("image")}>🖼️ Image</button>
            <button className={`tab-btn ${activeTab==="video"?"active":""}`} onClick={()=>setActiveTab("video")}>🎬 Vidéo</button>
            <button className={`tab-btn ${activeTab==="tts"?"active":""}`} onClick={()=>setActiveTab("tts")}>🎙️ Text to Speech</button>
          </div>

          {/* ══════════════════════ IMAGE TAB ══════════════════════ */}
          {activeTab==="image" && (
            <div className="panel">

              <div className="section-title">Modèle d'image <span>CHOISIR</span></div>
              <div className="model-grid-img">
                {IMAGE_MODELS.map(m=>(
                  <div key={m.id} className={`model-card ${selectedImageModel===m.id?"selected":""}`} onClick={()=>setSelectedImageModel(m.id)}>
                    <div className="model-card-top">
                      <span className="model-icon">{m.icon}</span>
                      <span className="model-badge" style={{background:`${m.badgeColor}18`,color:m.badgeColor,border:`1px solid ${m.badgeColor}38`}}>{m.badge}</span>
                    </div>
                    <div className="model-name">{m.name}</div>
                    <div className="model-desc">{m.desc}</div>
                    <div className="model-speed">⏱ {m.speed}</div>
                    <div className="model-provider" style={{marginTop:3,fontSize:9,fontFamily:"'JetBrains Mono',monospace",color:"rgba(160,140,255,.3)"}}>via {m.provider}</div>
                  </div>
                ))}
              </div>

              <div className="divider"/>

              <label className="field-label">📐 Format / Ratio</label>
              <div className="ratio-row">
                {IMAGE_RATIOS.map(r=>(
                  <div key={r.id} className={`ratio-chip ${selectedImageRatio===r.id?"selected":""}`} onClick={()=>setSelectedImageRatio(r.id)}>
                    <span className="ratio-chip-icon">{r.icon}</span>
                    <span>{r.label}</span>
                  </div>
                ))}
              </div>

              <div className="divider"/>

              <label className="field-label">✦ Décris ton image</label>
              <textarea rows={3} placeholder="Ex: Un dragon lumineux survolant une cité futuriste au coucher du soleil, reflets néon sur l'eau…" value={imagePrompt} onChange={e=>setImagePrompt(e.target.value)}/>

              <div className="options-row">
                <div className="option-group">
                  <label className="field-label">Style visuel</label>
                  <div className="style-grid">
                    {STYLE_PRESETS.map(s=>(
                      <div key={s.id} className={`style-chip ${selectedStyle===s.id?"selected":""}`} onClick={()=>setSelectedStyle(s.id)}>{s.emoji} {s.label}</div>
                    ))}
                  </div>
                </div>
                <div className="option-group">
                  <label className="field-label">Nombre d'images</label>
                  <div className="count-row">
                    <button className="count-btn" onClick={()=>setImageCount(Math.max(1,imageCount-1))}>−</button>
                    <span className="count-val">{imageCount}</span>
                    <button className="count-btn" onClick={()=>setImageCount(Math.min(4,imageCount+1))}>+</button>
                  </div>
                </div>
              </div>

              <button className="gen-btn" onClick={handleGenerateImage} disabled={generatingImage||!imagePrompt.trim()}>
                {generatingImage
                  ? <><div className="spinner"/> Génération en cours…</>
                  : <>✦ Générer avec {activeImgModel?.name} · {selectedImageRatio}</>
                }
              </button>
              {!user && <div className="login-hint">⚠ Connexion requise pour générer</div>}

              {/* Progress */}
              {generatingImage && (
                <div className="progress-section">
                  <div className="progress-header">
                    <span className="progress-label">✦ {activeImgModel?.name} — GÉNÉRATION</span>
                    <span className="progress-pct">{imageProgress}%</span>
                  </div>
                  <ProgressBar pct={imageProgress}/>
                  <div className="progress-sub">{activeImgModel?.name} · {selectedImageRatio} · {selectedStyle}</div>
                  <div className="progress-stage">
                    {imageProgress < 15 ? "🔍 Analyse du prompt…"
                      : imageProgress < 40 ? "🎨 Composition des éléments…"
                      : imageProgress < 70 ? "⚙ Rendu des détails…"
                      : imageProgress < 90 ? "✨ Finalisation…"
                      : "✅ Presque prêt !"}
                  </div>
                </div>
              )}

              {/* Results */}
              {!generatingImage && generatedImages.length>0 && currentImage && (
                <div className="result-section">
                  <div className="result-label">✦ {generatedImages.length} image{generatedImages.length>1?"s":""} · {activeImgModel?.name} · {selectedImageRatio}</div>
                  <div className="image-card">
                    <div className="image-canvas">
                      <div className="image-canvas-inner" style={{paddingTop:ratioPad(selectedImageRatio)}}>
                        <div className="img-bg">
                          <div className="img-gradient-1" style={{background:`radial-gradient(ellipse at 30% 40%,${currentImage.palette[0]}55,transparent 60%),radial-gradient(ellipse at 72% 60%,${currentImage.palette[1]}44,transparent 60%),radial-gradient(ellipse at 50% 85%,${currentImage.palette[2]}33,transparent 60%),linear-gradient(135deg,#0a0414,#050818)`}}/>
                          <div className="img-noise"/><div className="img-scanlines"/>
                        </div>
                        <div className="img-center-content">
                          <span className="img-icon">{selectedStyle==="cinematic"?"🎬":selectedStyle==="anime"?"✨":selectedStyle==="realistic"?"📷":selectedStyle==="abstract"?"🌀":selectedStyle==="neon"?"💜":"🎨"}</span>
                          <div>
                            <span className="img-model-badge">{activeImgModel?.name}</span>
                            <span className="img-ratio-badge">{selectedImageRatio}</span>
                          </div>
                          <div className="img-title">{currentImage.title}</div>
                          <div className="img-mood">{currentImage.mood}</div>
                        </div>
                      </div>
                    </div>
                    <div className="img-desc-box">
                      <div className="img-desc-num">IMAGE {currentImageIndex+1}/{generatedImages.length}</div>
                      <div className="img-desc-text">{currentImage.description}</div>
                      <div className="palette-row">
                        <span className="palette-label">PALETTE →</span>
                        {currentImage.palette.map((c,i)=><div key={i} className="palette-swatch" style={{background:c}}/>)}
                      </div>
                      <button className="download-btn-img" onClick={()=>fakeDownload(`genclip_${currentImage.title?.replace(/\s+/g,"_")||"image"}`,"png")}>
                        ⬇ Télécharger l'image
                      </button>
                    </div>
                  </div>
                  {generatedImages.length>1 && (
                    <div className="img-dots">
                      {generatedImages.map((_,i)=><div key={i} className={`img-dot ${i===currentImageIndex?"active":""}`} onClick={()=>setCurrentImageIndex(i)}/>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════ VIDEO TAB ══════════════════════ */}
          {activeTab==="video" && (
            <div className="panel">

              <div className="credits-bar">
                <span className="credits-icon">🪙</span>
                <div className="credits-info">
                  <div className="credits-top">
                    <span className="credits-label">CRÉDITS JOURNALIERS</span>
                    <span className={`credits-value ${creditsLeft<30?"credits-low":""}`}>{creditsLeft} / {DAILY_CREDITS}</span>
                  </div>
                  <ProgressBar pct={creditsPct} color={creditsLeft<30?"#f87171":"#fbbf24"}/>
                </div>
              </div>

              <div className="section-title">Moteur vidéo <span>CHOISIR</span></div>
              <div className="model-grid">
                {VIDEO_MODELS.map(m=>(
                  <div key={m.id} className={`model-card ${selectedVideoModel===m.id?"selected":""}`} onClick={()=>setSelectedVideoModel(m.id)}>
                    <div className="model-card-top"><span className="model-icon">{m.icon}</span><span className="model-badge" style={{background:`${m.badgeColor}18`,color:m.badgeColor,border:`1px solid ${m.badgeColor}38`}}>{m.badge}</span></div>
                    <div className="model-name">{m.name}</div>
                    <div className="model-desc">{m.desc}</div>
                    <div className="model-speed">⏱ {m.speed}</div>
                    <div className="model-provider">par {m.provider}</div>
                    <div className="model-credits">🪙 {m.credits} crédits / vidéo</div>
                  </div>
                ))}
              </div>

              <div className="divider"/>

              <label className="field-label">📐 Format / Ratio</label>
              <div className="ratio-row">
                {VIDEO_RATIOS.map(r=>(
                  <div key={r.id} className={`ratio-chip ${selectedVideoRatio===r.id?"selected":""}`} onClick={()=>setSelectedVideoRatio(r.id)}>
                    <span className="ratio-chip-icon">{r.icon}</span>
                    <span>{r.label}</span>
                    <span className="ratio-chip-desc">{r.desc}</span>
                  </div>
                ))}
              </div>

              <div className="divider"/>

              <label className="field-label">✦ Décris ta vidéo</label>
              <textarea rows={3} placeholder="Ex: Un voyage à travers une galaxie spirale, nébuleuses colorées, atterrissage sur planète cristalline…" value={videoPrompt} onChange={e=>setVideoPrompt(e.target.value)}/>

              <div style={{marginTop:18}}>
                <label className="field-label">📷 Photo source (optionnel) — image-to-video</label>
                {!videoPhotoPreview ? (
                  <div className="photo-upload-zone">
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload}/>
                    <div className="puz-icon">🖼️</div>
                    <div className="puz-text"><strong>Clique ou glisse une photo</strong><br/>JPG, PNG, WEBP · max 10 MB</div>
                  </div>
                ) : (
                  <div className="photo-preview-wrap">
                    <img src={videoPhotoPreview} alt="Source" className="photo-preview-img"/>
                    <button className="photo-remove-btn" onClick={removePhoto}>✕</button>
                  </div>
                )}
              </div>

              <div className="options-row" style={{marginTop:16}}>
                <div className="option-group">
                  <label className="field-label">Durée</label>
                  <select value={selectedDuration} onChange={e=>setSelectedDuration(e.target.value)}>
                    {DURATIONS.map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="option-group">
                  <label className="field-label">Transition</label>
                  <select value={selectedTransition} onChange={e=>setSelectedTransition(e.target.value)}>
                    {TRANSITIONS.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {activeVidModel && (
                <div className="cost-warning">
                  🪙 Cette génération coûte <strong style={{color:"#fbbf24"}}>{activeVidModel.credits} crédits</strong> — il vous reste <strong style={{color:creditsLeft<30?"#f87171":"#fbbf24"}}>{creditsLeft}</strong> crédits
                </div>
              )}

              <button className="gen-btn" onClick={handleGenerateVideo} disabled={generatingVideo||!videoPrompt.trim()||creditsLeft<(activeVidModel?.credits||0)}>
                {generatingVideo
                  ? <><div className="spinner"/> {activeVidModel?.name} en cours…</>
                  : creditsLeft < (activeVidModel?.credits||0)
                  ? <>❌ Crédits insuffisants</>
                  : <>✦ Créer avec {activeVidModel?.name} · {selectedVideoRatio}{videoPhoto?" · Photo source":""}</>
                }
              </button>
              {!user && <div className="login-hint">⚠ Connexion requise pour créer une vidéo</div>}

              {generatingVideo && (
                <div className="progress-section">
                  <div className="progress-header">
                    <span className="progress-label">✦ {activeVidModel?.name} — RENDU</span>
                    <span className="progress-pct">{videoProgress}%</span>
                  </div>
                  <ProgressBar pct={videoProgress}/>
                  <div className="progress-sub">{activeVidModel?.provider} · {selectedVideoRatio} · {selectedDuration} · {selectedTransition}</div>
                  <div className="progress-stage">
                    {videoProgress < 10 ? "🧠 Interprétation du prompt…"
                      : videoProgress < 30 ? "🎞 Génération des frames…"
                      : videoProgress < 60 ? "🎬 Rendu cinématique…"
                      : videoProgress < 85 ? "✂ Montage & transitions…"
                      : "🎯 Finalisation de la vidéo…"}
                  </div>
                </div>
              )}

              {!generatingVideo && videoFrames.length>0 && (
                <div className="result-section">
                  <div className="result-label">✦ {activeVidModel?.name} · {selectedVideoRatio} · {videoFrames.length} frames{videoPhoto?" · Image-to-Video":""}</div>
                  <div className="frames-grid">
                    {videoFrames.map((frame,i)=>(
                      <div key={frame.id} className="frame-card" style={{animationDelay:`${i*.07}s`}}>
                        <div className="frame-canvas">
                          <div className="frame-canvas-inner" style={{paddingTop:ratioPad(selectedVideoRatio,VIDEO_RATIOS)}}>
                            <div className="frame-bg" style={{background:`radial-gradient(ellipse at ${30+i*12}% 50%,${frame.palette[0]}66,transparent 60%),radial-gradient(ellipse at ${70-i*8}% 70%,${frame.palette[1]}44,transparent 60%),linear-gradient(160deg,#050010,#000814)`}}/>
                            <div className="frame-overlay">
                              <span className="frame-num">F{String(i+1).padStart(2,"0")}</span>
                              <div className="frame-desc">{frame.description.substring(0,55)}…</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {videoReady && (
                    <div className="video-ready-card">
                      <div className="video-ready-icon">{activeVidModel?.icon}</div>
                      <div className="video-ready-title">{videoTitle||"Vidéo Générée avec Succès"}</div>
                      <div className="video-ready-sub">{activeVidModel?.name} · {selectedVideoRatio} · {selectedDuration} · {selectedTransition} · {videoFrames.length} frames{videoPhoto?" · Image source":""}</div>
                      <button className="download-btn" onClick={()=>fakeDownload(`genclip_video_${videoTitle?.replace(/\s+/g,"_")||"video"}`,"mp4")}>
                        ⬇ Télécharger la Vidéo
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════ TTS TAB ══════════════════════ */}
          {activeTab==="tts" && (
            <div className="panel">

              <div className="section-title">Langue <span>CHOISIR</span></div>
              <div className="tts-lang-grid">
                {TTS_LANGUAGES.map(l=>(
                  <div key={l.code} className={`tts-lang-chip ${ttsLang===l.code?"selected":""}`} onClick={()=>setTtsLang(l.code)}>
                    <span className="tts-lang-flag">{l.flag}</span>
                    <span className="tts-lang-name">{l.label}</span>
                  </div>
                ))}
              </div>

              <div className="divider"/>

              <label className="field-label">🎭 Genre de la voix</label>
              <div className="tts-gender-row">
                <button className={`tts-gender-btn ${ttsGender==="female"?"selected":""}`} onClick={()=>setTtsGender("female")}>👩 Female</button>
                <button className={`tts-gender-btn ${ttsGender==="male"?"selected":""}`} onClick={()=>setTtsGender("male")}>👨 Male</button>
              </div>

              <div className="divider"/>

              <div className="section-title">Type de voix <span>CHOISIR</span></div>
              <div className="tts-voice-grid">
                {TTS_VOICES.map(v=>(
                  <div key={v.id} className={`tts-voice-card ${ttsVoice===v.id?"selected":""}`} onClick={()=>setTtsVoice(v.id)}>
                    <div className="tts-voice-top">
                      <span className="tts-voice-icon">{v.icon}</span>
                      <span className="tts-voice-name">{v.label}</span>
                    </div>
                    <div className="tts-voice-desc">{v.desc}</div>
                    {/* Authors for this voice type */}
                    <div className="authors-row">
                      {v.authors[ttsGender].map(a=>(
                        <div key={a}
                          className={`author-chip ${ttsVoice===v.id&&ttsAuthor===a?"selected":""}`}
                          onClick={e=>{e.stopPropagation();setTtsVoice(v.id);setTtsAuthor(a);}}>
                          {a}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="divider"/>

              <label className="field-label">✦ Texte à synthétiser</label>
              <textarea rows={5} placeholder="Entrez votre texte ici. Il sera synthétisé avec la voix, la langue et le style que vous avez choisis…" value={ttsText} onChange={e=>setTtsText(e.target.value)}/>
              <div style={{textAlign:"right",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"rgba(160,140,255,.35)",marginTop:5}}>{ttsText.length} caractères</div>

              <button className="gen-btn" style={{background:"linear-gradient(135deg,#6d28d9,#0891b2)"}} onClick={handleGenerateTTS} disabled={ttsGenerating||!ttsText.trim()}>
                {ttsGenerating
                  ? <><div className="spinner"/> Synthèse en cours…</>
                  : <>🎙️ Générer · {TTS_LANGUAGES.find(l=>l.code===ttsLang)?.flag} · {ttsGender==="female"?"Female":"Male"} · {TTS_VOICES.find(v=>v.id===ttsVoice)?.label}{ttsAuthor?` · ${ttsAuthor}`:""}</>
                }
              </button>
              {!user && <div className="login-hint">⚠ Connexion requise pour la synthèse vocale</div>}

              {ttsGenerating && (
                <div className="progress-section">
                  <div className="progress-header">
                    <span className="progress-label">✦ SYNTHÈSE VOCALE</span>
                    <span className="progress-pct">{ttsProgress}%</span>
                  </div>
                  <ProgressBar pct={ttsProgress} color="#6d28d9"/>
                  <div className="progress-sub">{TTS_LANGUAGES.find(l=>l.code===ttsLang)?.label} · {ttsGender} · {TTS_VOICES.find(v=>v.id===ttsVoice)?.label}{ttsAuthor?` · ${ttsAuthor}`:""}</div>
                  <div className="progress-stage">
                    {ttsProgress < 20 ? "🔤 Analyse phonétique…"
                      : ttsProgress < 50 ? "🎤 Synthèse de la voix…"
                      : ttsProgress < 80 ? "🎵 Traitement audio…"
                      : "✅ Finalisation…"}
                  </div>
                </div>
              )}

              {!ttsGenerating && ttsResult && (
                <div className="tts-result-card">
                  <div className="tts-result-title">
                    <span>🎙️ Synthèse prête</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"rgba(103,232,249,.5)",letterSpacing:1}}>
                      {TTS_LANGUAGES.find(l=>l.code===ttsLang)?.flag} {ttsGender==="female"?"👩":"👨"} {TTS_VOICES.find(v=>v.id===ttsVoice)?.label}
                      {ttsAuthor ? ` · ${ttsAuthor}` : ""}
                    </span>
                  </div>
                  <div className="tts-result-row"><span className="tts-result-meta">ÉMOTION</span><span className="tts-result-val">{ttsResult.emotion}</span></div>
                  <div className="tts-result-row"><span className="tts-result-meta">RYTHME</span><span className="tts-result-val">{ttsResult.pace}</span></div>
                  <div className="tts-result-row"><span className="tts-result-meta">DURÉE EST.</span><span className="tts-result-val">{ttsResult.duration_estimate}</span></div>
                  <div className="tts-result-row"><span className="tts-result-meta">NOTES VOIX</span><span className="tts-result-val" style={{fontSize:11,maxWidth:"60%",textAlign:"right"}}>{ttsResult.voice_notes}</span></div>

                  <div className="tts-audio-bar">
                    <button className="tts-play-btn">▶</button>
                    <div className="tts-wave">
                      {Array.from({length:30},(_,i)=>(
                        <div key={i} className="tts-wave-bar" style={{
                          left:`${i*(100/30)}%`,
                          animationDuration:`${.35+Math.random()*.65}s`,
                          animationDelay:`${Math.random()*.35}s`,
                          height:`${18+Math.random()*64}%`,
                        }}/>
                      ))}
                    </div>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"rgba(160,140,255,.35)"}}>00:{String(Math.floor(ttsText.length/18)).padStart(2,"0")}</span>
                  </div>
                  <button className="tts-dl-btn" onClick={()=>fakeDownload(`genclip_tts_${ttsAuthor?.replace(/\s+/g,"_")||"audio"}`,"mp3")}>
                    ⬇ Télécharger l'audio MP3
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
