"use client";
import { useEffect, useState, use as usePromise } from "react";
// Utility to check if a string is a direct image URL
function isDirectImageUrl(url: string) {
  return /^https?:\/\/.+\.(png|jpe?g|gif|svg|webp|bmp|ico)(\?.*)?$/i.test(url) || url.startsWith('data:image/');
}

// Utility to get proxied image URL for any image
function getProxiedImageUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('data:image/')) return url;
  // Always proxy to avoid CORS/hotlink issues
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}

// Utility to check if a string is a URL
function isUrl(str: string) {
  try { new URL(str); return true; } catch { return false; }
}

function B() {
  const env = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin.replace(/\/$/, "");
  return "";
}

export default function EmbedPage(props: { params: Promise<{ botId: string }> }) {
  const params = usePromise(props.params);
  const { botId } = params;
  const [org, setOrg] = useState<string>("");
  const [widget, setWidget] = useState<string>("bubble");
  const [tpl, setTpl] = useState<string>("bubble-blue");
  const [snippet, setSnippet] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [pubKey, setPubKey] = useState<string | null>(null);
  const [rotatedAt, setRotatedAt] = useState<string | null>(null);
  const [includeKey, setIncludeKey] = useState<boolean>(true);
  const [botName, setBotName] = useState<string>("Assistant");
  const [icon, setIcon] = useState<string>("💬");
  // For preview: resolved image URL if icon is a non-direct link
  const [resolvedIcon, setResolvedIcon] = useState<string>("");

  // Effect: If icon is a non-direct link, try to fetch and extract an image, always proxy resolved images
  useEffect(() => {
    if (!icon || isDirectImageUrl(icon) || !isUrl(icon)) {
      setResolvedIcon("");
      return;
    }
    let cancelled = false;
    setResolvedIcon("");
    fetch(icon)
      .then(r => r.text())
      .then(html => {
        if (cancelled) return;
        // Try Open Graph image
        const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"'>]+)["']/i);
        if (og && og[1]) {
          setResolvedIcon(getProxiedImageUrl(og[1]));
          return;
        }
        // Try first <img>
        const img = html.match(/<img[^>]+src=["']([^"'>]+)["']/i);
        if (img && img[1]) {
          // Resolve relative URLs
          let src = img[1];
          if (!/^https?:\/\//.test(src)) {
            try {
              const u = new URL(src, icon);
              src = u.href;
            } catch {}
          }
          setResolvedIcon(getProxiedImageUrl(src));
          return;
        }
        setResolvedIcon("");
      })
      .catch(() => setResolvedIcon(""));
    return () => { cancelled = true; };
  }, [icon]);
  // Greeting managed on backend config page; fetched for preview
  const [greeting, setGreeting] = useState<string>("");
  const BRAND_TEXT = "CodeWeft";
  const BRAND_LINK = "https://codeweft.in/";
  
  // Color and theme controls
  const [accent, setAccent] = useState<string>("#2563eb");
  const [buttonColor, setButtonColor] = useState<string>("#2563eb");
  const [textColor, setTextColor] = useState<string>("#0f1724");
  const [cardColor, setCardColor] = useState<string>("#ffffff");
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [radius, setRadius] = useState<number>(16);
  const [theme, setTheme] = useState<"light"|"dark">("light");
  const [position, setPosition] = useState<"right"|"left">("right");
  const [linkAccentButton, setLinkAccentButton] = useState<boolean>(true);
  const [transparentBubble, setTransparentBubble] = useState<boolean>(false);
  const [launcherSize, setLauncherSize] = useState<number>(56);
  const [iconScale, setIconScale] = useState<number>(60);
  const [bubbleMe, setBubbleMe] = useState<string>("linear-gradient(135deg, #2563eb, #1e40af)");
  const [bubbleBot, setBubbleBot] = useState<string>("#ffffff");

  // --- Color utilities & contrast scoring ---
  function hexToRgb(h: string){
    const m = h.replace(/^#/,'');
    if(m.length===3){return {
      r: parseInt(m[0]+m[0],16),
      g: parseInt(m[1]+m[1],16),
      b: parseInt(m[2]+m[2],16)
    };}
    if(m.length!==6) return {r:0,g:0,b:0};
    return {r:parseInt(m.slice(0,2),16),g:parseInt(m.slice(2,4),16),b:parseInt(m.slice(4,6),16)};
  }
  function luminance(h: string){
    const {r,g,b}=hexToRgb(h);
    const a=[r,g,b].map(v=>{
      const c=v/255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4);
    });
    return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];
  }
  function contrastRatio(fg: string, bg: string){
    const L1=luminance(fg)+0.05;const L2=luminance(bg)+0.05;return (Math.max(L1,L2)/Math.min(L1,L2));
  }
  function badge(r: number, compact: boolean){
    if(compact){
      if(r>=7) return {label:r.toFixed(1), cls:'bg-green-600'};
      if(r>=4.5) return {label:r.toFixed(1), cls:'bg-green-500'};
      if(r>=3) return {label:r.toFixed(1), cls:'bg-amber-500'};
      return {label:r.toFixed(1), cls:'bg-red-500'};
    }
    if(r>=7) return {label:`AAA ${r.toFixed(1)}`, cls:'bg-green-600'};
    if(r>=4.5) return {label:`AA ${r.toFixed(1)}`, cls:'bg-green-500'};
    if(r>=3) return {label:`Low ${r.toFixed(1)}`, cls:'bg-amber-500'};
    return {label:`Poor ${r.toFixed(1)}`, cls:'bg-red-500'};
  }

  // Preset accessible palettes
  const presets: Array<{name:string, values:{accent:string, button?:string, text:string, card:string, bg:string}}>= [
    {name:'Ocean Light', values:{accent:'#2563eb', text:'#0f172a', card:'#ffffff', bg:'#f1f5f9'}},
    {name:'Emerald', values:{accent:'#059669', text:'#062c22', card:'#ffffff', bg:'#f0fdf4'}},
    {name:'Rose', values:{accent:'#e11d48', text:'#3b0a14', card:'#ffffff', bg:'#fff1f2'}},
    {name:'Slate Dark', values:{accent:'#3b82f6', text:'#f1f5f9', card:'#162131', bg:'#0b111a'}},
    {name:'Violet Dark', values:{accent:'#8b5cf6', text:'#f1f5f9', card:'#1e1b2e', bg:'#12111c'}},
  ];

  function applyPreset(p:{accent:string, button?:string, text:string, card:string, bg:string}){
    setAccent(p.accent);
    if(!linkAccentButton && p.button){ setButtonColor(p.button); } else if(linkAccentButton) { setButtonColor(p.accent); }
    setTextColor(p.text); setCardColor(p.card); setBgColor(p.bg);
    // infer theme
    const darkLum = luminance(p.bg); if(darkLum < 0.25) setTheme('dark'); else setTheme('light');
  }

  // Auto-fix for contrast issues
  function tweakColor(hex:string, targetBg:string, minRatio:number):string{
    let h = hex;
    let tries = 0;
    function clamp(v:number){ return Math.min(255, Math.max(0,v)); }
    while(contrastRatio(h, targetBg) < minRatio && tries < 24){
      const {r,g,b}=hexToRgb(h); const bgLum = luminance(targetBg); const fgLum = luminance(h);
      const factor = bgLum > fgLum ? 0.9 : 1.1; // move away from bg
      const nr = clamp(Math.round(r*factor)); const ng = clamp(Math.round(g*factor)); const nb = clamp(Math.round(b*factor));
      h = '#'+[nr,ng,nb].map(x=>x.toString(16).padStart(2,'0')).join('');
      tries++;
    }
    return h;
  }

  function autoFix(){
    const newText = contrastRatio(textColor, bgColor) < 4.5 ? tweakColor(textColor, bgColor, 4.5) : textColor;
    const newAccent = contrastRatio(accent, bgColor) < 4.5 ? tweakColor(accent, bgColor, 4.5) : accent;
    const newButton = contrastRatio(buttonColor, bgColor) < 4.5 ? tweakColor(buttonColor, bgColor, 4.5) : buttonColor;
    setTextColor(newText); setAccent(newAccent); if(linkAccentButton){ setButtonColor(newAccent);} else { setButtonColor(newButton);} }

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [compactContrast, setCompactContrast] = useState<boolean>(true);

  const contrastTextOnBg = contrastRatio(textColor, bgColor);
  const contrastTextOnCard = contrastRatio(textColor, cardColor);
  const contrastAccentOnBg = contrastRatio(accent, bgColor);
  const contrastAccentOnCard = contrastRatio(accent, cardColor);
  const contrastButtonOnBg = contrastRatio(buttonColor, bgColor);

  // Auto link accent -> button color if enabled
  useEffect(()=>{ if(linkAccentButton) setButtonColor(accent); }, [accent, linkAccentButton]);

  // Suggest safer colors in dark mode if poor contrast
  function suggestForDark(hex: string){
    if(theme!=='dark') return null;
    const lum=luminance(hex);
    if(lum>0.6) return '#1e40af'; // too light -> deeper blue
    if(lum<0.08) return '#3b82f6'; // too dark -> mid blue
    return null;
  }
  const accentSuggestion = suggestForDark(accent);
  const textSuggestion = theme==='dark' && (contrastTextOnBg<4.5? '#f1f5f9': null);

  // Load org from localStorage on client side only
  useEffect(() => {
    const orgId = localStorage.getItem("orgId") || process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || "";
    setOrg(orgId);
  }, []);

  useEffect(() => {
    if (!org) return;
    (async () => {
      try {
        const headers: Record<string, string> = {};
        if (typeof window !== "undefined") { 
          const t = localStorage.getItem("token"); 
          if (t) headers["Authorization"] = `Bearer ${t}`; 
        }
        const r = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/embed?org_id=${encodeURIComponent(org)}&widget=${encodeURIComponent(widget)}`, { headers });
        if (!r.ok) throw new Error(`http${r.status}`);
        const d = await r.json();
        const base = B().replace(/\/$/, "");
        const sn: string = String(d.snippet || "");
        const fixed = sn
          .replace(/apiBase\s*:\s*'[^']*'/, `apiBase:'${base}'`)
          .replace(/src=("|')https?:\/\/[^"']+\/api\/widget\.js\1/g, `src='${base}/api/widget.js'`)
          .replace(/U=\'https?:\\\/\\\/[^']+\\\/api\\\/chat\\\/stream\\\/${botId}\'/, `U='${base}/api/chat/stream/${botId}'`);
        setSnippet(fixed);
      } catch {
        // Fallback for when API is not available
        setSnippet(`<script>window.chatbotConfig={botId:'${botId}',orgId:'${org}',apiBase:'${B().replace(/\/$/, "")}',botKey:''};</script><script src='${B().replace(/\/$/, "")}/api/widget.js' async></script>`);
      }

      // Fetch public key
      try {
        const headers2: Record<string, string> = {};
        if (typeof window !== "undefined") { 
          const t = localStorage.getItem("token"); 
          if (t) headers2["Authorization"] = `Bearer ${t}`; 
        }
        const rk = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/key?org_id=${encodeURIComponent(org)}`, { headers: headers2 });
        if (rk.ok) {
          const kj = await rk.json();
          setPubKey(kj.public_api_key || null);
          setRotatedAt(kj.rotated_at || null);
        }
      } catch {}
    })();
  }, [org, botId, widget]);

  // Fetch backend-configured greeting (welcome_message) for preview
  useEffect(() => {
    if (!org) return;
    (async () => {
      try {
        const headers: Record<string, string> = {};
        if (typeof window !== "undefined") {
          const t = localStorage.getItem("token");
          if (t) headers["Authorization"] = `Bearer ${t}`;
        }
        const r = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/config?org_id=${encodeURIComponent(org)}`, { headers });
        if (r.ok) {
          const d = await r.json();
          setGreeting(d.welcome_message || "");
        }
      } catch {}
    })();
  }, [org, botId]);

  // Copy to clipboard function
  async function copy(text: string) {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  // Generate code for different templates
  function generateCode(templateId: string): string {
    const base = B().replace(/\/$/, "");
    const k = includeKey && pubKey ? pubKey : "";
    
    if (templateId === "bubble-blue" || templateId === "bubble-dark") {
      const isDark = templateId === "bubble-dark";
      const btnBg = transparentBubble ? "transparent" : buttonColor;
      const btnShadow = transparentBubble ? "none" : "0 4px 12px rgba(0,0,0,0.15)";
      
      return [
        `<!-- ${isDark ? "Dark bubble" : "Bubble"} chat widget (self-contained) -->`,
        `<div id="chatbot-bubble"></div>`,
        `<style>`,
        `#chatbot-bubble{position:fixed;bottom:24px;${position}:24px;z-index:9999;font-family:system-ui,sans-serif}`,
        `#chatbot-btn{width:${launcherSize}px;height:${launcherSize}px;border-radius:${radius}px;background:${btnBg};color:#fff;border:none;font-size:24px;cursor:pointer;box-shadow:${btnShadow};transition:transform 0.2s;display:flex;align-items:center;justify-content:center;padding:0}`,
        `#chatbot-btn:hover{transform:scale(1.05)}`,
        `#chatbot-panel{display:none;position:absolute;bottom:70px;${position}:0;width:350px;height:500px;background:${cardColor};border:1px solid ${isDark ? '#374151' : '#e5e7eb'};border-radius:${radius}px;box-shadow:0 8px 24px rgba(0,0,0,0.2);flex-direction:column;overflow:hidden}`,
        `#chatbot-panel.open{display:flex}`,
        `#chatbot-header{display:flex;align-items:center;justify-content:space-between;padding:12px;background:${buttonColor};color:#fff;border-bottom:1px solid ${isDark ? '#374151' : '#e5e7eb'}}`,
        `#chatbot-close{background:transparent;border:none;color:#fff;font-size:24px;cursor:pointer;padding:0;width:32px;height:32px;border-radius:50%;transition:background 0.2s}`,
        `#chatbot-close:hover{background:rgba(255,255,255,0.2)}`,
        `#chatbot-messages{flex:1;padding:12px;overflow-y:auto;background:${bgColor}}`,
        `#chatbot-messages::-webkit-scrollbar{width:6px}`,
        `#chatbot-messages::-webkit-scrollbar-thumb{background:${isDark ? '#4b5563' : '#d1d5db'};border-radius:3px}`,
        `.chat-msg{margin-bottom:8px;padding:10px 12px;border-radius:${Math.max(8, radius-4)}px;max-width:80%;word-wrap:break-word;font-size:14px;line-height:1.4}`,
        `.chat-msg.user{background:${bubbleMe};color:#fff;margin-left:auto;border-bottom-right-radius:4px}`,
        `.chat-msg.bot{background:${bubbleBot};color:${textColor};margin-right:auto;border-bottom-left-radius:4px;border:1px solid ${isDark ? '#374151' : '#e5e7eb'}}`,
        `.typing{display:flex;gap:4px;padding:10px}.typing div{width:8px;height:8px;background:${textColor};border-radius:50%;animation:bounce 1.4s infinite ease-in-out}`,
        `.typing div:nth-child(1){animation-delay:-0.32s}.typing div:nth-child(2){animation-delay:-0.16s}`,
        `@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}`,
        `#chatbot-input-area{display:flex;gap:8px;padding:12px;border-top:1px solid ${isDark ? '#374151' : '#e5e7eb'};background:${cardColor}}`,
        `#chatbot-input{flex:1;padding:10px;border:1px solid ${isDark ? '#374151' : '#e5e7eb'};border-radius:${Math.max(6, radius-6)}px;background:${bgColor};color:${textColor};font-size:14px;outline:none}`,
        `#chatbot-send{padding:10px 16px;background:${buttonColor};color:#fff;border:none;border-radius:${Math.max(6, radius-6)}px;font-weight:600;cursor:pointer;font-size:14px}`,
        `#chatbot-send:disabled{opacity:0.5;cursor:not-allowed}`,
        `#chatbot-send:not(:disabled):hover{opacity:0.9}`,
        `</style>`,
        `<script>`,
        `(function(){`,
        `var cfg={botId:'${botId}',orgId:'${org}',apiBase:'${base}',botKey:'${k}',botName:'${botName.replace(/'/g, "\\'")}',icon:'${icon.replace(/'/g, "\\'")}',greeting:'${greeting.replace(/'/g, "\\'")}'};`,
        `var root=document.getElementById('chatbot-bubble');`,
        `var btn=document.createElement('button');btn.id='chatbot-btn';`,
        `if(/^https?:\\/\\//.test(cfg.icon)){btn.innerHTML='<img src="'+cfg.icon+'" style="${transparentBubble ? `width:100%;height:100%;object-fit:cover;border-radius:${radius}px` : `width:${iconScale}%;height:${iconScale}%;object-fit:cover;border-radius:50%`}">';}else{btn.innerHTML='<span style="font-size:${iconScale*0.4}px">'+cfg.icon+'</span>';}`,
        `var panel=document.createElement('div');panel.id='chatbot-panel';`,
        `var header=document.createElement('div');header.id='chatbot-header';`,
        `header.innerHTML='<div style="display:flex;align-items:center;gap:8px"><div style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center">'+cfg.icon+'</div><span style="font-weight:600">'+cfg.botName+'</span></div><button id="chatbot-close">×</button>';`,
        `var msgs=document.createElement('div');msgs.id='chatbot-messages';`,
        `msgs.innerHTML='<div class="chat-msg bot" style="background:${bubbleBot};color:${textColor}">'+(cfg.greeting||'')+'</div>';`,
        `var inputArea=document.createElement('div');inputArea.id='chatbot-input-area';`,
        `inputArea.innerHTML='<input id="chatbot-input" type="text" placeholder="Ask a question..."><button id="chatbot-send">Send</button>';`,
        `panel.appendChild(header);panel.appendChild(msgs);panel.appendChild(inputArea);`,
        `root.appendChild(btn);root.appendChild(panel);`,
        `var input=document.getElementById('chatbot-input');`,
        `var sendBtn=document.getElementById('chatbot-send');`,
        `var isTyping=false;`,
        `btn.onclick=function(){panel.classList.toggle('open')};`,
        `document.getElementById('chatbot-close').onclick=function(){panel.classList.remove('open')};`,
        `function addMsg(txt,isUser){var m=document.createElement('div');m.className='chat-msg '+(isUser?'user':'bot');m.textContent=txt;msgs.appendChild(m);msgs.scrollTop=msgs.scrollHeight;return m}`,
        `function showTyping(){var t=document.createElement('div');t.className='chat-msg bot typing';t.innerHTML='<div></div><div></div><div></div>';msgs.appendChild(t);msgs.scrollTop=msgs.scrollHeight;return t}`,
        `function send(){var q=input.value.trim();if(!q||isTyping)return;input.value='';addMsg(q,true);isTyping=true;sendBtn.disabled=true;var typing=showTyping();`,
        `var h={'Content-Type':'application/json'};if(cfg.botKey)h['X-Bot-Key']=cfg.botKey;`,
        `fetch(cfg.apiBase+'/api/chat/stream/'+cfg.botId,{method:'POST',headers:h,body:JSON.stringify({message:q,org_id:cfg.orgId})})`,
        `.then(function(r){if(!r.ok)throw new Error('Failed');var reader=r.body.getReader();var decoder=new TextDecoder();var botMsg='';`,
        `typing.remove();var msgEl=addMsg('',false);`,
        `function read(){reader.read().then(function(x){if(x.done){isTyping=false;sendBtn.disabled=false;return}`,
        `var chunk=decoder.decode(x.value);chunk.split('\\n\\n').forEach(function(line){if(line.startsWith('data: ')){botMsg+=line.slice(6);msgEl.textContent=botMsg}});read()})}read()})`,
        `.catch(function(){typing.remove();addMsg('Sorry, something went wrong. Please try again.',false);isTyping=false;sendBtn.disabled=false})}`,
        `sendBtn.onclick=send;input.onkeydown=function(e){if(e.key==='Enter')send()}`,
        `})();`,
        `</script>`
      ].join("\n");
    }

    if (templateId === "iframe-minimal") {
      return [
        "<!-- Minimal iframe embed -->",
        `<iframe srcdoc="<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><style>body{font-family:sans-serif;font-size:14px;margin:0;background:${bgColor}}.wrap{padding:10px}.msgs{padding:10px;height:36vh;overflow:auto;border:1px solid #e5e7eb;border-radius:${radius}px;background:#f9fafb;margin-bottom:8px}.m{max-width:80%;margin-bottom:8px;padding:8px 10px;border-radius:${Math.max(6, radius-4)}px;white-space:pre-wrap}.m.u{background:${bubbleMe};color:#fff;margin-left:auto;border-bottom-right-radius:4px}.m.b{background:${bubbleBot};color:${textColor};margin-right:auto;border-bottom-left-radius:4px}.inp{display:flex;gap:8px}.inp input{flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:${Math.max(6, radius-4)}px}.inp button{padding:10px 14px;border:none;border-radius:${Math.max(6, radius-4)}px;background:${buttonColor};color:#fff;font-weight:600;cursor:pointer}</style></head><body><div class='wrap'><div class='msgs'><div class='m b'>${greeting.replace(/'/g,"&#39;")}</div></div><div class='inp'><input type='text' placeholder='Ask'><button>Send</button></div></div><script>(function(){var O='${org}',K='${k}',U='${base}/api/chat/stream/${botId}';function s(m,cb){var h={'Content-Type':'application/json'};if(K){h['X-Bot-Key']=K;}var b=JSON.stringify({message:m,org_id:O});fetch(U,{method:'POST',headers:h,body:b}).then(function(r){var rd=r.body.getReader();var d=new TextDecoder();function n(){rd.read().then(function(x){if(x.done){cb(null,true);return;}var t=d.decode(x.value);t.split(\"\\n\\n\").forEach(function(l){if(l.indexOf('data: ')==0){cb(l.slice(6),false);}});n();});}n();});}var msgs=document.querySelector('.msgs');var i=document.querySelector('.inp input');var go=document.querySelector('.inp button');function addU(m){var e=document.createElement('div');e.className='m u';e.textContent=m;msgs.appendChild(e);msgs.scrollTop=msgs.scrollHeight;}function addB(){var e=document.createElement('div');e.className='m b';msgs.appendChild(e);msgs.scrollTop=msgs.scrollHeight;return e;}function send(){var q=i.value;if(!q.trim()){return;}i.value='';addU(q);var bot=addB();s(q,function(tok,end){if(end){return;}bot.textContent+=tok;});}go.onclick=send;i.addEventListener('keydown',function(ev){if(ev.key==='Enter'){send();}})})();</script></body></html>" style="width:100%;min-height:280px;border:1px solid #e5e7eb;border-radius:${radius}px"></iframe>`
      ].join("\n");
    }

    if (templateId === "cdn-default") {
      const kcfg = includeKey && pubKey ? `,botKey:'${pubKey}'` : '';
      return [
        "<!-- Default CDN widget: paste near end of body -->",
        `<script>window.chatbotConfig={botId:'${botId}',orgId:'${org}',apiBase:'${base}',buttonColor:'${buttonColor}',accent:'${accent}',text:'${textColor}',card:'${cardColor}',bg:'${bgColor}',radius:${radius},bubbleMe:'${bubbleMe}',bubbleBot:'${bubbleBot}'${kcfg}${botName?`,botName:'${botName.replace(/'/g,"\\'")}'`:''}${icon?`,icon:'${icon.replace(/'/g,"\\'")}'`:''},launcherSize:${launcherSize},iconScale:${iconScale},transparentBubble:${transparentBubble}};</script>`,
        `<script src='${base}/api/widget.js' async></script>`
      ].join("\n");
    }

    if (templateId === "inline-card") {
      return [
        "<!-- Inline card widget -->",
        `<div id="bot-inline-card"></div>`,
        `<script>`,
        `(function(){`,
        `var O='${org}',K='${k}',U='${base}/api/chat/stream/${botId}',G='${greeting.replace(/'/g,"\\'")}';`,
        `function s(m,cb){var h={'Content-Type':'application/json'};if(K){h['X-Bot-Key']=K;}var b=JSON.stringify({message:m,org_id:O});fetch(U,{method:'POST',headers:h,body:b}).then(function(r){var rd=r.body.getReader();var d=new TextDecoder();function n(){rd.read().then(function(x){if(x.done){cb(null,true);return;}var t=d.decode(x.value);t.split('\\\\n\\\\n').forEach(function(l){if(l.indexOf('data: ')==0){cb(l.slice(6),false);}});n();});}n();});}`,
        `var c=document.getElementById('bot-inline-card');c.style.cssText='max-width:560px;margin:24px auto;border:1px solid #e5e7eb;border-radius:${radius}px;box-shadow:0 12px 28px rgba(0,0,0,0.08);overflow:hidden;background:#fff';`,
        `var h=document.createElement('div');h.style.cssText='display:flex;align-items:center;gap:8px;padding:12px;background:${buttonColor};color:#fff';h.innerHTML='<div style="width:24px;height:24px;border-radius:999px;background:#fff;color:${buttonColor};display:flex;align-items:center;justify-content:center;font-size:12px">${icon}</div><div>${botName.replace(/'/g,"\\'")}</div>';`,
        `var msgs=document.createElement('div');msgs.style.cssText='padding:12px;height:40vh;overflow:auto;background:${bgColor}';`,
        `var inp=document.createElement('div');inp.style.cssText='display:flex;gap:8px;padding:12px;border-top:1px solid #e5e7eb;background:#fff';`,
        `var i=document.createElement('input');i.style.cssText='flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:${Math.max(6, radius-4)}px;font-size:14px';i.placeholder='Ask a question';`,
        `var go=document.createElement('button');go.style.cssText='padding:10px 14px;border:none;border-radius:${Math.max(6, radius-4)}px;background:${buttonColor};color:#fff;font-weight:600;cursor:pointer';go.textContent='Send';`,
        `inp.appendChild(i);inp.appendChild(go);c.appendChild(h);c.appendChild(msgs);c.appendChild(inp);`,
        `if(G){var gm=document.createElement('div');gm.style.cssText='max-width:80%;margin-bottom:8px;padding:8px 10px;border-radius:${Math.max(6, radius-4)}px;font-size:14px;line-height:1.5;white-space:pre-wrap;background:${bubbleBot};color:${textColor};margin-right:auto;border-bottom-left-radius:4px';gm.textContent=G;msgs.appendChild(gm);}`,
        `function addU(m){var e=document.createElement('div');e.style.cssText='max-width:80%;margin-bottom:8px;padding:8px 10px;border-radius:${Math.max(6, radius-4)}px;font-size:14px;line-height:1.5;white-space:pre-wrap;background:${bubbleMe};color:#fff;margin-left:auto;border-bottom-right-radius:4px';e.textContent=m;msgs.appendChild(e);msgs.scrollTop=msgs.scrollHeight;}`,
        `function addB(){var e=document.createElement('div');e.style.cssText='max-width:80%;margin-bottom:8px;padding:8px 10px;border-radius:${Math.max(6, radius-4)}px;font-size:14px;line-height:1.5;white-space:pre-wrap;background:${bubbleBot};color:${textColor};margin-right:auto;border-bottom-left-radius:4px';msgs.appendChild(e);msgs.scrollTop=msgs.scrollHeight;return e;}`,
        `function send(){var q=i.value;if(!q.trim()){return;}i.value='';addU(q);var bot=addB();s(q,function(tok,end){if(end){return;}bot.textContent+=tok;});}`,
        `go.onclick=send;i.addEventListener('keydown',function(ev){if(ev.key==='Enter'){send();}});`,
        `})();`,
        `</script>`
      ].join("\n");
    }

    if (templateId === "fullscreen") {
      return [
        "<!-- Fullscreen chat widget -->",
        `<div id="bot-fullscreen"></div>`,
        `<script>`,
        `(function(){`,
        `var O='${org}',K='${k}',U='${base}/api/chat/stream/${botId}',G='${greeting.replace(/'/g,"\\'")}';`,
        `function s(m,cb){var h={'Content-Type':'application/json'};if(K){h['X-Bot-Key']=K;}var b=JSON.stringify({message:m,org_id:O});fetch(U,{method:'POST',headers:h,body:b}).then(function(r){var rd=r.body.getReader();var d=new TextDecoder();function n(){rd.read().then(function(x){if(x.done){cb(null,true);return;}var t=d.decode(x.value);t.split('\\\\n\\\\n').forEach(function(l){if(l.indexOf('data: ')==0){cb(l.slice(6),false);}});n();});}n();});}`,
        `var c=document.getElementById('bot-fullscreen');c.style.cssText='width:100%;height:100vh;display:flex;flex-direction:column;background:${bgColor}';`,
        `var h=document.createElement('div');h.style.cssText='display:flex;align-items:center;gap:8px;padding:16px;background:${buttonColor};color:#fff;box-shadow:0 2px 4px rgba(0,0,0,0.1)';h.innerHTML='<div style="width:32px;height:32px;border-radius:999px;background:#fff;color:${buttonColor};display:flex;align-items:center;justify-content:center;font-size:16px">${icon}</div><div style="font-size:18px;font-weight:600">${botName}</div>';`,
        `var msgs=document.createElement('div');msgs.style.cssText='flex:1;padding:16px;overflow:auto;background:${bgColor}';`,
        `var inp=document.createElement('div');inp.style.cssText='display:flex;gap:12px;padding:16px;border-top:1px solid #e5e7eb;background:#fff';`,
        `var i=document.createElement('input');i.style.cssText='flex:1;padding:12px;border:1px solid #e5e7eb;border-radius:${Math.max(8, radius-4)}px;font-size:16px';i.placeholder='Ask a question...';`,
        `var go=document.createElement('button');go.style.cssText='padding:12px 24px;border:none;border-radius:${Math.max(8, radius-4)}px;background:${buttonColor};color:#fff;font-weight:600;cursor:pointer;font-size:16px';go.textContent='Send';`,
        `inp.appendChild(i);inp.appendChild(go);c.appendChild(h);c.appendChild(msgs);c.appendChild(inp);`,
        `if(G){var gm=document.createElement('div');gm.style.cssText='max-width:70%;margin-bottom:12px;padding:12px 16px;border-radius:${radius}px;font-size:16px;line-height:1.5;white-space:pre-wrap;background:${bubbleBot};color:${textColor};margin-right:auto;border-bottom-left-radius:4px';gm.textContent=G;msgs.appendChild(gm);}`,
        `function addU(m){var e=document.createElement('div');e.style.cssText='max-width:70%;margin-bottom:12px;padding:12px 16px;border-radius:${radius}px;font-size:16px;line-height:1.5;white-space:pre-wrap;background:${bubbleMe};color:#fff;margin-left:auto;border-bottom-right-radius:4px';e.textContent=m;msgs.appendChild(e);msgs.scrollTop=msgs.scrollHeight;}`,
        `function addB(){var e=document.createElement('div');e.style.cssText='max-width:70%;margin-bottom:12px;padding:12px 16px;border-radius:${radius}px;font-size:16px;line-height:1.5;white-space:pre-wrap;background:${bubbleBot};color:${textColor};margin-right:auto;border-bottom-left-radius:4px';msgs.appendChild(e);msgs.scrollTop=msgs.scrollHeight;return e;}`,
        `function send(){var q=i.value;if(!q.trim()){return;}i.value='';addU(q);var bot=addB();s(q,function(tok,end){if(end){return;}bot.textContent+=tok;});}`,
        `go.onclick=send;i.addEventListener('keydown',function(ev){if(ev.key==='Enter'){send();}});`,
        `})();`,
        `</script>`
      ].join("\n");
    }

    return "";
  }

  // Native React preview component
  function ChatPreview({ template }: { template: string }) {
    const [messages, setMessages] = useState<Array<{type: 'user' | 'bot', text: string}>>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    
    const sendMessage = async (msg: string) => {
      if (!msg.trim() || isTyping) return;
      
      setMessages(prev => [...prev, { type: 'user', text: msg }]);
      setInput('');
      setIsTyping(true);
      
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (pubKey) headers['X-Bot-Key'] = pubKey;
        
        const response = await fetch(`${B()}/api/chat/stream/${botId}`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ message: msg, org_id: org })
        });
        
        if (!response.ok) throw new Error('Failed to send message');
        
        setMessages(prev => [...prev, { type: 'bot', text: '' }]);
        
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let botResponse = '';
        
        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const token = line.slice(6);
              botResponse += token;
              setMessages(prev => {
                const newMessages = [...prev];
                if (newMessages[newMessages.length - 1]?.type === 'bot') {
                  newMessages[newMessages.length - 1].text = botResponse;
                }
                return newMessages;
              });
            }
          }
        }
      } catch (error) {
        setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
      } finally {
        setIsTyping(false);
      }
    };
    
    if (!template) {
      return (
        <div className="w-full h-64 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500">
          Select a template to see preview
        </div>
      );
    }
    
    if (template === 'bubble-blue' || template === 'bubble-dark') {
      return (
        <div className="relative w-full h-[540px] bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
          {/* Chat Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`fixed bottom-6 right-6 ${transparentBubble ? '' : 'shadow-lg'} flex items-center justify-center text-2xl transition-transform hover:scale-105 overflow-hidden`}
            style={{ 
              width: `${launcherSize}px`,
              height: `${launcherSize}px`,
              backgroundColor: transparentBubble ? 'transparent' : buttonColor,
              color: '#fff',
              borderRadius: `${radius}px`,
              padding: 0
            }}
          >
            {icon && (isDirectImageUrl(icon) || resolvedIcon) ? (
              <img src={resolvedIcon || getProxiedImageUrl(icon)} alt="Bot" className={`object-cover ${transparentBubble ? '' : 'rounded-full'}`} style={{
                borderRadius: transparentBubble ? `${radius}px` : undefined,
                width: `${iconScale}%`,
                height: `${iconScale}%`
              }} />
            ) : (
              <span style={{ fontSize: `${iconScale * 0.4}px` }}>{icon || '💬'}</span>
            )}
          </button>
          
          {/* Chat Panel */}
          {isOpen && (
            <div 
              className="fixed bottom-20 right-6 w-80 h-96 shadow-2xl overflow-hidden transition-all"
              style={{
                backgroundColor: cardColor,
                border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                borderRadius: `${Math.max(8, radius)}px`
              }}
            >
              {/* Header */}
              <div 
                className="flex items-center justify-between p-3 border-b"
                style={{
                  backgroundColor: buttonColor,
                  borderBottomColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                  color: '#fff'
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-sm overflow-hidden" style={{ color: buttonColor }}>
                    {icon && (isDirectImageUrl(icon) || resolvedIcon) ? (
                      <img src={resolvedIcon || getProxiedImageUrl(icon)} alt="Bot" className="w-full h-full object-cover" />
                    ) : (
                      <span>{icon || '🤖'}</span>
                    )}
                  </div>
                  <span className="font-semibold">{botName}</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-lg leading-none hover:opacity-70"
                  style={{ color: '#fff' }}
                >
                  ×
                </button>
              </div>
              
              {/* Messages */}
              <div 
                className="flex-1 p-3 h-64 overflow-y-auto space-y-2"
                style={{ backgroundColor: bgColor }}
              >
                {messages.length === 0 && (
                  <div 
                    className="text-sm p-3 rounded-lg max-w-[80%]"
                    style={{
                      background: bubbleBot,
                      color: textColor,
                      borderRadius: `${Math.max(8, radius-4)}px`
                    }}
                  >
                    {greeting}
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`text-sm p-3 max-w-[80%] ${
                      msg.type === 'user' ? 'ml-auto' : 'mr-auto'
                    }`}
                    style={{
                      background: msg.type === 'user' ? bubbleMe : bubbleBot,
                      color: msg.type === 'user' ? '#fff' : textColor,
                      borderRadius: `${Math.max(8, radius-4)}px`
                    }}
                  >
                    {msg.text}
                  </div>
                ))}
                {isTyping && (
                  <div 
                    className="text-sm p-3 max-w-[80%] mr-auto flex items-center gap-1"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                      color: textColor,
                      borderRadius: `${Math.max(8, radius-4)}px`
                    }}
                  >
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input */}
              <div 
                className="p-3 border-t flex gap-2"
                style={{
                  backgroundColor: cardColor,
                  borderTopColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                  placeholder="Ask a question..."
                  className="flex-1 px-3 py-2 border text-sm"
                  style={{
                    backgroundColor: bgColor,
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    color: textColor,
                    borderRadius: `${Math.max(6, radius-6)}px`
                  }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className="px-4 py-2 text-sm font-semibold disabled:opacity-50"
                  style={{ 
                    backgroundColor: buttonColor,
                    color: '#fff',
                    borderRadius: `${Math.max(6, radius-6)}px`
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (template === 'iframe-minimal') {
      return (
        <div 
          className="w-full h-72 border p-3 space-y-3"
          style={{
            backgroundColor: bgColor,
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            borderRadius: `${radius}px`
          }}
        >
          {/* Messages Area */}
          <div 
            className="h-48 overflow-y-auto p-2 border space-y-2"
            style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              borderRadius: `${Math.max(6, radius-4)}px`
            }}
          >
            {messages.length === 0 && (
              <div
                className="text-sm p-2"
                style={{
                  background: bubbleBot,
                  color: textColor,
                  borderRadius: `${Math.max(6, radius-6)}px`
                }}
              >
                {greeting}
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`text-sm p-2 max-w-[80%] ${
                  msg.type === 'user' ? 'ml-auto' : 'mr-auto'
                }`}
                style={{
                  background: msg.type === 'user' ? bubbleMe : bubbleBot,
                  color: msg.type === 'user' ? '#fff' : textColor,
                  borderRadius: `${Math.max(6, radius-6)}px`
                }}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div 
                className="text-sm p-2 max-w-[80%] mr-auto flex items-center gap-1"
                style={{
                  background: bubbleBot,
                  color: textColor,
                  borderRadius: `${Math.max(6, radius-6)}px`
                }}
              >
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input Area */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask a question..."
              className="flex-1 px-3 py-2 border text-sm"
              style={{
                backgroundColor: cardColor,
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                color: textColor,
                borderRadius: `${Math.max(6, radius-6)}px`
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className="px-4 py-2 text-sm font-semibold disabled:opacity-50"
              style={{ 
                backgroundColor: buttonColor,
                color: '#fff',
                borderRadius: `${Math.max(6, radius-6)}px`
              }}
            >
              Send
            </button>
          </div>
        </div>
      );
    }

    if (template === 'inline-card') {
      return (
        <div 
          className="max-w-md mx-auto border shadow-lg overflow-hidden bg-white"
          style={{
            borderRadius: `${radius}px`,
            borderColor: '#e5e7eb'
          }}
        >
          {/* Header */}
          <div 
            className="flex items-center gap-2 p-3"
            style={{
              backgroundColor: buttonColor,
              color: '#fff'
            }}
          >
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-sm overflow-hidden" style={{ color: buttonColor }}>
              {icon && (isDirectImageUrl(icon) || resolvedIcon) ? (
                <img src={resolvedIcon || getProxiedImageUrl(icon)} alt="Bot" className="w-full h-full object-cover" />
              ) : (
                <span>{icon || '🤖'}</span>
              )}
            </div>
            <span className="font-semibold">{botName}</span>
          </div>
          
          {/* Messages */}
          <div 
            className="h-48 overflow-y-auto p-3 space-y-2"
            style={{ backgroundColor: bgColor }}
          >
            {messages.length === 0 && (
              <div 
                className="text-sm p-2"
                style={{ background: bubbleBot, color: textColor }}
              >
                {greeting}
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`text-sm p-2 max-w-[80%] ${
                  msg.type === 'user' ? 'ml-auto' : 'mr-auto'
                }`}
                style={{
                  background: msg.type === 'user' ? bubbleMe : bubbleBot,
                  color: msg.type === 'user' ? '#fff' : textColor,
                  borderRadius: `${Math.max(6, radius-4)}px`
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>
          
          {/* Input */}
          <div className="p-3 border-t flex gap-2" style={{ borderTopColor: '#e5e7eb' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask a question..."
              className="flex-1 px-3 py-2 border text-sm"
              style={{
                backgroundColor: cardColor,
                borderColor: '#e5e7eb',
                color: textColor,
                borderRadius: `${Math.max(6, radius-6)}px`
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className="px-4 py-2 text-sm font-semibold disabled:opacity-50"
              style={{ 
                backgroundColor: buttonColor,
                color: '#fff',
                borderRadius: `${Math.max(6, radius-6)}px`
              }}
            >
              Send
            </button>
          </div>
        </div>
      );
    }

    if (template === 'fullscreen') {
      return (
        <div 
          className="w-full h-96 flex flex-col border overflow-hidden"
          style={{
            backgroundColor: bgColor,
            borderColor: '#e5e7eb',
            borderRadius: `${radius}px`
          }}
        >
          {/* Header */}
          <div 
            className="flex items-center gap-3 p-4 border-b shadow-sm"
            style={{
              backgroundColor: buttonColor,
              color: '#fff',
              borderBottomColor: '#e5e7eb'
            }}
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg overflow-hidden" style={{ color: buttonColor }}>
              {icon && (isDirectImageUrl(icon) || resolvedIcon) ? (
                <img src={resolvedIcon || getProxiedImageUrl(icon)} alt="Bot" className="w-full h-full object-cover" />
              ) : (
                <span>{icon || '🤖'}</span>
              )}
            </div>
            <div className="text-lg font-semibold">{botName}</div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.length === 0 && (
              <div 
                className="p-3"
                style={{ 
                  background: bubbleBot,
                  color: textColor,
                  borderRadius: `${radius}px`
                }}
              >
                {greeting}
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 max-w-[70%] ${
                  msg.type === 'user' ? 'ml-auto' : 'mr-auto'
                }`}
                style={{
                  background: msg.type === 'user' ? bubbleMe : bubbleBot,
                  color: msg.type === 'user' ? '#fff' : textColor,
                  borderRadius: `${radius}px`
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>
          
          {/* Input */}
          <div className="p-4 border-t flex gap-3" style={{ borderTopColor: '#e5e7eb' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask a question..."
              className="flex-1 px-4 py-3 border"
              style={{
                backgroundColor: cardColor,
                borderColor: '#e5e7eb',
                color: textColor,
                borderRadius: `${Math.max(8, radius-4)}px`
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className="px-6 py-3 font-semibold disabled:opacity-50"
              style={{ 
                backgroundColor: buttonColor,
                color: '#fff',
                borderRadius: `${Math.max(8, radius-4)}px`
              }}
            >
              Send
            </button>
          </div>
        </div>
      );
    }
    
    // CDN widget preview - similar to bubble
    if (template === 'cdn-default') {
      return (
        <div className="relative w-full h-[540px] bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
          {/* Chat Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="fixed bottom-6 right-6 w-14 h-14 shadow-lg flex items-center justify-center text-2xl transition-transform hover:scale-105 overflow-hidden"
            style={{ 
              backgroundColor: buttonColor,
              color: '#fff',
              borderRadius: `${radius}px`
            }}
          >
            {icon && (isDirectImageUrl(icon) || resolvedIcon) ? (
              <img src={resolvedIcon || getProxiedImageUrl(icon)} alt="Bot" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <span>{icon || '💬'}</span>
            )}
          </button>
          
          {/* Chat Panel */}
          {isOpen && (
            <div 
              className="fixed bottom-20 right-6 w-80 h-96 shadow-2xl overflow-hidden transition-all"
              style={{
                backgroundColor: cardColor,
                border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                borderRadius: `${Math.max(8, radius)}px`
              }}
            >
              {/* Header */}
              <div 
                className="flex items-center justify-between p-3 border-b"
                style={{
                  backgroundColor: cardColor,
                  borderBottomColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                  color: textColor
                }}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-sm overflow-hidden"
                    style={{ backgroundColor: buttonColor, color: '#fff' }}
                  >
                    {icon && (isDirectImageUrl(icon) || resolvedIcon) ? (
                      <img src={resolvedIcon || getProxiedImageUrl(icon)} alt="Bot" className="w-full h-full object-cover" />
                    ) : (
                      <span>{icon || '🤖'}</span>
                    )}
                  </div>
                  <span className="font-semibold">{botName}</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-lg leading-none hover:opacity-70"
                  style={{ color: textColor }}
                >
                  ×
                </button>
              </div>
              
              {/* Messages */}
              <div 
                className="flex-1 p-3 h-64 overflow-y-auto space-y-2"
                style={{ backgroundColor: bgColor }}
              >
                {messages.length === 0 && greeting && (
                  <div 
                    className="text-sm p-3 rounded-lg max-w-[80%]"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                      color: textColor,
                      borderRadius: `${Math.max(8, radius-4)}px`
                    }}
                  >
                    {greeting}
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`text-sm p-3 max-w-[80%] ${
                      msg.type === 'user' ? 'ml-auto' : 'mr-auto'
                    }`}
                    style={{
                      backgroundColor: msg.type === 'user' ? accent : (theme === 'dark' ? '#374151' : '#f3f4f6'),
                      color: msg.type === 'user' ? '#fff' : textColor,
                      borderRadius: `${Math.max(8, radius-4)}px`
                    }}
                  >
                    {msg.text}
                  </div>
                ))}
                {isTyping && (
                  <div 
                    className="text-sm p-3 max-w-[80%] mr-auto flex items-center gap-1"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                      color: textColor,
                      borderRadius: `${Math.max(8, radius-4)}px`
                    }}
                  >
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input */}
              <div 
                className="p-3 border-t flex gap-2"
                style={{
                  backgroundColor: cardColor,
                  borderTopColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                  placeholder="Ask a question..."
                  className="flex-1 px-3 py-2 border text-sm"
                  style={{
                    backgroundColor: bgColor,
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    color: textColor,
                    borderRadius: `${Math.max(6, radius-6)}px`
                  }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className="px-4 py-2 text-sm font-semibold disabled:opacity-50"
                  style={{ 
                    backgroundColor: buttonColor,
                    color: '#fff',
                    borderRadius: `${Math.max(6, radius-6)}px`
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Default fallback
    return (
      <div className="w-full h-64 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-lg mb-2">📝</div>
          <div>Template Preview</div>
          <div className="text-xs">Select a template above</div>
        </div>
      </div>
    );
  }

  const displayCode = generateCode(tpl);

  return (
    <div className="space-y-6">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">🚀 Add Chat to Your Website</h1>
        <p className="text-lg text-gray-600 mb-6">Create a customized chatbot widget for your website in 3 simple steps. No coding experience needed!</p>
        <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
            <span>Choose Style</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
            <span>Customize Look</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
            <span>Copy & Paste</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6 space-y-6">
            
            {/* Step 1: Choose Chat Style */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <h3 className="text-lg font-semibold text-gray-900">Choose Your Chat Style</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {setWidget('bubble'); setTpl('bubble-blue');}}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    tpl === 'bubble-blue' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">💬</div>
                  <div className="font-medium text-sm text-gray-900">Bubble Chat</div>
                  <div className="text-xs text-gray-500">Floating button</div>
                </button>
                
                <button
                  onClick={() => {setWidget('bubble'); setTpl('bubble-dark');}}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    tpl === 'bubble-dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🌙</div>
                  <div className="font-medium text-sm text-gray-900">Dark Bubble</div>
                  <div className="text-xs text-gray-500">Dark theme</div>
                </button>
                
                <button
                  onClick={() => {setWidget('iframe'); setTpl('iframe-minimal');}}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    tpl === 'iframe-minimal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">📝</div>
                  <div className="font-medium text-sm text-gray-900">Embedded</div>
                  <div className="text-xs text-gray-500">Inline chat</div>
                </button>
                
                <button
                  onClick={() => {setWidget('cdn'); setTpl('cdn-default');}}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    tpl === 'cdn-default' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🔧</div>
                  <div className="font-medium text-sm text-gray-900">CDN Widget</div>
                  <div className="text-xs text-gray-500">Advanced</div>
                </button>
                
                <button
                  onClick={() => {setWidget('inline'); setTpl('inline-card');}}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    tpl === 'inline-card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🃏</div>
                  <div className="font-medium text-sm text-gray-900">Card Style</div>
                  <div className="text-xs text-gray-500">Clean design</div>
                </button>
                
                <button
                  onClick={() => {setWidget('fullscreen'); setTpl('fullscreen');}}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    tpl === 'fullscreen' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🖥️</div>
                  <div className="font-medium text-sm text-gray-900">Full Screen</div>
                  <div className="text-xs text-gray-500">Large chat</div>
                </button>
              </div>
            </div>

            {/* Step 2: Customize Your Bot */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <h3 className="text-lg font-semibold text-gray-900">Customize Your Bot</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bot Name</label>
                  <input 
                    value={botName} 
                    onChange={e=>setBotName(e.target.value)} 
                    placeholder="e.g., Support Assistant" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bot Icon
                    <span className="text-xs font-normal text-gray-500 ml-2">(emoji or image URL)</span>
                  </label>
                  <input 
                    value={icon} 
                    onChange={e=>setIcon(e.target.value)} 
                    placeholder="💬 or https://example.com/bot.png" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                  <p className="text-xs text-gray-500 mt-1">Use an emoji (💬 🤖 👋) or image URL</p>
                </div>
              </div>
              {/* Greeting input removed; configure welcome message on the backend config page */}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <select value={theme} onChange={e=>setTheme(e.target.value as ("light"|"dark"))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="light">☀️ Light</option>
                    <option value="dark">🌙 Dark</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <select value={position} onChange={e=>setPosition(e.target.value as ("right"|"left"))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="right">➡️ Right</option>
                    <option value="left">⬅️ Left</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Corner Radius: {radius}px</label>
                  <input 
                    type="range" 
                    min={8} 
                    max={24} 
                    value={radius} 
                    onChange={e=>setRadius(Number(e.target.value))} 
                    className="w-full h-10 accent-blue-500 cursor-pointer" 
                  />
                  <div className="flex justify-between text-xs text-gray-500 px-1">
                    <span>8</span>
                    <span>24</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-gray-900">🎨 Palette & Accessibility</div>
                    <div className="text-xs text-gray-500">Live contrast feedback</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>autoFix()} className="text-xs px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700">Auto Fix</button>
                    <button onClick={()=>setCompactContrast(c=>!c)} className="text-xs px-2 py-1 rounded-md bg-gray-200 hover:bg-gray-300" title={compactContrast? 'Show verbose labels (AA/AAA)' : 'Show numeric only'}>{compactContrast? 'Numbers' : 'Labels'}</button>
                    <button onClick={()=>setShowAdvanced(s=>!s)} className="text-xs px-2 py-1 rounded-md bg-gray-200 hover:bg-gray-300">{showAdvanced? 'Hide':'Show'} Legend</button>
                  </div>
                </div>
                {showAdvanced && (
                  <div className="flex items-center gap-3 text-[10px]">
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-600"></span>AAA ≥7</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>AA ≥4.5</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Low &lt;4.5</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>Poor &lt;3</div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mb-2">
                  {presets.map(p=> (
                    <button key={p.name} onClick={()=>applyPreset(p.values)} className="text-[10px] px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 flex items-center gap-1">
                      <span className="inline-block w-3 h-3 rounded" style={{backgroundColor:p.values.accent}}></span>{p.name}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {/* Button / Accent link toggle */}
                  <div className="col-span-full flex items-center gap-2 mb-2">
                    <input id="linkAB" type="checkbox" checked={linkAccentButton} onChange={e=>setLinkAccentButton(e.target.checked)} className="w-4 h-4" />
                    <label htmlFor="linkAB" className="text-xs text-gray-600">Link Chat Button color to Accent (user messages)</label>
                  </div>
                  {/* Accent */}
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <span className="w-4 h-4 rounded-md border border-gray-300" style={{backgroundColor: accent}}></span>
                      Accent / User Bubble
                    </label>
                    <div className="flex items-center gap-3 bg-white rounded-lg p-2 border border-gray-300">
                      <input aria-label="Accent color" type="color" value={accent} onChange={e=>setAccent(e.target.value)} className="h-10 w-10 cursor-pointer rounded shadow-sm p-0 border-none" />
                      <div className="font-mono text-xs text-gray-700">{accent}</div>
                      <span title="Accent vs Page Background" className={`text-[10px] text-white px-1.5 py-0.5 rounded ${badge(contrastAccentOnBg, compactContrast).cls}`}>{badge(contrastAccentOnBg, compactContrast).label}</span>
                    </div>
                    {accentSuggestion && <div className="text-[10px] text-amber-600">Suggestion (dark): try {accentSuggestion}</div>}
                  </div>
                  {/* Button */}
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <span className="w-4 h-4 rounded-md border border-gray-300" style={{backgroundColor: buttonColor}}></span>
                      Chat Button
                    </label>
                    <div className="flex items-center gap-3 bg-white rounded-lg p-2 border border-gray-300">
                      <input aria-label="Button color" type="color" value={buttonColor} onChange={e=>setButtonColor(e.target.value)} disabled={linkAccentButton} className={`h-10 w-10 cursor-pointer rounded shadow-sm p-0 border-none ${linkAccentButton?'opacity-40 cursor-not-allowed':''}`} />
                      <div className={`font-mono text-xs text-gray-700 ${linkAccentButton?'opacity-40':''}`}>{buttonColor}</div>
                      <span title="Button vs Page Background" className={`text-[10px] text-white px-1.5 py-0.5 rounded ${badge(contrastButtonOnBg, compactContrast).cls}`}>{badge(contrastButtonOnBg, compactContrast).label}</span>
                    </div>
                    {/* Transparent Bubble Toggle */}
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        id="transparent-bubble"
                        checked={transparentBubble}
                        onChange={(e) => setTransparentBubble(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="transparent-bubble" className="text-xs text-gray-700 select-none cursor-pointer">
                        Transparent Background (Only Icon/Image)
                      </label>
                    </div>
                    {/* Launcher Size Slider */}
                    <div className="space-y-1 mt-2">
                      <div className="flex justify-between items-center">
                        <label htmlFor="launcher-size" className="text-xs text-gray-700 select-none">
                          Launcher Size
                        </label>
                        <span className="text-xs text-gray-500 font-mono">{launcherSize}px</span>
                      </div>
                      <input
                        type="range"
                        id="launcher-size"
                        min="40"
                        max="100"
                        value={launcherSize}
                        onChange={(e) => setLauncherSize(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                    {/* Icon Scale Slider */}
                    <div className="space-y-1 mt-2">
                      <div className="flex justify-between items-center">
                        <label htmlFor="icon-scale" className="text-xs text-gray-700 select-none">
                          Icon Scale
                        </label>
                        <span className="text-xs text-gray-500 font-mono">{iconScale}%</span>
                      </div>
                      <input
                        type="range"
                        id="icon-scale"
                        min="20"
                        max="100"
                        value={iconScale}
                        onChange={(e) => setIconScale(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  </div>
                  {/* Text */}
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <span className="w-4 h-4 rounded-md border border-gray-300" style={{backgroundColor: textColor}}></span>
                      Text
                    </label>
                    <div className="flex items-center gap-3 bg-white rounded-lg p-2 border border-gray-300">
                      <input aria-label="Text color" type="color" value={textColor} onChange={e=>setTextColor(e.target.value)} className="h-10 w-10 cursor-pointer rounded shadow-sm p-0 border-none" />
                      <div className="font-mono text-xs text-gray-700">{textColor}</div>
                      <span title="Text vs Page Background" className={`text-[10px] text-white px-1.5 py-0.5 rounded ${badge(contrastTextOnBg, compactContrast).cls}`}>{badge(contrastTextOnBg, compactContrast).label}</span>
                    </div>
                    {textSuggestion && <div className="text-[10px] text-amber-600">Suggestion: use {textSuggestion} for better legibility</div>}
                  </div>
                  {/* Card */}
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <span className="w-4 h-4 rounded-md border border-gray-300" style={{backgroundColor: cardColor}}></span>
                      Card Background
                    </label>
                    <div className="flex items-center gap-3 bg-white rounded-lg p-2 border border-gray-300">
                      <input aria-label="Card background color" type="color" value={cardColor} onChange={e=>setCardColor(e.target.value)} className="h-10 w-10 cursor-pointer rounded shadow-sm p-0 border-none" />
                      <div className="font-mono text-xs text-gray-700">{cardColor}</div>
                      <span title="Text vs Card Background" className={`text-[10px] text-white px-1.5 py-0.5 rounded ${badge(contrastTextOnCard, compactContrast).cls}`}>{badge(contrastTextOnCard, compactContrast).label}</span>
                    </div>
                  </div>
                  {/* Page BG */}
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <span className="w-4 h-4 rounded-md border border-gray-300" style={{backgroundColor: bgColor}}></span>
                      Page Background
                    </label>
                    <div className="flex items-center gap-3 bg-white rounded-lg p-2 border border-gray-300">
                      <input aria-label="Page background color" type="color" value={bgColor} onChange={e=>setBgColor(e.target.value)} className="h-10 w-10 cursor-pointer rounded shadow-sm p-0 border-none" />
                      <div className="font-mono text-xs text-gray-700">{bgColor}</div>
                      <span title="Text vs Page Background" className={`text-[10px] text-white px-1.5 py-0.5 rounded ${badge(contrastTextOnBg, compactContrast).cls}`}>{badge(contrastTextOnBg, compactContrast).label}</span>
                    </div>
                  </div>
                  {/* User Message Bubble */}
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <span className="w-4 h-4 rounded-md border border-gray-300" style={{background: bubbleMe}}></span>
                      User Message Bubble
                    </label>
                    <div className="flex items-center gap-3 bg-white rounded-lg p-2 border border-gray-300">
                      <input aria-label="User message bubble color picker" type="color" value={bubbleMe.startsWith('#') ? bubbleMe : '#2563eb'} onChange={e=>setBubbleMe(e.target.value)} className="h-10 w-10 cursor-pointer rounded shadow-sm p-0 border-none" />
                      <input 
                        aria-label="User message bubble background" 
                        type="text" 
                        value={bubbleMe} 
                        onChange={e=>setBubbleMe(e.target.value)} 
                        placeholder="e.g., #2563eb or linear-gradient(...)"
                        className="flex-1 px-2 py-1 border border-gray-200 rounded font-mono text-xs" 
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button type="button" onClick={()=>setBubbleMe("linear-gradient(135deg, #2563eb, #1e40af)")} className="text-[10px] px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 flex items-center gap-1"><span className="inline-block w-3 h-3 rounded" style={{background:"linear-gradient(135deg, #2563eb, #1e40af)"}}></span>Blue</button>
                      <button type="button" onClick={()=>setBubbleMe("linear-gradient(135deg, #10b981, #059669)")} className="text-[10px] px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 flex items-center gap-1"><span className="inline-block w-3 h-3 rounded" style={{background:"linear-gradient(135deg, #10b981, #059669)"}}></span>Green</button>
                      <button type="button" onClick={()=>setBubbleMe("linear-gradient(135deg, #8b5cf6, #6d28d9)")} className="text-[10px] px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 flex items-center gap-1"><span className="inline-block w-3 h-3 rounded" style={{background:"linear-gradient(135deg, #8b5cf6, #6d28d9)"}}></span>Purple</button>
                    </div>
                  </div>
                  {/* Bot Message Bubble */}
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <span className="w-4 h-4 rounded-md border border-gray-300" style={{background: bubbleBot}}></span>
                      Bot Message Bubble
                    </label>
                    <div className="flex items-center gap-3 bg-white rounded-lg p-2 border border-gray-300">
                      <input aria-label="Bot message bubble color picker" type="color" value={bubbleBot.startsWith('#') ? bubbleBot : '#ffffff'} onChange={e=>setBubbleBot(e.target.value)} className="h-10 w-10 cursor-pointer rounded shadow-sm p-0 border-none" />
                      <input 
                        aria-label="Bot message bubble background" 
                        type="text" 
                        value={bubbleBot} 
                        onChange={e=>setBubbleBot(e.target.value)} 
                        placeholder="e.g., #ffffff or rgba(...)"
                        className="flex-1 px-2 py-1 border border-gray-200 rounded font-mono text-xs" 
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button type="button" onClick={()=>setBubbleBot("#ffffff")} className="text-[10px] px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 flex items-center gap-1"><span className="inline-block w-3 h-3 rounded border" style={{background:"#ffffff"}}></span>White</button>
                      <button type="button" onClick={()=>setBubbleBot("#f3f4f6")} className="text-[10px] px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 flex items-center gap-1"><span className="inline-block w-3 h-3 rounded" style={{background:"#f3f4f6"}}></span>Gray</button>
                      <button type="button" onClick={()=>setBubbleBot("#e5e7eb")} className="text-[10px] px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 flex items-center gap-1"><span className="inline-block w-3 h-3 rounded" style={{background:"#e5e7eb"}}></span>Darker</button>
                    </div>
                  </div>
                  {/* Swatch preview */}
                  <div className="col-span-full mt-2 grid grid-cols-2 gap-2 text-[10px]">
                    <div className="rounded-md border p-2 space-y-1" style={{backgroundColor: bgColor}}>
                      <div className="font-semibold">Bg Preview</div>
                      <div className="p-1 rounded" style={{backgroundColor: cardColor, color:textColor}}>Card / Text</div>
                      <div className="p-1 rounded" style={{background: bubbleMe, color:'#fff'}}>User Msg</div>
                      <div className="p-1 rounded" style={{background: bubbleBot, color:textColor}}>Bot Msg</div>
                    </div>
                    <div className="rounded-md border p-2 space-y-1" style={{backgroundColor: theme==='dark'? '#0b111a':'#ffffff'}}>
                      <div className="font-semibold">Theme Contrast</div>
                      <div className="p-1 rounded" style={{background: bubbleMe, color:'#fff'}}>User</div>
                      <div className="p-1 rounded" style={{background: bubbleBot, color:textColor}}>Bot</div>
                      <div className="p-1 rounded" style={{backgroundColor: buttonColor, color:'#fff'}}>Button</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Copy and Install */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <h3 className="text-lg font-semibold text-gray-900">Add to Your Website</h3>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-lg">📋</div>
                    <span className="font-medium text-gray-900">Website Code</span>
                  </div>
                  <button 
                    onClick={() => copy(displayCode)} 
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      copied 
                        ? 'bg-green-500 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`} 
                    disabled={!displayCode}
                  >
                    {copied ? '✅ Copied!' : '📋 Copy Code'}
                  </button>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-4 font-mono text-sm overflow-x-auto max-h-40">
                  <pre className="whitespace-pre-wrap text-gray-700">{displayCode}</pre>
                </div>
                
                <div className="mt-3 text-sm text-gray-600">
                  <div className="font-medium mb-2">📖 How to install:</div>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Copy the code above</li>
                    <li>Paste it into your website&apos;s HTML before the closing <code className="bg-gray-200 px-1 rounded">&lt;/body&gt;</code> tag</li>
                    <li>Save and publish your website</li>
                    <li>Your chatbot will appear automatically! 🎉</li>
                  </ol>
                </div>
              </div>

              {/* API Key Management */}
              <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Bot API Key</span>
                  <span className="text-xs text-gray-500">Last rotated: {rotatedAt ? new Date(rotatedAt).toLocaleString() : "Not set"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    readOnly 
                    value={pubKey || ""} 
                    placeholder="No key generated" 
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm font-mono" 
                  />
                  <button 
                    onClick={async()=>{
                      const k = pubKey || ""; 
                      if(!k) return; 
                      await copy(k);
                    }} 
                    className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                  >
                    Copy
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="include-key"
                    checked={includeKey}
                    onChange={(e) => setIncludeKey(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="include-key" className="text-xs text-gray-600">
                    Include API key in generated code (recommended for security)
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6 space-y-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="text-2xl">👀</div>
                <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
              </div>
              <p className="text-sm text-gray-600">This is exactly how your chatbot will look on your website</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <ChatPreview template={tpl} />
            </div>
            
            {tpl && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Try typing a message above! ⬆️</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
