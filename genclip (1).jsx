import { useState, useRef, useEffect } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────

const STYLE_PRESETS = [
  { id: "cinematic", label: "Cinématique", emoji: "🎬" },
  { id: "anime",     label: "Anime",       emoji: "✨" },
  { id: "realistic", label: "Réaliste",    emoji: "📷" },
  { id: "abstract",  label: "Abstrait",    emoji: "🌀" },
  { id: "neon",      label: "Néon",        emoji: "💜" },
  { id: "watercolor",label: "Aquarelle",   emoji: "🎨" },
];

const IMAGE_MODELS = [
  {
    id: "nano",
    name: "Nano",
    badge: "RAPIDE",
    badgeColor: "#22d3ee",
    desc: "Génération ultra-rapide, idéale pour les esquisses et prototypes.",
    speed: "~2s",
    icon: "⚡",
  },
  {
    id: "banana2",
    name: "Banana 2",
    badge: "ÉQUILIBRÉ",
    badgeColor: "#a3e635",
    desc: "Qualité premium avec une vitesse optimisée, parfait pour la création quotidienne.",
    speed: "~6s",
    icon: "🍌",
  },
  {
    id: "pro",
    name: "Pro",
    badge: "MAX QUALITÉ",
    badgeColor: "#f472b6",
    desc: "Rendu photoréaliste haut de gamme avec le maximum de détails et de cohérence.",
    speed: "~15s",
    icon: "💎",
  },
];

const VIDEO_MODELS = [
  {
    id: "veo31lite",
    name: "Veo 3.1 Lite",
    badge: "GOOGLE",
    badgeColor: "#4ade80",
    desc: "Modèle vidéo Google léger — génération rapide, idéal pour les aperçus.",
    speed: "~20s",
    icon: "🟢",
    provider: "Google",
  },
  {
    id: "veo31fast",
    name: "Veo 3.1 Fast",
    badge: "GOOGLE",
    badgeColor: "#fb923c",
    desc: "Version accélérée de Veo 3.1 avec rendu optimisé et haute fidélité.",
    speed: "~35s",
    icon: "🔶",
    provider: "Google",
  },
  {
    id: "seedance2",
    name: "Seedance 2.0",
    badge: "PREMIUM",
    badgeColor: "#c084fc",
    desc: "Technologie de pointe pour des vidéos cinématiques fluides et photoréalistes.",
    speed: "~60s",
    icon: "🌟",
    provider: "ByteDance",
  },
];

const DURATIONS = ["3s", "5s", "8s", "12s"];
const TRANSITIONS = ["Fondu", "Glisser", "Zoom", "Rotation", "Flash"];

// ── Small helpers ─────────────────────────────────────────────────────────────

function Particle({ style }) {
  return <div className="particle" style={style} />;
}

