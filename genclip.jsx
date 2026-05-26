import { useState, useRef, useEffect } from "react";

const STYLE_PRESETS = [
  { id: "cinematic", label: "Cinématique", emoji: "🎬" },
  { id: "anime", label: "Anime", emoji: "✨" },
  { id: "realistic", label: "Réaliste", emoji: "📷" },
  { id: "abstract", label: "Abstrait", emoji: "🌀" },
  { id: "neon", label: "Néon", emoji: "💜" },
  { id: "watercolor", label: "Aquarelle", emoji: "🎨" },
];

const DURATIONS = ["3s", "5s", "8s", "12s"];
const TRANSITIONS = ["Fondu", "Glisser", "Zoom", "Rotation", "Flash"];

function Particle({ style }) {
  return <div className="particle" style={style} />;
}

export default function GenClip() {
  const [activeTab, setActiveTab] = useState("image");
  const [imagePrompt, setImagePrompt] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("cinematic");
  const [selectedDuration, setSelectedDuration] = useState("5s");
  const [selectedTransition, setSelectedTransition] = useState("Fondu");
  const [imageCount, setImageCount] = useState(1);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [videoFrames, setVideoFrames] = useState([]);
  const [videoReady, setVideoReady] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [particles, setParticles] = useState([]);
  const [apiResponse, setApiResponse] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    const pts = Array.from({ length: 18 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${2 + Math.random() * 4}px`,
      height: `${2 + Math.random() * 4}px`,
      animationDelay: `${Math.random() * 4}s`,
      animationDuration: `${3 + Math.random() * 4}s`,
      opacity: 0.15 + Math.random() * 0.35,
    }));
    setParticles(pts);
  }, []);

  useEffect(() => {
    if (generatedImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % generatedImages.length);
      }, 2000);
    }
    return () => clearInterval(intervalRef.current);
  }, [generatedImages]);

  async function callClaude(prompt, type) {
    const systemPrompt =
      type === "image"
        ? `Tu es GenClip AI, un générateur d'images IA. L'utilisateur te donne un prompt et un style. Réponds UNIQUEMENT avec un objet JSON strictement valide, sans markdown, sans backticks, sans texte avant ou après. Format:
{"descriptions": ["desc1", "desc2", ...], "mood": "string", "palette": ["#hex1", "#hex2", "#hex3"], "title": "string"}`
        : `Tu es GenClip AI, un créateur de vidéos IA. L'utilisateur te donne un prompt pour une vidéo. Réponds UNIQUEMENT avec un objet JSON strictement valide, sans markdown, sans backticks, sans texte avant ou après. Format:
{"frames": ["desc_frame1", "desc_frame2", "desc_frame3", "desc_frame4", "desc_frame5"], "mood": "string", "palette": ["#hex1", "#hex2", "#hex3"], "title": "string", "synopsis": "string"}`;

    const userMessage =
      type === "image"
        ? `Prompt: "${prompt}"\nStyle: ${selectedStyle}\nNombre d'images: ${imageCount}`
        : `Prompt: "${prompt}"\nDurée: ${selectedDuration}\nTransition: ${selectedTransition}`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
    const data = await res.json();
    const text = data.content.map((b) => b.text || "").join("");
    return JSON.parse(text);
  }

  async function handleGenerateImage() {
    if (!imagePrompt.trim()) return;
    setGeneratingImage(true);
    setGeneratedImages([]);
    setApiResponse("");
    try {
      const result = await callClaude(imagePrompt, "image");
      setApiResponse(JSON.stringify(result, null, 2));
      const imgs = result.descriptions.slice(0, imageCount).map((desc, i) => ({
        id: i,
        description: desc,
        mood: result.mood,
        palette: result.palette || ["#0ff", "#f0f", "#ff0"],
        title: result.title,
      }));
      setGeneratedImages(imgs);
      setCurrentImageIndex(0);
    } catch (e) {
      setApiResponse("Erreur: " + e.message);
    }
    setGeneratingImage(false);
  }

  async function handleGenerateVideo() {
    if (!videoPrompt.trim()) return;
    setGeneratingVideo(true);
    setVideoReady(false);
    setVideoFrames([]);
    setVideoProgress(0);
    try {
      const result = await callClaude(videoPrompt, "video");
      const frames = result.frames.map((desc, i) => ({
        id: i,
        description: desc,
        palette: result.palette || ["#0ff", "#f0f", "#ff0"],
      }));
      setVideoFrames(frames);
      // Simulate progress
      for (let p = 0; p <= 100; p += 5) {
        await new Promise((r) => setTimeout(r, 60));
        setVideoProgress(p);
      }
      setVideoReady(true);
    } catch (e) {
      console.error(e);
    }
    setGeneratingVideo(false);
  }

  const currentImage = generatedImages[currentImageIndex];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #030308; color: #e8e4ff; font-family: 'Syne', sans-serif; }

        .app {
          min-height: 100vh;
          background: #030308;
          position: relative;
          overflow-x: hidden;
        }

        .grid-bg {
          position: fixed; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(120,80,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(120,80,255,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .glow-orb {
          position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0;
        }
        .orb1 { width: 500px; height: 500px; background: rgba(100,40,255,0.12); top: -150px; left: -100px; }
        .orb2 { width: 400px; height: 400px; background: rgba(0,220,200,0.08); bottom: -100px; right: -100px; }
        .orb3 { width: 300px; height: 300px; background: rgba(255,60,150,0.07); top: 40%; left: 60%; }

        .particle {
          position: fixed; border-radius: 50%;
          background: rgba(160,120,255,0.5);
          animation: floatParticle linear infinite;
          pointer-events: none; z-index: 0;
        }
        @keyframes floatParticle {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 0.6; }
          100% { transform: translateY(-80px) scale(0.5); opacity: 0; }
        }

        .container {
          position: relative; z-index: 1;
          max-width: 900px; margin: 0 auto; padding: 0 24px 80px;
        }

        /* HEADER */
        header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 28px 0 48px;
        }
        .logo {
          display: flex; align-items: center; gap: 12px;
        }
        .logo-icon {
          width: 42px; height: 42px;
          background: linear-gradient(135deg, #7c3aed, #0ea5e9);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          box-shadow: 0 0 24px rgba(124,58,237,0.5);
        }
        .logo-name {
          font-size: 26px; font-weight: 800;
          background: linear-gradient(90deg, #c4b5fd, #67e8f9);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          letter-spacing: -0.5px;
        }
        .logo-tag {
          font-size: 11px; font-family: 'DM Mono', monospace;
          color: rgba(200,180,255,0.4); letter-spacing: 2px;
          text-transform: uppercase; margin-left: 2px;
        }
        .header-badge {
          font-family: 'DM Mono', monospace;
          font-size: 11px; color: #a78bfa;
          border: 1px solid rgba(167,139,250,0.25);
          border-radius: 20px; padding: 5px 14px;
          background: rgba(167,139,250,0.05);
          letter-spacing: 1px;
        }

        /* HERO */
        .hero {
          text-align: center; margin-bottom: 52px;
        }
        .hero-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 11px; letter-spacing: 3px;
          color: #67e8f9; text-transform: uppercase;
          margin-bottom: 16px;
          display: inline-block;
        }
        .hero-title {
          font-size: clamp(36px, 6vw, 62px);
          font-weight: 800; line-height: 1.05;
          letter-spacing: -2px;
          margin-bottom: 20px;
        }
        .hero-title span {
          background: linear-gradient(135deg, #a78bfa 0%, #38bdf8 50%, #f472b6 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .hero-sub {
          font-size: 17px; color: rgba(200,190,255,0.55);
          max-width: 480px; margin: 0 auto;
          line-height: 1.7;
        }

        /* TABS */
        .tabs {
          display: flex; gap: 4px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 5px;
          margin-bottom: 36px; width: fit-content; margin-left: auto; margin-right: auto;
        }
        .tab-btn {
          padding: 10px 28px; border-radius: 10px;
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 600;
          border: none; cursor: pointer;
          transition: all 0.25s ease;
          display: flex; align-items: center; gap: 8px;
          background: transparent; color: rgba(200,190,255,0.45);
        }
        .tab-btn.active {
          background: linear-gradient(135deg, rgba(124,58,237,0.6), rgba(14,165,233,0.4));
          color: #fff;
          box-shadow: 0 4px 20px rgba(124,58,237,0.3);
        }
        .tab-btn:hover:not(.active) { color: rgba(200,190,255,0.8); background: rgba(255,255,255,0.04); }

        /* PANEL */
        .panel {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 32px;
          backdrop-filter: blur(12px);
        }

        .field-label {
          font-family: 'DM Mono', monospace;
          font-size: 11px; letter-spacing: 2px;
          color: rgba(160,140,255,0.6);
          text-transform: uppercase;
          margin-bottom: 10px; display: block;
        }

        textarea, input[type="text"] {
          width: 100%;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #e8e4ff;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          padding: 16px 18px;
          outline: none;
          resize: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          line-height: 1.6;
        }
        textarea:focus, input[type="text"]:focus {
          border-color: rgba(124,58,237,0.5);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
        }
        textarea::placeholder, input::placeholder { color: rgba(160,140,255,0.3); }

        .options-row {
          display: flex; flex-wrap: wrap; gap: 16px;
          margin: 24px 0;
        }
        .option-group { flex: 1; min-width: 180px; }

        .style-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px;
        }
        .style-chip {
          padding: 9px 8px; border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.2);
          color: rgba(200,190,255,0.6);
          font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 600;
          cursor: pointer; text-align: center;
          transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 5px;
        }
        .style-chip.selected {
          border-color: rgba(124,58,237,0.6);
          background: rgba(124,58,237,0.15);
          color: #c4b5fd;
          box-shadow: 0 0 12px rgba(124,58,237,0.2);
        }
        .style-chip:hover:not(.selected) { border-color: rgba(255,255,255,0.15); color: rgba(200,190,255,0.9); }

        select {
          width: 100%;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #e8e4ff;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          padding: 10px 14px;
          outline: none;
          cursor: pointer;
          margin-top: 10px;
        }

        .count-row {
          display: flex; align-items: center; gap: 12px; margin-top: 10px;
        }
        .count-btn {
          width: 32px; height: 32px; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(0,0,0,0.3);
          color: #e8e4ff; font-size: 18px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .count-btn:hover { border-color: rgba(124,58,237,0.5); color: #a78bfa; }
        .count-val {
          font-size: 20px; font-weight: 700;
          color: #c4b5fd; min-width: 28px; text-align: center;
        }

        .gen-btn {
          width: 100%; padding: 16px;
          border: none; border-radius: 14px;
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 700;
          cursor: pointer;
          background: linear-gradient(135deg, #7c3aed, #0ea5e9);
          color: #fff;
          margin-top: 8px;
          position: relative; overflow: hidden;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          box-shadow: 0 6px 30px rgba(124,58,237,0.35);
          letter-spacing: 0.5px;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .gen-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 40px rgba(124,58,237,0.5); }
        .gen-btn:active:not(:disabled) { transform: translateY(0); }
        .gen-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .gen-btn::after {
          content: ''; position: absolute;
          inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          transform: translateX(-100%);
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer { to { transform: translateX(100%); } }

        /* RESULTS */
        .result-section { margin-top: 36px; }
        .result-label {
          font-family: 'DM Mono', monospace;
          font-size: 11px; letter-spacing: 2px;
          color: rgba(103,232,249,0.6);
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        /* IMAGE CARD */
        .image-card {
          border-radius: 16px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          position: relative;
          animation: fadeSlideUp 0.5s ease forwards;
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .image-canvas {
          width: 100%; height: 360px;
          position: relative; overflow: hidden;
        }
        .img-bg {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          flex-direction: column;
        }
        .img-gradient-1 {
          position: absolute; inset: 0;
          animation: gradShift 6s ease infinite alternate;
        }
        @keyframes gradShift {
          0% { filter: hue-rotate(0deg) brightness(0.9); }
          100% { filter: hue-rotate(30deg) brightness(1.1); }
        }
        .img-noise {
          position: absolute; inset: 0;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: cover;
        }
        .img-scanlines {
          position: absolute; inset: 0;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);
          pointer-events: none;
        }
        .img-center-content {
          position: relative; z-index: 2;
          text-align: center; padding: 24px;
        }
        .img-icon { font-size: 52px; margin-bottom: 16px; display: block; filter: drop-shadow(0 0 20px rgba(255,255,255,0.3)); }
        .img-title { font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 8px; text-shadow: 0 2px 20px rgba(0,0,0,0.6); }
        .img-mood { font-family: 'DM Mono', monospace; font-size: 11px; color: rgba(255,255,255,0.5); letter-spacing: 2px; text-transform: uppercase; }

        .img-desc-box {
          padding: 18px 22px;
          background: rgba(0,0,0,0.4);
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .img-desc-text { font-size: 13px; color: rgba(200,190,255,0.7); line-height: 1.7; }
        .img-desc-num { font-family: 'DM Mono', monospace; font-size: 10px; color: rgba(167,139,250,0.5); margin-bottom: 4px; letter-spacing: 1px; }

        .img-dots { display: flex; gap: 6px; justify-content: center; margin-top: 12px; }
        .img-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.15); transition: all 0.2s; cursor: pointer; }
        .img-dot.active { background: #a78bfa; transform: scale(1.3); }

        /* PALETTE */
        .palette-row { display: flex; gap: 6px; margin-top: 14px; align-items: center; }
        .palette-swatch { width: 22px; height: 22px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); }
        .palette-label { font-family: 'DM Mono', monospace; font-size: 10px; color: rgba(160,140,255,0.4); letter-spacing: 1px; }

        /* VIDEO */
        .video-progress-wrap { margin: 20px 0; }
        .vp-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .vp-label { font-family: 'DM Mono', monospace; font-size: 11px; color: rgba(103,232,249,0.6); letter-spacing: 2px; }
        .vp-pct { font-family: 'DM Mono', monospace; font-size: 13px; color: #67e8f9; font-weight: 500; }
        .vp-bar-bg { height: 5px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
        .vp-bar-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #7c3aed, #0ea5e9); transition: width 0.1s ease; }

        .frames-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-top: 16px; }
        .frame-card {
          border-radius: 10px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          aspect-ratio: 9/16;
          position: relative;
          animation: fadeSlideUp 0.4s ease forwards;
        }
        .frame-bg { position: absolute; inset: 0; }
        .frame-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; padding: 8px; }
        .frame-num { font-family: 'DM Mono', monospace; font-size: 9px; color: rgba(255,255,255,0.5); background: rgba(0,0,0,0.4); border-radius: 4px; padding: 2px 5px; width: fit-content; }
        .frame-desc { font-size: 9px; color: rgba(255,255,255,0.75); line-height: 1.4; text-shadow: 0 1px 4px rgba(0,0,0,0.8); background: linear-gradient(transparent, rgba(0,0,0,0.6)); padding: 4px; margin: -8px; padding: 8px; }

        .video-ready-card {
          border-radius: 16px; overflow: hidden;
          border: 1px solid rgba(103,232,249,0.2);
          background: rgba(0,0,0,0.4);
          padding: 28px;
          text-align: center;
          margin-top: 20px;
          animation: fadeSlideUp 0.5s ease forwards;
        }
        .video-ready-icon { font-size: 48px; margin-bottom: 12px; }
        .video-ready-title { font-size: 18px; font-weight: 800; color: #67e8f9; margin-bottom: 6px; }
        .video-ready-sub { font-size: 13px; color: rgba(160,140,255,0.6); }

        .download-btn {
          display: inline-flex; align-items: center; gap: 8px;
          margin-top: 18px; padding: 11px 24px;
          border-radius: 10px;
          background: rgba(103,232,249,0.1);
          border: 1px solid rgba(103,232,249,0.3);
          color: #67e8f9;
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .download-btn:hover { background: rgba(103,232,249,0.18); box-shadow: 0 0 20px rgba(103,232,249,0.15); }

        /* LOADING */
        .spinner { display: inline-block; width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.25); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .divider { height: 1px; background: rgba(255,255,255,0.05); margin: 28px 0; }

        @media (max-width: 600px) {
          .style-grid { grid-template-columns: repeat(2, 1fr); }
          .frames-grid { grid-template-columns: repeat(3, 1fr); }
          .options-row { flex-direction: column; }
          header { flex-direction: column; gap: 12px; }
        }
      `}</style>

      <div className="app">
        <div className="grid-bg" />
        <div className="glow-orb orb1" />
        <div className="glow-orb orb2" />
        <div className="glow-orb orb3" />
        {particles.map((p, i) => <Particle key={i} style={p} />)}

        <div className="container">
          <header>
            <div className="logo">
              <div className="logo-icon">🎞️</div>
              <div>
                <div className="logo-name">GenClip</div>
                <div className="logo-tag">AI Studio</div>
              </div>
            </div>
            <div className="header-badge">✦ POWERED BY CLAUDE</div>
          </header>

          <div className="hero">
            <div className="hero-eyebrow">✦ Génération Multimédia IA</div>
            <h1 className="hero-title">
              Crée. Génère.<br /><span>Imagine tout.</span>
            </h1>
            <p className="hero-sub">
              Transforme tes idées en images époustouflantes et en vidéos cinématiques grâce à l'intelligence artificielle.
            </p>
          </div>

          {/* TABS */}
          <div className="tabs">
            <button className={`tab-btn ${activeTab === "image" ? "active" : ""}`} onClick={() => setActiveTab("image")}>
              🖼️ Générer une Image
            </button>
            <button className={`tab-btn ${activeTab === "video" ? "active" : ""}`} onClick={() => setActiveTab("video")}>
              🎬 Créer une Vidéo
            </button>
          </div>

          {/* IMAGE TAB */}
          {activeTab === "image" && (
            <div className="panel">
              <label className="field-label">✦ Décris ton image</label>
              <textarea
                rows={4}
                placeholder="Ex: Un dragon lumineux survolant une cité futuriste au coucher du soleil, reflets néon sur l'eau..."
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
              />

              <div className="options-row">
                <div className="option-group">
                  <label className="field-label">Style visuel</label>
                  <div className="style-grid">
                    {STYLE_PRESETS.map((s) => (
                      <div
                        key={s.id}
                        className={`style-chip ${selectedStyle === s.id ? "selected" : ""}`}
                        onClick={() => setSelectedStyle(s.id)}
                      >
                        {s.emoji} {s.label}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="option-group">
                  <label className="field-label">Nombre d'images</label>
                  <div className="count-row">
                    <button className="count-btn" onClick={() => setImageCount(Math.max(1, imageCount - 1))}>−</button>
                    <span className="count-val">{imageCount}</span>
                    <button className="count-btn" onClick={() => setImageCount(Math.min(4, imageCount + 1))}>+</button>
                  </div>
                </div>
              </div>

              <button className="gen-btn" onClick={handleGenerateImage} disabled={generatingImage || !imagePrompt.trim()}>
                {generatingImage ? <><div className="spinner" /> Génération en cours…</> : <>✦ Générer les Images</>}
              </button>

              {generatedImages.length > 0 && currentImage && (
                <div className="result-section">
                  <div className="result-label">✦ Résultat — {generatedImages.length} image{generatedImages.length > 1 ? "s" : ""} générée{generatedImages.length > 1 ? "s" : ""}</div>
                  <div className="image-card">
                    <div className="image-canvas">
                      <div className="img-bg">
                        <div className="img-gradient-1" style={{
                          background: `radial-gradient(ellipse at 30% 40%, ${currentImage.palette[0]}55, transparent 60%), radial-gradient(ellipse at 70% 60%, ${currentImage.palette[1]}44, transparent 60%), radial-gradient(ellipse at 50% 80%, ${currentImage.palette[2]}33, transparent 60%), linear-gradient(135deg, #0a0414, #050818)`
                        }} />
                        <div className="img-noise" />
                        <div className="img-scanlines" />
                      </div>
                      <div className="img-center-content">
                        <span className="img-icon">
                          {selectedStyle === "cinematic" ? "🎬" : selectedStyle === "anime" ? "✨" : selectedStyle === "realistic" ? "📷" : selectedStyle === "abstract" ? "🌀" : selectedStyle === "neon" ? "💜" : "🎨"}
                        </span>
                        <div className="img-title">{currentImage.title}</div>
                        <div className="img-mood">{currentImage.mood}</div>
                      </div>
                    </div>
                    <div className="img-desc-box">
                      <div className="img-desc-num">IMAGE {currentImageIndex + 1}/{generatedImages.length}</div>
                      <div className="img-desc-text">{currentImage.description}</div>
                      <div className="palette-row">
                        <span className="palette-label">PALETTE →</span>
                        {currentImage.palette.map((c, i) => <div key={i} className="palette-swatch" style={{ background: c }} />)}
                      </div>
                    </div>
                  </div>
                  {generatedImages.length > 1 && (
                    <div className="img-dots">
                      {generatedImages.map((_, i) => (
                        <div key={i} className={`img-dot ${i === currentImageIndex ? "active" : ""}`} onClick={() => setCurrentImageIndex(i)} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* VIDEO TAB */}
          {activeTab === "video" && (
            <div className="panel">
              <label className="field-label">✦ Décris ta vidéo</label>
              <textarea
                rows={4}
                placeholder="Ex: Un voyage à travers une galaxie spirale, passant par des nébuleuses colorées, atterrissant sur une planète cristalline..."
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
              />

              <div className="options-row">
                <div className="option-group">
                  <label className="field-label">Durée</label>
                  <select value={selectedDuration} onChange={(e) => setSelectedDuration(e.target.value)}>
                    {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="option-group">
                  <label className="field-label">Transition</label>
                  <select value={selectedTransition} onChange={(e) => setSelectedTransition(e.target.value)}>
                    {TRANSITIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <button className="gen-btn" onClick={handleGenerateVideo} disabled={generatingVideo || !videoPrompt.trim()}>
                {generatingVideo ? <><div className="spinner" /> Création de la vidéo…</> : <>✦ Créer la Vidéo</>}
              </button>

              {generatingVideo && (
                <div className="video-progress-wrap">
                  <div className="vp-header">
                    <span className="vp-label">✦ RENDU EN COURS</span>
                    <span className="vp-pct">{videoProgress}%</span>
                  </div>
                  <div className="vp-bar-bg"><div className="vp-bar-fill" style={{ width: `${videoProgress}%` }} /></div>
                </div>
              )}

              {videoFrames.length > 0 && (
                <div className="result-section">
                  <div className="result-label">✦ Séquence vidéo — {videoFrames.length} frames</div>
                  <div className="frames-grid">
                    {videoFrames.map((frame, i) => (
                      <div key={frame.id} className="frame-card" style={{ animationDelay: `${i * 0.07}s` }}>
                        <div className="frame-bg" style={{
                          background: `radial-gradient(ellipse at ${30 + i * 12}% 50%, ${frame.palette[0]}66, transparent 60%), radial-gradient(ellipse at ${70 - i * 8}% 70%, ${frame.palette[1]}44, transparent 60%), linear-gradient(160deg, #050010, #000814)`
                        }} />
                        <div className="frame-overlay">
                          <span className="frame-num">F{String(i + 1).padStart(2, "0")}</span>
                          <div className="frame-desc">{frame.description.substring(0, 60)}…</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {videoReady && (
                    <div className="video-ready-card">
                      <div className="video-ready-icon">🎞️</div>
                      <div className="video-ready-title">Vidéo Générée avec Succès</div>
                      <div className="video-ready-sub">
                        {selectedDuration} · {selectedTransition} · {videoFrames.length} frames composées
                      </div>
                      <button className="download-btn">
                        ⬇ Télécharger la Vidéo
                      </button>
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