function Avatar({ user, size = 34 }) {
  if (user.photo) {
    return (
      <img
        src={user.photo}
        alt={user.name}
        style={{
          width: size, height: size, borderRadius: "50%",
          border: "2px solid rgba(167,139,250,0.5)",
          objectFit: "cover",
        }}
      />
    );
  }
  const initials = user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg,#7c3aed,#0ea5e9)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, fontWeight: 700, color: "#fff",
      border: "2px solid rgba(167,139,250,0.5)",
    }}>
      {initials}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function GenClip() {
  // auth
  const [user, setUser]         = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // tabs
  const [activeTab, setActiveTab] = useState("image");

  // image state
  const [imagePrompt, setImagePrompt]     = useState("");
  const [selectedStyle, setSelectedStyle] = useState("cinematic");
  const [selectedImageModel, setSelectedImageModel] = useState("banana2");
  const [imageCount, setImageCount]       = useState(1);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // video state
  const [videoPrompt, setVideoPrompt]         = useState("");
  const [selectedVideoModel, setSelectedVideoModel] = useState("veo31fast");
  const [selectedDuration, setSelectedDuration]   = useState("5s");
  const [selectedTransition, setSelectedTransition] = useState("Fondu");
  const [videoPhoto, setVideoPhoto]           = useState(null);
  const [videoPhotoPreview, setVideoPhotoPreview] = useState(null);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoFrames, setVideoFrames]         = useState([]);
  const [videoReady, setVideoReady]           = useState(false);
  const [videoProgress, setVideoProgress]     = useState(0);
  const [videoTitle, setVideoTitle]           = useState("");

  // particles
  const [particles, setParticles] = useState([]);

  const intervalRef  = useRef(null);
  const fileInputRef = useRef(null);

  // ── Effects ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    setParticles(Array.from({ length: 18 }, () => ({
      left: `${Math.random() * 100}%`,
      top:  `${Math.random() * 100}%`,
      width:  `${2 + Math.random() * 4}px`,
      height: `${2 + Math.random() * 4}px`,
      animationDelay:    `${Math.random() * 4}s`,
      animationDuration: `${3  + Math.random() * 4}s`,
      opacity: 0.15 + Math.random() * 0.35,
    })));
  }, []);

  useEffect(() => {
    if (generatedImages.length > 1) {
      intervalRef.current = setInterval(
        () => setCurrentImageIndex(p => (p + 1) % generatedImages.length),
        2200
      );
    }
    return () => clearInterval(intervalRef.current);
  }, [generatedImages]);

  // close menu on outside click
  useEffect(() => {
    const handler = () => setShowUserMenu(false);
    if (showUserMenu) window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [showUserMenu]);

  // ── Auth (simulated Google OAuth) ────────────────────────────────────────────

  function handleGoogleLogin() {
    setLoginLoading(true);
    // Simulate OAuth flow with a timeout
    setTimeout(() => {
      const mockUsers = [
        { name: "Jean-Baptiste Koffi", email: "jb.koffi@gmail.com",   photo: null },
        { name: "Amina Traoré",        email: "amina.traore@gmail.com", photo: null },
      ];
      const u = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      setUser(u);
      setLoginLoading(false);
      setShowLogin(false);
    }, 1800);
  }

  function handleLogout() {
    setUser(null);
    setShowUserMenu(false);
    setGeneratedImages([]);
    setVideoFrames([]);
    setVideoReady(false);
  }

  // ── API call ─────────────────────────────────────────────────────────────────

  async function callClaude(prompt, type) {
    const sysImage = `Tu es GenClip AI. Réponds UNIQUEMENT avec un JSON valide, sans markdown ni backticks. Format:
{"descriptions":["desc1","desc2"],"mood":"string","palette":["#hex1","#hex2","#hex3"],"title":"string"}`;

    const sysVideo = `Tu es GenClip AI. Réponds UNIQUEMENT avec un JSON valide, sans markdown ni backticks. Format:
{"frames":["desc1","desc2","desc3","desc4","desc5"],"mood":"string","palette":["#hex1","#hex2","#hex3"],"title":"string","synopsis":"string"}`;

    const userMessage = type === "image"
      ? `Prompt: "${prompt}"\nStyle: ${selectedStyle}\nModèle: ${selectedImageModel}\nNombre: ${imageCount}`
      : `Prompt: "${prompt}"\nModèle vidéo: ${selectedVideoModel}\nDurée: ${selectedDuration}\nTransition: ${selectedTransition}${videoPhoto ? "\n[Photo source fournie]" : ""}`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: type === "image" ? sysImage : sysVideo,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
    const data = await res.json();
    const text = data.content.map(b => b.text || "").join("");
    return JSON.parse(text);
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────

  async function handleGenerateImage() {
    if (!imagePrompt.trim() || !user) { if (!user) setShowLogin(true); return; }
    setGeneratingImage(true);
    setGeneratedImages([]);
    try {
      const result = await callClaude(imagePrompt, "image");
      setGeneratedImages(
        result.descriptions.slice(0, imageCount).map((desc, i) => ({
          id: i, description: desc,
          mood: result.mood,
          palette: result.palette || ["#0ff","#f0f","#ff0"],
          title: result.title,
        }))
      );
      setCurrentImageIndex(0);
    } catch (e) { console.error(e); }
    setGeneratingImage(false);
  }

  async function handleGenerateVideo() {
    if (!videoPrompt.trim() || !user) { if (!user) setShowLogin(true); return; }
    setGeneratingVideo(true);
    setVideoReady(false);
    setVideoFrames([]);
    setVideoProgress(0);
    setVideoTitle("");
    try {
      const result = await callClaude(videoPrompt, "video");
      setVideoTitle(result.title || "");
      setVideoFrames(
        result.frames.map((desc, i) => ({
          id: i, description: desc,
          palette: result.palette || ["#0ff","#f0f","#ff0"],
        }))
      );
      const model = VIDEO_MODELS.find(m => m.id === selectedVideoModel);
      const steps = model?.id === "veo31lite" ? 20 : model?.id === "veo31fast" ? 35 : 60;
      for (let p = 0; p <= 100; p += 5) {
        await new Promise(r => setTimeout(r, (steps * 10) / 20));
        setVideoProgress(p);
      }
      setVideoReady(true);
    } catch (e) { console.error(e); }
    setGeneratingVideo(false);
  }

  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setVideoPhoto(file);
    const reader = new FileReader();
    reader.onload = ev => setVideoPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    setVideoPhoto(null);
    setVideoPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Derived ──────────────────────────────────────────────────────────────────

  const currentImage    = generatedImages[currentImageIndex];
  const activeImgModel  = IMAGE_MODELS.find(m => m.id === selectedImageModel);
  const activeVidModel  = VIDEO_MODELS.find(m => m.id === selectedVideoModel);

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #030308; color: #e8e4ff; font-family: 'Syne', sans-serif; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 3px; }

        .app { min-height: 100vh; background: #030308; position: relative; overflow-x: hidden; }
        .grid-bg { position: fixed; inset: 0; z-index: 0; background-image: linear-gradient(rgba(120,80,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(120,80,255,0.04) 1px, transparent 1px); background-size: 48px 48px; pointer-events: none; }
        .glow-orb { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
        .orb1 { width:500px;height:500px;background:rgba(100,40,255,0.12);top:-150px;left:-100px; }
        .orb2 { width:400px;height:400px;background:rgba(0,220,200,0.08);bottom:-100px;right:-100px; }
        .orb3 { width:300px;height:300px;background:rgba(255,60,150,0.07);top:40%;left:60%; }
        .particle { position:fixed;border-radius:50%;background:rgba(160,120,255,0.5);animation:floatP linear infinite;pointer-events:none;z-index:0; }
        @keyframes floatP { 0%{transform:translateY(0) scale(1);opacity:0} 20%{opacity:1} 80%{opacity:.6} 100%{transform:translateY(-80px) scale(.5);opacity:0} }

        .container { position:relative;z-index:1;max-width:920px;margin:0 auto;padding:0 24px 80px; }

        /* ── HEADER ── */
        header { display:flex;align-items:center;justify-content:space-between;padding:26px 0 44px; }
        .logo { display:flex;align-items:center;gap:12px; }
        .logo-icon { width:42px;height:42px;background:linear-gradient(135deg,#7c3aed,#0ea5e9);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 0 24px rgba(124,58,237,.5); }
        .logo-name { font-size:26px;font-weight:800;background:linear-gradient(90deg,#c4b5fd,#67e8f9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-0.5px; }
        .logo-tag { font-size:10px;font-family:'DM Mono',monospace;color:rgba(200,180,255,.4);letter-spacing:2px;text-transform:uppercase; }
        .header-right { display:flex;align-items:center;gap:10px; }
        .header-badge { font-family:'DM Mono',monospace;font-size:11px;color:#a78bfa;border:1px solid rgba(167,139,250,.25);border-radius:20px;padding:5px 14px;background:rgba(167,139,250,.05);letter-spacing:1px; }

        /* ── GOOGLE LOGIN BTN ── */
        .google-btn { display:flex;align-items:center;gap:9px;padding:8px 18px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:#e8e4ff;font-family:'Syne',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s; }
        .google-btn:hover { background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.22); }
        .google-icon { width:18px;height:18px;flex-shrink:0; }

        /* ── USER PILL ── */
        .user-pill { position:relative;display:flex;align-items:center;gap:9px;padding:5px 12px 5px 5px;border-radius:40px;border:1px solid rgba(167,139,250,.25);background:rgba(167,139,250,.06);cursor:pointer;transition:all .2s; }
        .user-pill:hover { background:rgba(167,139,250,.12); }
        .user-pill-name { font-size:13px;font-weight:600;color:#c4b5fd; }
        .user-menu { position:absolute;top:calc(100% + 8px);right:0;background:#0d0b1a;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:8px;min-width:200px;z-index:100;box-shadow:0 20px 60px rgba(0,0,0,.6);animation:fadeSlideUp .15s ease; }
        .user-menu-email { font-family:'DM Mono',monospace;font-size:10px;color:rgba(160,140,255,.5);padding:6px 12px 10px;letter-spacing:.5px; }
        .user-menu-item { width:100%;padding:9px 12px;border-radius:8px;border:none;background:transparent;color:rgba(200,190,255,.75);font-family:'Syne',sans-serif;font-size:13px;cursor:pointer;text-align:left;transition:background .15s; display:block;}
        .user-menu-item:hover { background:rgba(255,255,255,.05);color:#e8e4ff; }
        .user-menu-divider { height:1px;background:rgba(255,255,255,.06);margin:4px 0; }
        .logout-item { color:rgba(248,113,113,.7) !important; }
        .logout-item:hover { background:rgba(248,113,113,.08) !important;color:#fca5a5 !important; }

        /* ── LOGIN MODAL ── */
        .modal-overlay { position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.7);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;animation:fadeIn .2s ease; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .modal { background:#0d0b1a;border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:40px 36px;max-width:380px;width:90%;text-align:center;position:relative;box-shadow:0 40px 100px rgba(0,0,0,.8);animation:scaleIn .2s ease; }
        @keyframes scaleIn { from{transform:scale(.95);opacity:0} to{transform:scale(1);opacity:1} }
        .modal-close { position:absolute;top:14px;right:16px;background:none;border:none;color:rgba(200,190,255,.4);font-size:20px;cursor:pointer;padding:4px 8px;border-radius:6px; }
        .modal-close:hover { color:#e8e4ff;background:rgba(255,255,255,.06); }
        .modal-logo-wrap { width:56px;height:56px;background:linear-gradient(135deg,#7c3aed,#0ea5e9);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 20px;box-shadow:0 0 30px rgba(124,58,237,.4); }
        .modal-title { font-size:22px;font-weight:800;margin-bottom:8px;color:#e8e4ff; }
        .modal-sub { font-size:13px;color:rgba(160,140,255,.6);margin-bottom:28px;line-height:1.6; }
        .modal-google-btn { width:100%;display:flex;align-items:center;justify-content:center;gap:12px;padding:14px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:#e8e4ff;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;margin-bottom:12px; }
        .modal-google-btn:hover:not(:disabled) { background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.24);transform:translateY(-1px); }
        .modal-google-btn:disabled { opacity:.6;cursor:not-allowed; }
        .modal-footer { font-size:11px;font-family:'DM Mono',monospace;color:rgba(160,140,255,.35);margin-top:20px;letter-spacing:.5px; }

        /* ── HERO ── */
        .hero { text-align:center;margin-bottom:48px; }
        .hero-eyebrow { font-family:'DM Mono',monospace;font-size:11px;letter-spacing:3px;color:#67e8f9;text-transform:uppercase;margin-bottom:16px;display:inline-block; }
        .hero-title { font-size:clamp(34px,5.5vw,58px);font-weight:800;line-height:1.06;letter-spacing:-2px;margin-bottom:18px; }
        .hero-title span { background:linear-gradient(135deg,#a78bfa 0%,#38bdf8 50%,#f472b6 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent; }
        .hero-sub { font-size:16px;color:rgba(200,190,255,.5);max-width:480px;margin:0 auto;line-height:1.7; }

        /* ── TABS ── */
        .tabs { display:flex;gap:4px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:5px;margin:0 auto 32px;width:fit-content; }
        .tab-btn { padding:10px 26px;border-radius:10px;font-family:'Syne',sans-serif;font-size:14px;font-weight:600;border:none;cursor:pointer;transition:all .25s;display:flex;align-items:center;gap:7px;background:transparent;color:rgba(200,190,255,.45); }
        .tab-btn.active { background:linear-gradient(135deg,rgba(124,58,237,.6),rgba(14,165,233,.4));color:#fff;box-shadow:0 4px 20px rgba(124,58,237,.3); }
        .tab-btn:hover:not(.active) { color:rgba(200,190,255,.8);background:rgba(255,255,255,.04); }

        /* ── PANEL ── */
        .panel { background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:20px;padding:30px;backdrop-filter:blur(12px); }

        .field-label { font-family:'DM Mono',monospace;font-size:11px;letter-spacing:2px;color:rgba(160,140,255,.6);text-transform:uppercase;margin-bottom:10px;display:block; }
        textarea,input[type="text"] { width:100%;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.08);border-radius:12px;color:#e8e4ff;font-family:'Syne',sans-serif;font-size:15px;padding:14px 16px;outline:none;resize:none;transition:border-color .2s,box-shadow .2s;line-height:1.6; }
        textarea:focus,input[type="text"]:focus { border-color:rgba(124,58,237,.5);box-shadow:0 0 0 3px rgba(124,58,237,.1); }
        textarea::placeholder,input::placeholder { color:rgba(160,140,255,.3); }

        /* ── MODEL SELECTOR ── */
        .model-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px; }
        .model-card { border-radius:12px;border:1px solid rgba(255,255,255,.07);background:rgba(0,0,0,.25);padding:14px 12px;cursor:pointer;transition:all .2s;position:relative;overflow:hidden; }
        .model-card.selected { border-color:rgba(124,58,237,.55);background:rgba(124,58,237,.1);box-shadow:0 0 16px rgba(124,58,237,.2); }
        .model-card:hover:not(.selected) { border-color:rgba(255,255,255,.14);background:rgba(255,255,255,.03); }
        .model-card-top { display:flex;align-items:center;justify-content:space-between;margin-bottom:6px; }
        .model-icon { font-size:22px; }
        .model-badge { font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1.5px;padding:3px 7px;border-radius:5px;font-weight:500; }
        .model-name { font-size:14px;font-weight:700;color:#e8e4ff;margin-bottom:3px; }
        .model-desc { font-size:11px;color:rgba(160,140,255,.55);line-height:1.5;margin-bottom:6px; }
        .model-speed { font-family:'DM Mono',monospace;font-size:10px;color:rgba(103,232,249,.5);letter-spacing:1px; }
        .model-provider { font-family:'DM Mono',monospace;font-size:9px;color:rgba(160,140,255,.35);letter-spacing:1px;margin-top:2px; }

        /* ── OPTIONS ROW ── */
        .options-row { display:flex;flex-wrap:wrap;gap:16px;margin:22px 0; }
        .option-group { flex:1;min-width:160px; }
        .style-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:10px; }
        .style-chip { padding:8px 6px;border-radius:9px;border:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.2);color:rgba(200,190,255,.6);font-family:'Syne',sans-serif;font-size:12px;font-weight:600;cursor:pointer;text-align:center;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:4px; }
        .style-chip.selected { border-color:rgba(124,58,237,.6);background:rgba(124,58,237,.15);color:#c4b5fd;box-shadow:0 0 12px rgba(124,58,237,.2); }
        .style-chip:hover:not(.selected) { border-color:rgba(255,255,255,.15);color:rgba(200,190,255,.9); }
        select { width:100%;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.08);border-radius:10px;color:#e8e4ff;font-family:'Syne',sans-serif;font-size:13px;padding:10px 14px;outline:none;cursor:pointer;margin-top:10px; }
        .count-row { display:flex;align-items:center;gap:12px;margin-top:10px; }
        .count-btn { width:32px;height:32px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.3);color:#e8e4ff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s; }
        .count-btn:hover { border-color:rgba(124,58,237,.5);color:#a78bfa; }
        .count-val { font-size:20px;font-weight:700;color:#c4b5fd;min-width:28px;text-align:center; }

        /* ── PHOTO UPLOAD ── */
        .photo-upload-zone { position:relative;border:1.5px dashed rgba(255,255,255,.1);border-radius:12px;padding:18px;text-align:center;cursor:pointer;transition:all .2s;margin-top:10px;background:rgba(0,0,0,.2); }
        .photo-upload-zone:hover { border-color:rgba(124,58,237,.45);background:rgba(124,58,237,.05); }
        .photo-upload-zone input { position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%; }
        .puz-icon { font-size:26px;margin-bottom:6px; }
        .puz-text { font-size:12px;color:rgba(160,140,255,.6);line-height:1.6; }
        .puz-text strong { color:rgba(167,139,250,.9); }
        .photo-preview-wrap { position:relative;margin-top:10px;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.08); }
        .photo-preview-img { width:100%;max-height:180px;object-fit:cover;display:block; }
        .photo-remove-btn { position:absolute;top:8px;right:8px;width:28px;height:28px;border-radius:7px;background:rgba(0,0,0,.7);border:1px solid rgba(255,255,255,.15);color:#fff;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s; }
        .photo-remove-btn:hover { background:rgba(248,113,113,.3);border-color:rgba(248,113,113,.4); }

        /* ── GEN BUTTON ── */
        .gen-btn { width:100%;padding:15px;border:none;border-radius:13px;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#7c3aed,#0ea5e9);color:#fff;margin-top:6px;position:relative;overflow:hidden;transition:transform .15s,box-shadow .15s,opacity .15s;box-shadow:0 6px 30px rgba(124,58,237,.35);letter-spacing:.5px;display:flex;align-items:center;justify-content:center;gap:10px; }
        .gen-btn:hover:not(:disabled) { transform:translateY(-2px);box-shadow:0 10px 40px rgba(124,58,237,.5); }
        .gen-btn:active:not(:disabled) { transform:translateY(0); }
        .gen-btn:disabled { opacity:.55;cursor:not-allowed; }
        .gen-btn::after { content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);transform:translateX(-100%);animation:shimmer 2.2s infinite; }
        @keyframes shimmer { to{transform:translateX(100%)} }

        .login-hint { font-family:'DM Mono',monospace;font-size:10px;color:rgba(248,196,113,.6);text-align:center;margin-top:8px;letter-spacing:.5px; }

        /* ── RESULTS ── */
        .result-section { margin-top:32px; }
        .result-label { font-family:'DM Mono',monospace;font-size:11px;letter-spacing:2px;color:rgba(103,232,249,.6);text-transform:uppercase;margin-bottom:14px; }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }

        /* ── IMAGE CARD ── */
        .image-card { border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.08);animation:fadeSlideUp .5s ease forwards; }
        .image-canvas { width:100%;height:340px;position:relative;overflow:hidden; }
        .img-bg { position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column; }
        .img-gradient-1 { position:absolute;inset:0;animation:gradShift 7s ease infinite alternate; }
        @keyframes gradShift { 0%{filter:hue-rotate(0deg) brightness(.9)} 100%{filter:hue-rotate(30deg) brightness(1.1)} }
        .img-noise { position:absolute;inset:0;opacity:.03;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:cover; }
        .img-scanlines { position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.03) 2px,rgba(0,0,0,.03) 4px);pointer-events:none; }
        .img-center-content { position:relative;z-index:2;text-align:center;padding:24px; }
        .img-icon { font-size:50px;margin-bottom:14px;display:block;filter:drop-shadow(0 0 20px rgba(255,255,255,.3)); }
        .img-model-badge { font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;padding:3px 10px;border-radius:5px;background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.6);margin-bottom:10px;display:inline-block; }
        .img-title { font-size:20px;font-weight:800;color:#fff;margin-bottom:7px;text-shadow:0 2px 20px rgba(0,0,0,.6); }
        .img-mood { font-family:'DM Mono',monospace;font-size:10px;color:rgba(255,255,255,.45);letter-spacing:2px;text-transform:uppercase; }
        .img-desc-box { padding:16px 20px;background:rgba(0,0,0,.4);border-top:1px solid rgba(255,255,255,.06); }
        .img-desc-num { font-family:'DM Mono',monospace;font-size:10px;color:rgba(167,139,250,.5);margin-bottom:4px;letter-spacing:1px; }
        .img-desc-text { font-size:13px;color:rgba(200,190,255,.7);line-height:1.7; }
        .img-dots { display:flex;gap:6px;justify-content:center;margin-top:10px; }
        .img-dot { width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.15);transition:all .2s;cursor:pointer; }
        .img-dot.active { background:#a78bfa;transform:scale(1.3); }
        .palette-row { display:flex;gap:6px;margin-top:12px;align-items:center; }
        .palette-swatch { width:20px;height:20px;border-radius:5px;border:1px solid rgba(255,255,255,.1); }
        .palette-label { font-family:'DM Mono',monospace;font-size:10px;color:rgba(160,140,255,.4);letter-spacing:1px; }

        /* ── VIDEO PROGRESS ── */
        .video-progress-wrap { margin:18px 0; }
        .vp-header { display:flex;justify-content:space-between;margin-bottom:8px; }
        .vp-label { font-family:'DM Mono',monospace;font-size:11px;color:rgba(103,232,249,.6);letter-spacing:2px; }
        .vp-pct { font-family:'DM Mono',monospace;font-size:13px;color:#67e8f9;font-weight:500; }
        .vp-bar-bg { height:5px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden; }
        .vp-bar-fill { height:100%;border-radius:3px;background:linear-gradient(90deg,#7c3aed,#0ea5e9);transition:width .1s ease; }
        .vp-model-label { font-family:'DM Mono',monospace;font-size:10px;color:rgba(160,140,255,.4);letter-spacing:1px;margin-top:6px; }

        /* ── FRAMES ── */
        .frames-grid { display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:14px; }
        .frame-card { border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,.08);aspect-ratio:9/16;position:relative;animation:fadeSlideUp .4s ease forwards; }
        .frame-bg { position:absolute;inset:0; }
        .frame-overlay { position:absolute;inset:0;display:flex;flex-direction:column;justify-content:space-between;padding:8px; }
        .frame-num { font-family:'DM Mono',monospace;font-size:9px;color:rgba(255,255,255,.5);background:rgba(0,0,0,.4);border-radius:4px;padding:2px 5px;width:fit-content; }
        .frame-desc { font-size:9px;color:rgba(255,255,255,.75);line-height:1.4;text-shadow:0 1px 4px rgba(0,0,0,.8);background:linear-gradient(transparent,rgba(0,0,0,.6));margin:-8px;padding:8px; }

        /* ── VIDEO READY ── */
        .video-ready-card { border-radius:16px;overflow:hidden;border:1px solid rgba(103,232,249,.2);background:rgba(0,0,0,.4);padding:26px;text-align:center;margin-top:18px;animation:fadeSlideUp .5s ease forwards; }
        .video-ready-icon { font-size:44px;margin-bottom:10px; }
        .video-ready-title { font-size:18px;font-weight:800;color:#67e8f9;margin-bottom:4px; }
        .video-ready-sub { font-size:12px;color:rgba(160,140,255,.55);line-height:1.6; }
        .download-btn { display:inline-flex;align-items:center;gap:8px;margin-top:16px;padding:10px 22px;border-radius:10px;background:rgba(103,232,249,.1);border:1px solid rgba(103,232,249,.3);color:#67e8f9;font-family:'Syne',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s; }
        .download-btn:hover { background:rgba(103,232,249,.18);box-shadow:0 0 20px rgba(103,232,249,.15); }

        .spinner { display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,.25);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }

        .divider { height:1px;background:rgba(255,255,255,.05);margin:24px 0; }
        .section-title { font-size:13px;font-weight:700;color:rgba(200,190,255,.8);margin-bottom:14px;display:flex;align-items:center;gap:8px; }
        .section-title span { font-family:'DM Mono',monospace;font-size:10px;color:rgba(103,232,249,.5);letter-spacing:2px; }

        @media(max-width:640px){
          .model-grid{grid-template-columns:1fr 1fr}
          .style-grid{grid-template-columns:repeat(2,1fr)}
          .frames-grid{grid-template-columns:repeat(3,1fr)}
          .options-row{flex-direction:column}
          header{flex-direction:column;gap:12px}
          .tabs{flex-direction:column;width:100%}
        }
      `}</style>

      {/* ── LOGIN MODAL ── */}
      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLogin(false)}>✕</button>
            <div className="modal-logo-wrap">🎞️</div>
            <div className="modal-title">Bienvenue sur GenClip</div>
            <div className="modal-sub">
              Connecte-toi pour générer des images et créer des vidéos avec l'IA.
            </div>
            <button className="modal-google-btn" onClick={handleGoogleLogin} disabled={loginLoading}>
              {loginLoading ? (
                <><div className="spinner" /> Connexion en cours…</>
              ) : (
                <>
                  <svg className="google-icon" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuer avec Google
                </>
              )}
            </button>
            <div className="modal-footer">✦ CONNEXION SÉCURISÉE · DONNÉES PROTÉGÉES</div>
          </div>
        </div>
      )}

      <div className="app">
        <div className="grid-bg" />
        <div className="glow-orb orb1" /><div className="glow-orb orb2" /><div className="glow-orb orb3" />
        {particles.map((p, i) => <Particle key={i} style={p} />)}

        <div className="container">

          {/* ── HEADER ── */}
          <header>
            <div className="logo">
              <div className="logo-icon">🎞️</div>
              <div>
                <div className="logo-name">GenClip</div>
                <div className="logo-tag">AI Studio</div>
              </div>
            </div>
            <div className="header-right">
              <div className="header-badge">✦ POWERED BY CLAUDE</div>
              {user ? (
                <div style={{ position: "relative" }}>
                  <div className="user-pill" onClick={e => { e.stopPropagation(); setShowUserMenu(v => !v); }}>
                    <Avatar user={user} />
                    <span className="user-pill-name">{user.name.split(" ")[0]}</span>
                    <span style={{ fontSize: 10, color: "rgba(167,139,250,.5)", marginLeft: 2 }}>▾</span>
                  </div>
                  {showUserMenu && (
                    <div className="user-menu" onClick={e => e.stopPropagation()}>
                      <div className="user-menu-email">{user.email}</div>
                      <div className="user-menu-divider" />
                      <button className="user-menu-item">⚙ Paramètres</button>
                      <button className="user-menu-item">🖼 Mes créations</button>
                      <div className="user-menu-divider" />
                      <button className="user-menu-item logout-item" onClick={handleLogout}>↩ Se déconnecter</button>
                    </div>
                  )}
                </div>
              ) : (
                <button className="google-btn" onClick={() => setShowLogin(true)}>
                  <svg className="google-icon" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Se connecter
                </button>
              )}
            </div>
          </header>

          {/* ── HERO ── */}
          <div className="hero">
            <div className="hero-eyebrow">✦ Génération Multimédia IA</div>
            <h1 className="hero-title">Crée. Génère.<br /><span>Imagine tout.</span></h1>
            <p className="hero-sub">
              Transforme tes idées en images époustouflantes et en vidéos cinématiques grâce à l'intelligence artificielle.
            </p>
          </div>

          {/* ── TABS ── */}
          <div className="tabs">
            <button className={`tab-btn ${activeTab==="image"?"active":""}`} onClick={() => setActiveTab("image")}>🖼️ Générer une Image</button>
            <button className={`tab-btn ${activeTab==="video"?"active":""}`} onClick={() => setActiveTab("video")}>🎬 Créer une Vidéo</button>
          </div>

          {/* ════════════════════ IMAGE TAB ════════════════════ */}
          {activeTab === "image" && (
            <div className="panel">

              {/* Model selector */}
              <div className="section-title">Modèle de génération <span>CHOISIR</span></div>
              <div className="model-grid">
                {IMAGE_MODELS.map(m => (
                  <div key={m.id} className={`model-card ${selectedImageModel===m.id?"selected":""}`} onClick={() => setSelectedImageModel(m.id)}>
                    <div className="model-card-top">
                      <span className="model-icon">{m.icon}</span>
                      <span className="model-badge" style={{ background: `${m.badgeColor}18`, color: m.badgeColor, border: `1px solid ${m.badgeColor}40` }}>{m.badge}</span>
                    </div>
                    <div className="model-name">{m.name}</div>
                    <div className="model-desc">{m.desc}</div>
                    <div className="model-speed">⏱ {m.speed}</div>
                  </div>
                ))}
              </div>

              <div className="divider" />

              {/* Prompt */}
              <label className="field-label">✦ Décris ton image</label>
              <textarea rows={3} placeholder="Ex: Un dragon lumineux survolant une cité futuriste au coucher du soleil, reflets néon sur l'eau..." value={imagePrompt} onChange={e => setImagePrompt(e.target.value)} />

              <div className="options-row">
                <div className="option-group">
                  <label className="field-label">Style visuel</label>
                  <div className="style-grid">
                    {STYLE_PRESETS.map(s => (
                      <div key={s.id} className={`style-chip ${selectedStyle===s.id?"selected":""}`} onClick={() => setSelectedStyle(s.id)}>
                        {s.emoji} {s.label}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="option-group">
                  <label className="field-label">Nombre d'images</label>
                  <div className="count-row">
                    <button className="count-btn" onClick={() => setImageCount(Math.max(1,imageCount-1))}>−</button>
                    <span className="count-val">{imageCount}</span>
                    <button className="count-btn" onClick={() => setImageCount(Math.min(4,imageCount+1))}>+</button>
                  </div>
                </div>
              </div>

              <button className="gen-btn" onClick={handleGenerateImage} disabled={generatingImage || !imagePrompt.trim()}>
                {generatingImage ? <><div className="spinner" /> Génération {activeImgModel?.name}…</> : <>✦ Générer avec {activeImgModel?.name}</>}
              </button>
              {!user && <div className="login-hint">⚠ Connexion requise pour générer</div>}

              {/* Results */}
              {generatedImages.length > 0 && currentImage && (
                <div className="result-section">
                  <div className="result-label">✦ Résultat — {generatedImages.length} image{generatedImages.length>1?"s":""} · {activeImgModel?.name}</div>
                  <div className="image-card">
                    <div className="image-canvas">
                      <div className="img-bg">
                        <div className="img-gradient-1" style={{ background: `radial-gradient(ellipse at 30% 40%,${currentImage.palette[0]}55,transparent 60%),radial-gradient(ellipse at 70% 60%,${currentImage.palette[1]}44,transparent 60%),radial-gradient(ellipse at 50% 80%,${currentImage.palette[2]}33,transparent 60%),linear-gradient(135deg,#0a0414,#050818)` }} />
                        <div className="img-noise" /><div className="img-scanlines" />
                      </div>
                      <div className="img-center-content">
                        <span className="img-icon">{selectedStyle==="cinematic"?"🎬":selectedStyle==="anime"?"✨":selectedStyle==="realistic"?"📷":selectedStyle==="abstract"?"🌀":selectedStyle==="neon"?"💜":"🎨"}</span>
                        <div className="img-model-badge">{activeImgModel?.name} · {activeImgModel?.badge}</div>
                        <div className="img-title">{currentImage.title}</div>
                        <div className="img-mood">{currentImage.mood}</div>
                      </div>
                    </div>
                    <div className="img-desc-box">
                      <div className="img-desc-num">IMAGE {currentImageIndex+1}/{generatedImages.length}</div>
                      <div className="img-desc-text">{currentImage.description}</div>
                      <div className="palette-row">
                        <span className="palette-label">PALETTE →</span>
                        {currentImage.palette.map((c,i) => <div key={i} className="palette-swatch" style={{ background: c }} />)}
                      </div>
                    </div>
                  </div>
                  {generatedImages.length > 1 && (
                    <div className="img-dots">
                      {generatedImages.map((_,i) => <div key={i} className={`img-dot ${i===currentImageIndex?"active":""}`} onClick={() => setCurrentImageIndex(i)} />)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════ VIDEO TAB ════════════════════ */}
          {activeTab === "video" && (
            <div className="panel">

              {/* Video Model selector */}
              <div className="section-title">Moteur vidéo <span>CHOISIR</span></div>
              <div className="model-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                {VIDEO_MODELS.map(m => (
                  <div key={m.id} className={`model-card ${selectedVideoModel===m.id?"selected":""}`} onClick={() => setSelectedVideoModel(m.id)}>
                    <div className="model-card-top">
                      <span className="model-icon">{m.icon}</span>
                      <span className="model-badge" style={{ background: `${m.badgeColor}18`, color: m.badgeColor, border: `1px solid ${m.badgeColor}40` }}>{m.badge}</span>
                    </div>
                    <div className="model-name">{m.name}</div>
                    <div className="model-desc">{m.desc}</div>
                    <div className="model-speed">⏱ {m.speed}</div>
                    <div className="model-provider">par {m.provider}</div>
                  </div>
                ))}
              </div>

              <div className="divider" />

              {/* Prompt */}
              <label className="field-label">✦ Décris ta vidéo</label>
              <textarea rows={3} placeholder="Ex: Un voyage à travers une galaxie spirale, passant par des nébuleuses colorées, atterrissant sur une planète cristalline..." value={videoPrompt} onChange={e => setVideoPrompt(e.target.value)} />

              {/* Photo upload */}
              <div style={{ marginTop: 20 }}>
                <label className="field-label">📷 Photo source (optionnel) — image-to-video</label>
                {!videoPhotoPreview ? (
                  <div className="photo-upload-zone">
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} />
                    <div className="puz-icon">🖼️</div>
                    <div className="puz-text"><strong>Clique ou glisse une photo</strong><br />JPG, PNG, WEBP · max 10 MB</div>
                  </div>
                ) : (
                  <div className="photo-preview-wrap">
                    <img src={videoPhotoPreview} alt="Source" className="photo-preview-img" />
                    <button className="photo-remove-btn" onClick={removePhoto}>✕</button>
                  </div>
                )}
              </div>

              <div className="options-row" style={{ marginTop: 18 }}>
                <div className="option-group">
                  <label className="field-label">Durée</label>
                  <select value={selectedDuration} onChange={e => setSelectedDuration(e.target.value)}>
                    {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="option-group">
                  <label className="field-label">Transition</label>
                  <select value={selectedTransition} onChange={e => setSelectedTransition(e.target.value)}>
                    {TRANSITIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <button className="gen-btn" onClick={handleGenerateVideo} disabled={generatingVideo || !videoPrompt.trim()}>
                {generatingVideo
                  ? <><div className="spinner" /> {activeVidModel?.name} en cours…</>
                  : <>✦ Créer avec {activeVidModel?.name}{videoPhoto ? " · Photo source" : ""}</>}
              </button>
              {!user && <div className="login-hint">⚠ Connexion requise pour créer une vidéo</div>}

              {/* Progress */}
              {generatingVideo && (
                <div className="video-progress-wrap">
                  <div className="vp-header">
                    <span className="vp-label">✦ {activeVidModel?.name} — RENDU</span>
                    <span className="vp-pct">{videoProgress}%</span>
                  </div>
                  <div className="vp-bar-bg"><div className="vp-bar-fill" style={{ width: `${videoProgress}%` }} /></div>
                  <div className="vp-model-label">{activeVidModel?.provider} · {selectedDuration} · {selectedTransition}</div>
                </div>
              )}

              {/* Frames */}
              {videoFrames.length > 0 && (
                <div className="result-section">
                  <div className="result-label">✦ Séquence — {activeVidModel?.name} · {videoFrames.length} frames{videoPhoto?" · Image-to-Video":""}</div>
                  <div className="frames-grid">
                    {videoFrames.map((frame, i) => (
                      <div key={frame.id} className="frame-card" style={{ animationDelay: `${i*0.07}s` }}>
                        <div className="frame-bg" style={{ background: `radial-gradient(ellipse at ${30+i*12}% 50%,${frame.palette[0]}66,transparent 60%),radial-gradient(ellipse at ${70-i*8}% 70%,${frame.palette[1]}44,transparent 60%),linear-gradient(160deg,#050010,#000814)` }} />
                        <div className="frame-overlay">
                          <span className="frame-num">F{String(i+1).padStart(2,"0")}</span>
                          <div className="frame-desc">{frame.description.substring(0,60)}…</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {videoReady && (
                    <div className="video-ready-card">
                      <div className="video-ready-icon">{activeVidModel?.icon}</div>
                      <div className="video-ready-title">{videoTitle || "Vidéo Générée avec Succès"}</div>
                      <div className="video-ready-sub">
                        {activeVidModel?.name} · {selectedDuration} · {selectedTransition} · {videoFrames.length} frames composées{videoPhoto?" · Image source intégrée":""}
                      </div>
                      <button className="download-btn">⬇ Télécharger la Vidéo</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
