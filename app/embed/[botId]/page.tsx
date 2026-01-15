/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState, use as usePromise } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [widget, setWidget] = useState<string>("bubble");
  const [tpl, setTpl] = useState<string>("bubble-blue");
  // const [snippet, setSnippet] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [pubKey, setPubKey] = useState<string | null>(null);
  // const [rotatedAt, setRotatedAt] = useState<string | null>(null);
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
  // const BRAND_TEXT = "CodeWeft";
  // const BRAND_LINK = "https://codeweft.in/";
  
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
  const [showIconHelp, setShowIconHelp] = useState<boolean>(false);

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

  function handleThemeChange(t: "light"|"dark") {
    setTheme(t);
    if(t === 'dark') {
      setBgColor('#0f172a');
      setCardColor('#1e293b');
      setTextColor('#f8fafc');
      setBubbleBot('#334155');
    } else {
      setBgColor('#ffffff');
      setCardColor('#ffffff');
      setTextColor('#0f172a');
      setBubbleBot('#ffffff');
    }
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
  const [compactContrast] = useState<boolean>(true);

  // Auto link accent -> button color if enabled
  useEffect(()=>{ if(linkAccentButton) setButtonColor(accent); }, [accent, linkAccentButton]);

  // Suggest safer colors in dark mode if poor contrast
  // function suggestForDark(hex: string){
  //   if(theme!=='dark') return null;
  //   const lum=luminance(hex);
  //   if(lum>0.6) return '#1e40af'; // too light -> deeper blue
  //   if(lum<0.08) return '#3b82f6'; // too dark -> mid blue
  //   return null;
  // }

  // Load org from localStorage on client side only
  useEffect(() => {
    const orgId = localStorage.getItem("orgId") || process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || "";
    setOrg(orgId);
  }, []);

  useEffect(() => {
    if (!org) return;
    (async () => {
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
          // setRotatedAt(kj.rotated_at || null);
        }
      } catch {}
    })();
  }, [org, botId]);

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
        `inputArea.innerHTML='<input id="chatbot-input" type="text" placeholder="Ask a question..." maxlength="1000"><button id="chatbot-send">Send</button>';`,
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
        `<iframe srcdoc="<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><style>body{font-family:sans-serif;font-size:14px;margin:0;background:${bgColor}}.wrap{padding:10px}.msgs{padding:10px;height:36vh;overflow:auto;border:1px solid #e5e7eb;border-radius:${radius}px;background:#f9fafb;margin-bottom:8px}.m{max-width:80%;margin-bottom:8px;padding:8px 10px;border-radius:${Math.max(6, radius-4)}px;white-space:pre-wrap}.m.u{background:${bubbleMe};color:#fff;margin-left:auto;border-bottom-right-radius:4px}.m.b{background:${bubbleBot};color:${textColor};margin-right:auto;border-bottom-left-radius:4px}.inp{display:flex;gap:8px}.inp input{flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:${Math.max(6, radius-4)}px}.inp button{padding:10px 14px;border:none;border-radius:${Math.max(6, radius-4)}px;background:${buttonColor};color:#fff;font-weight:600;cursor:pointer}</style></head><body><div class='wrap'><div class='msgs'><div class='m b'>${greeting.replace(/'/g,"&#39;")}</div></div><div class='inp'><input type='text' placeholder='Ask' maxlength='1000'><button>Send</button></div></div><script>(function(){var O='${org}',K='${k}',U='${base}/api/chat/stream/${botId}';function s(m,cb){var h={'Content-Type':'application/json'};if(K){h['X-Bot-Key']=K;}var b=JSON.stringify({message:m,org_id:O});fetch(U,{method:'POST',headers:h,body:b}).then(function(r){var rd=r.body.getReader();var d=new TextDecoder();function n(){rd.read().then(function(x){if(x.done){cb(null,true);return;}var t=d.decode(x.value);t.split(\"\\n\\n\").forEach(function(l){if(l.indexOf('data: ')==0){cb(l.slice(6),false);}});n();});}n();});}var msgs=document.querySelector('.msgs');var i=document.querySelector('.inp input');var go=document.querySelector('.inp button');function addU(m){var e=document.createElement('div');e.className='m u';e.textContent=m;msgs.appendChild(e);msgs.scrollTop=msgs.scrollHeight;}function addB(){var e=document.createElement('div');e.className='m b';msgs.appendChild(e);msgs.scrollTop=msgs.scrollHeight;return e;}function send(){var q=i.value;if(!q.trim()){return;}i.value='';addU(q);var bot=addB();s(q,function(tok,end){if(end){return;}bot.textContent+=tok;});}go.onclick=send;i.addEventListener('keydown',function(ev){if(ev.key==='Enter'){send();}})})();</script></body></html>" style="width:100%;min-height:280px;border:1px solid #e5e7eb;border-radius:${radius}px"></iframe>`
      ].join("\n");
    }

    if (templateId === "cdn-default") {
      const kcfg = includeKey && pubKey ? `,botKey:'${pubKey}'` : '';
      return [
        "<!-- Default CDN widget: paste near end of body -->",
        `<script>window.chatbotConfig={botId:'${botId}',orgId:'${org}',apiBase:'${base}',buttonColor:'${buttonColor}',accent:'${accent}',text:'${textColor}',card:'${cardColor}',bg:'${bgColor}',radius:${radius},bubbleMe:'${bubbleMe}',bubbleBot:'${bubbleBot}'${kcfg}${botName?`,botName:'${botName.replace(/'/g,"\\'")}'`:''}${icon?`,icon:'${icon.replace(/'/g,"\\'")}'`:''},launcherSize:${launcherSize},iconScale:${iconScale},transparentBubble:${transparentBubble},position:'${position}'};</script>`,
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
        `var i=document.createElement('input');i.style.cssText='flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:${Math.max(6, radius-4)}px;font-size:14px';i.placeholder='Ask a question';i.maxLength='1000';`,
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
        `var i=document.createElement('input');i.style.cssText='flex:1;padding:12px;border:1px solid #e5e7eb;border-radius:${Math.max(8, radius-4)}px;font-size:16px';i.placeholder='Ask a question...';i.maxLength='1000';`,
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
      } catch {
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
            className={`absolute bottom-6 ${position === 'left' ? 'left-6' : 'right-6'} ${transparentBubble ? '' : 'shadow-lg'} flex items-center justify-center text-2xl transition-transform hover:scale-105 overflow-hidden`}
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
              className={`absolute bottom-20 ${position === 'left' ? 'left-6' : 'right-6'} w-80 h-96 shadow-2xl overflow-hidden transition-all`}
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
                  maxLength="1000"
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
              maxLength="1000"
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
              maxLength="1000"
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
              maxLength="1000"
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
            className={`absolute bottom-6 ${position === 'left' ? 'left-6' : 'right-6'} ${transparentBubble ? '' : 'shadow-lg'} flex items-center justify-center text-2xl transition-transform hover:scale-105 overflow-hidden`}
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
              className={`absolute bottom-20 ${position === 'left' ? 'left-6' : 'right-6'} w-80 h-96 shadow-2xl overflow-hidden transition-all`}
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
                  maxLength="1000"
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

  const contrastAccentOnBg = contrastRatio(accent, bgColor);
  const contrastTextOnBg = contrastRatio(textColor, bgColor);
  const contrastButtonOnBg = contrastRatio(buttonColor, bgColor);

  const displayCode = generateCode(tpl);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Embed Chatbot</h1>
            <p className="text-sm text-gray-500 mt-1">Customize and integrate your chatbot into your website</p>
          </div>
          <Link href={`/bots/${botId}/config`}>
            <Button variant="outline">Back to Configuration</Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Configuration Panel */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Quick Guide Card */}
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <span className="text-lg">💬</span>
                  Message Format Guide & Examples
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {/* Plain Text Section */}
                  <div className="p-3 bg-white rounded-lg border border-purple-200 space-y-2">
                    <div className="font-semibold text-sm text-gray-900">📝 Plain Text Messages</div>
                    <div className="text-xs text-gray-600">Simple text responses work automatically:</div>
                    <code className="block bg-gray-100 p-2 rounded text-[11px] font-mono mt-1">
                      Hello! How can I help you today?
                    </code>
                  </div>

                  {/* Formatted Text Section */}
                  <div className="p-3 bg-white rounded-lg border border-purple-200 space-y-2">
                    <div className="font-semibold text-sm text-gray-900">✨ Formatted Text (Markdown)</div>
                    <div className="text-xs text-gray-600 space-y-2">
                      <div><strong>Bold:</strong> <code className="bg-gray-100 px-1 rounded text-[11px]">**Your text**</code></div>
                      <div><strong>Links:</strong> <code className="bg-gray-100 px-1 rounded text-[11px]">[Click here](https://example.com)</code></div>
                      <div><strong>Lists:</strong> <code className="bg-gray-100 px-1 rounded text-[11px]">• Item 1</code></div>
                    </div>
                    <code className="block bg-gray-100 p-2 rounded text-[11px] font-mono mt-2">
                      We offer **three plans**: [Basic](link) • [Pro](link) • [Enterprise](link)
                    </code>
                  </div>

                  {/* Images Section */}
                  <div className="p-3 bg-white rounded-lg border border-purple-200 space-y-2">
                    <div className="font-semibold text-sm text-gray-900">🖼️ Including Images</div>
                    <div className="text-xs text-gray-600">Use markdown image syntax:</div>
                    <code className="block bg-gray-100 p-2 rounded text-[11px] font-mono mt-1">
                      ![Description](https://example.com/image.jpg)
                    </code>
                    <div className="text-xs text-gray-500 mt-2">Supports: PNG, JPG, GIF, SVG, WebP</div>
                  </div>

                  {/* Line Breaks Section */}
                  <div className="p-3 bg-white rounded-lg border border-purple-200 space-y-2">
                    <div className="font-semibold text-sm text-gray-900">📏 Line Breaks & Spacing</div>
                    <div className="text-xs text-gray-600">Press Enter twice for paragraph breaks or use <code className="bg-gray-100 px-1 rounded text-[11px]">===</code></div>
                    <code className="block bg-gray-100 p-2 rounded text-[11px] font-mono mt-1">
                      First paragraph<br/>
                      ===<br/>
                      Second paragraph
                    </code>
                  </div>

                  {/* Code Blocks Section */}
                  <div className="p-3 bg-white rounded-lg border border-purple-200 space-y-2">
                    <div className="font-semibold text-sm text-gray-900">💻 Code Blocks</div>
                    <div className="text-xs text-gray-600">Wrap code in triple backticks:</div>
                    <code className="block bg-gray-100 p-2 rounded text-[11px] font-mono mt-1">
                      ```<br/>
                      const greeting = &quot;Hello&quot;;<br/>
                      ```
                    </code>
                  </div>

                  {/* Combined Example */}
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 space-y-2">
                    <div className="font-semibold text-sm text-gray-900">🎯 Complete Example</div>
                    <code className="block bg-gray-900 text-gray-100 p-2 rounded text-[11px] font-mono mt-2 whitespace-pre-wrap">
{`Hello! Welcome to our support team. 

**What we can help with:**
• Product questions
• Technical issues
• Account support

Check out our [Help Center](https://help.example.com)

===

Got a complex issue? [Open a ticket](https://support.example.com/ticket)`}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Step 1: Layout */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">1</span>
                  Choose Layout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'bubble-blue', icon: '💬', label: 'Bubble Chat', desc: 'Floating button' },
                    { id: 'bubble-dark', icon: '🌙', label: 'Dark Bubble', desc: 'Dark theme' },
                    { id: 'iframe-minimal', icon: '📝', label: 'Embedded', desc: 'Inline component' },
                    { id: 'cdn-default', icon: '🔧', label: 'CDN Widget', desc: 'Universal script' },
                    { id: 'inline-card', icon: '🃏', label: 'Card Style', desc: 'Compact card' },
                    { id: 'fullscreen', icon: '🖥️', label: 'Full Screen', desc: 'Immersive view' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setWidget(item.id.includes('iframe') ? 'iframe' : item.id.includes('cdn') ? 'cdn' : item.id.includes('inline') ? 'inline' : item.id.includes('fullscreen') ? 'fullscreen' : 'bubble');
                        setTpl(item.id);
                      }}
                      className={`relative p-4 rounded-xl text-left transition-all duration-200 border-2 ${
                        tpl === item.id 
                          ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' 
                          : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="font-semibold text-gray-900 text-sm">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Customize */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">2</span>
                  Customize Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Bot Quality Guide */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                  <p className="text-xs font-semibold text-amber-900 flex items-center gap-2">
                    <span>🧠</span>
                    <span>Improve Bot Answers Quality</span>
                  </p>
                  <p className="text-xs text-amber-800">
                    The appearance settings below customize the widget look. To improve the <strong>quality of bot answers</strong>, go to the <strong>Configuration page</strong> and modify the <strong>System Instructions</strong>.
                  </p>
                  <div className="text-xs text-amber-700 space-y-1 mt-2 ml-4 list-disc">
                    <div>• Better instructions = Better answers from the bot</div>
                    <div>• Define the bot&apos;s role, tone, and knowledge domain</div>
                    <div>• Add constraints and specific rules the bot should follow</div>
                    <div>• Provide context about your business or services</div>
                  </div>
                </div>

                {/* Identity */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Identity</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      label="Bot Name"
                      value={botName}
                      onChange={e=>setBotName(e.target.value)}
                      placeholder="e.g., Support Assistant"
                    />
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Bot Icon</label>
                      <div className="flex gap-2">
                         <div className="flex-shrink-0 w-9 h-9 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center text-lg overflow-hidden">
                           {icon && (isDirectImageUrl(icon) || resolvedIcon) ? (
                              <img src={resolvedIcon || getProxiedImageUrl(icon)} alt="Icon" className="w-full h-full object-cover" />
                           ) : (
                              <span>{icon || '💬'}</span>
                           )}
                         </div>
                         <Input
                           wrapperClassName="flex-1"
                           value={icon} 
                           onChange={e=>setIcon(e.target.value)} 
                           placeholder="Emoji or Image URL" 
                         />
                      </div>
                      {/* Collapsible Icon Help */}
                      <button
                        type="button"
                        onClick={() => setShowIconHelp(!showIconHelp)}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        {showIconHelp ? '▼' : '▶'} How to add an icon?
                      </button>
                      {showIconHelp && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                          <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
                            <li><strong>Emoji:</strong> Paste any emoji directly (e.g., 💬, 🤖, ✨)</li>
                            <li><strong>Image URL:</strong> Use a direct image link (e.g., https://example.com/icon.png)</li>
                            <li><strong>Local Image:</strong> Use /public/path (e.g., /public/chat.png)</li>
                            <li><strong>SVG or PNG:</strong> Supports .png, .jpg, .svg, .gif, .webp formats</li>
                            <li><strong>Transparent Images:</strong> PNG with transparent background works best</li>
                          </ul>
                          <p className="text-xs text-blue-700 mt-2">
                            <strong>Note:</strong> Images will be automatically scaled to fit the launcher button.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Layout & Theme */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Layout & Theme</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <Select
                      label="Theme Mode"
                      value={theme}
                      onChange={e=>handleThemeChange(e.target.value as ("light"|"dark"))}
                      options={[
                        { value: "light", label: "☀️ Light Mode" },
                        { value: "dark", label: "🌙 Dark Mode" }
                      ]}
                    />
                    
                    <Select
                      label="Position"
                      value={position}
                      onChange={e=>setPosition(e.target.value as ("right"|"left"))}
                      options={[
                        { value: "right", label: "➡️ Bottom Right" },
                        { value: "left", label: "⬅️ Bottom Left" }
                      ]}
                    />

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Corner Radius: {radius}px</label>
                      <input 
                        type="range" 
                        min={0} 
                        max={24} 
                        value={radius} 
                        onChange={e=>setRadius(Number(e.target.value))} 
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Colors */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Colors & Styling</h4>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={()=>autoFix()} 
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8"
                    >
                      ✨ Auto Fix Contrast
                    </Button>
                  </div>
                  
                  {/* Presets */}
                  <div className="flex flex-wrap gap-2">
                    {presets.map(p=> (
                      <button 
                        key={p.name} 
                        onClick={()=>applyPreset(p.values)} 
                        className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all"
                      >
                        <span className="w-3 h-3 rounded-full border border-gray-100 shadow-sm" style={{backgroundColor:p.values.accent}}></span>
                        <span className="text-xs text-gray-600 group-hover:text-gray-900">{p.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Main Colors Grid - keeping custom color picker UI as it's specialized */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 rounded-xl p-5 border border-gray-200/60">
                    
                    {/* Brand Color */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500 flex items-center justify-between">
                        <span>Brand / Accent Color</span>
                        <span title="Contrast Score" className={`text-[10px] px-1.5 py-0.5 rounded font-bold text-white ${badge(contrastAccentOnBg, compactContrast).cls}`}>
                          {badge(contrastAccentOnBg, compactContrast).label}
                        </span>
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input 
                            type="color" 
                            value={accent} 
                            onChange={e=>setAccent(e.target.value)} 
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                          />
                          <div className="w-full h-9 rounded-md border border-gray-200 flex items-center px-3 gap-2 bg-white">
                            <div className="w-5 h-5 rounded border border-gray-200 shadow-sm" style={{backgroundColor: accent}}></div>
                            <span className="text-xs font-mono text-gray-600 uppercase">{accent}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <input id="linkAB" type="checkbox" checked={linkAccentButton} onChange={e=>setLinkAccentButton(e.target.checked)} className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                        <label htmlFor="linkAB" className="text-xs text-gray-600 cursor-pointer select-none">Use this for chat button too</label>
                      </div>
                    </div>

                    {/* Button Color */}
                    <div className={`space-y-2 ${linkAccentButton ? 'opacity-50 pointer-events-none' : ''}`}>
                      <label className="text-xs font-medium text-gray-500 flex items-center justify-between">
                        <span>Chat Button Color</span>
                        <span title="Contrast Score" className={`text-[10px] px-1.5 py-0.5 rounded font-bold text-white ${badge(contrastButtonOnBg, compactContrast).cls}`}>
                          {badge(contrastButtonOnBg, compactContrast).label}
                        </span>
                      </label>
                      <div className="relative">
                        <input 
                          type="color" 
                          value={buttonColor} 
                          onChange={e=>setButtonColor(e.target.value)} 
                          disabled={linkAccentButton}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                        <div className="w-full h-9 rounded-md border border-gray-200 flex items-center px-3 gap-2 bg-white">
                          <div className="w-5 h-5 rounded border border-gray-200 shadow-sm" style={{backgroundColor: buttonColor}}></div>
                          <span className="text-xs font-mono text-gray-600 uppercase">{buttonColor}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Advanced Toggle */}
                    <div className="col-span-full">
                       <Button 
                         variant="ghost"
                         size="sm"
                         onClick={()=>setShowAdvanced(!showAdvanced)}
                         className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 h-8 px-0"
                       >
                         {showAdvanced ? 'Hide Advanced Colors' : 'Show Advanced Colors'}
                         <svg className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                       </Button>
                    </div>

                    {/* Advanced Colors */}
                    {showAdvanced && (
                      <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200/60">
                        {/* Text Color */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 flex items-center justify-between">
                          <span>Text Color</span>
                          <span title="Contrast Score" className={`text-[10px] px-1.5 py-0.5 rounded font-bold text-white ${badge(contrastTextOnBg, compactContrast).cls}`}>
                            {badge(contrastTextOnBg, compactContrast).label}
                          </span>
                        </label>
                        <div className="relative">
                            <input type="color" value={textColor} onChange={e=>setTextColor(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                            <div className="w-full h-9 rounded-md border border-gray-200 flex items-center px-3 gap-2 bg-white">
                              <div className="w-5 h-5 rounded border border-gray-200 shadow-sm" style={{backgroundColor: textColor}}></div>
                              <span className="text-xs font-mono text-gray-600 uppercase">{textColor}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Background */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-500">Card Background</label>
                          <div className="relative">
                            <input type="color" value={cardColor} onChange={e=>setCardColor(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                            <div className="w-full h-9 rounded-md border border-gray-200 flex items-center px-3 gap-2 bg-white">
                              <div className="w-5 h-5 rounded border border-gray-200 shadow-sm" style={{backgroundColor: cardColor}}></div>
                              <span className="text-xs font-mono text-gray-600 uppercase">{cardColor}</span>
                            </div>
                          </div>
                        </div>

                        {/* Page Background (Preview Only) */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-500">Page Background (Preview)</label>
                          <div className="relative">
                            <input type="color" value={bgColor} onChange={e=>setBgColor(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                            <div className="w-full h-9 rounded-md border border-gray-200 flex items-center px-3 gap-2 bg-white">
                              <div className="w-5 h-5 rounded border border-gray-200 shadow-sm" style={{backgroundColor: bgColor}}></div>
                              <span className="text-xs font-mono text-gray-600 uppercase">{bgColor}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* User Bubble & Bot Bubble Logic kept similar but styled */}
                        <div className="space-y-3">
                           <div className="flex items-center justify-between">
                             <label className="text-xs font-medium text-gray-500">User Bubble</label>
                             <div className="flex bg-gray-100 p-0.5 rounded-md">
                               <button 
                                 onClick={() => {
                                   const matches = bubbleMe.match(/#[a-fA-F0-9]{6}/g);
                                   setBubbleMe(matches ? matches[0] : '#2563eb');
                                 }}
                                 className={`px-2 py-0.5 text-[10px] font-medium rounded transition-all ${!bubbleMe.startsWith('linear-gradient') ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                               >
                                 Solid
                               </button>
                               <button 
                                 onClick={() => {
                                   if (!bubbleMe.startsWith('linear-gradient')) {
                                      setBubbleMe(`linear-gradient(135deg, ${bubbleMe}, ${tweakColor(bubbleMe, '#000000', 1.2)})`);
                                   }
                                 }}
                                 className={`px-2 py-0.5 text-[10px] font-medium rounded transition-all ${bubbleMe.startsWith('linear-gradient') ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                               >
                                 Gradient
                               </button>
                             </div>
                           </div>

                           {!bubbleMe.startsWith('linear-gradient') ? (
                             <div className="relative">
                               <input type="color" value={bubbleMe.startsWith('#')?bubbleMe:'#2563eb'} onChange={e=>setBubbleMe(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                               <div className="w-full h-9 rounded-md border border-gray-200 flex items-center px-3 gap-2 bg-white overflow-hidden">
                                 <div className="w-5 h-5 rounded border border-gray-200 shadow-sm flex-shrink-0" style={{background: bubbleMe}}></div>
                                 <span className="text-xs font-mono text-gray-600 truncate">{bubbleMe}</span>
                               </div>
                             </div>
                           ) : (
                             <div className="space-y-2">
                               <div className="grid grid-cols-2 gap-3">
                                 <div>
                                   <label className="text-[10px] text-gray-400 mb-1 block">Start</label>
                                   <div className="relative">
                                     <input 
                                       type="color" 
                                       value={bubbleMe.match(/#[a-fA-F0-9]{6}/g)?.[0] || '#2563eb'} 
                                       onChange={e => {
                                          const end = bubbleMe.match(/#[a-fA-F0-9]{6}/g)?.[1] || '#1e40af';
                                          setBubbleMe(`linear-gradient(135deg, ${e.target.value}, ${end})`);
                                       }} 
                                       className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" 
                                     />
                                     <div className="w-full h-8 rounded-md border border-gray-200 flex items-center px-2 gap-2 bg-white overflow-hidden">
                                       <div className="w-4 h-4 rounded border border-gray-200 shadow-sm flex-shrink-0" style={{background: bubbleMe.match(/#[a-fA-F0-9]{6}/g)?.[0] || '#2563eb'}}></div>
                                     </div>
                                   </div>
                                 </div>
                                 <div>
                                   <label className="text-[10px] text-gray-400 mb-1 block">End</label>
                                   <div className="relative">
                                     <input 
                                       type="color" 
                                       value={bubbleMe.match(/#[a-fA-F0-9]{6}/g)?.[1] || '#1e40af'} 
                                       onChange={e => {
                                          const start = bubbleMe.match(/#[a-fA-F0-9]{6}/g)?.[0] || '#2563eb';
                                          setBubbleMe(`linear-gradient(135deg, ${start}, ${e.target.value})`);
                                       }} 
                                       className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" 
                                     />
                                     <div className="w-full h-8 rounded-md border border-gray-200 flex items-center px-2 gap-2 bg-white overflow-hidden">
                                       <div className="w-4 h-4 rounded border border-gray-200 shadow-sm flex-shrink-0" style={{background: bubbleMe.match(/#[a-fA-F0-9]{6}/g)?.[1] || '#1e40af'}}></div>
                                     </div>
                                   </div>
                                 </div>
                               </div>
                             </div>
                           )}
                        </div>
                        
                        {/* Bot Bubble */}
                        <div className="space-y-2">
                           <label className="text-xs font-medium text-gray-500">Bot Bubble</label>
                           <div className="relative">
                             <input type="color" value={bubbleBot.startsWith('#')?bubbleBot:'#ffffff'} onChange={e=>setBubbleBot(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                             <div className="w-full h-9 rounded-md border border-gray-200 flex items-center px-3 gap-2 bg-white overflow-hidden">
                               <div className="w-5 h-5 rounded border border-gray-200 shadow-sm flex-shrink-0" style={{background: bubbleBot}}></div>
                               <span className="text-xs font-mono text-gray-600 truncate">{bubbleBot}</span>
                             </div>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Sizing & Toggles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                     <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                           <input
                             type="checkbox"
                             id="transparent-bubble"
                             checked={transparentBubble}
                             onChange={(e) => setTransparentBubble(e.target.checked)}
                             className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                           />
                           <label htmlFor="transparent-bubble" className="text-sm text-gray-700 cursor-pointer">
                             <span className="font-medium block text-gray-900">Transparent Button</span>
                             <span className="text-xs text-gray-500">Remove background color from launcher button</span>
                           </label>
                        </div>
                        {/* Transparent Mode Guide */}
                        {transparentBubble && (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                            <p className="text-xs font-semibold text-amber-900">📌 Transparent Mode Tips:</p>
                            <ul className="text-xs text-amber-800 space-y-1 ml-4 list-disc">
                              <li>Best for image-based icons (PNG with transparent background)</li>
                              <li>No background color will be shown on the button</li>
                              <li>The image will be displayed directly on your website background</li>
                              <li>Use high contrast images for visibility</li>
                            </ul>
                          </div>
                        )}
                     </div>

                     <div className="space-y-4">
                        <div>
                           <div className="flex justify-between items-center mb-1">
                              <label className="text-xs font-medium text-gray-500">Launcher Size</label>
                              <span className="text-xs font-mono text-gray-500">{launcherSize}px</span>
                           </div>
                           <input
                             type="range"
                             min="40"
                             max="100"
                             value={launcherSize}
                             onChange={(e) => setLauncherSize(Number(e.target.value))}
                             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                           />
                           <p className="text-xs text-gray-500 mt-1">Size of the floating chat button (40px - 100px). Default is 56px.</p>
                        </div>
                        <div>
                           <div className="flex justify-between items-center mb-1">
                              <label className="text-xs font-medium text-gray-500">Icon Scale</label>
                              <span className="text-xs font-mono text-gray-500">{iconScale}%</span>
                           </div>
                           <input
                             type="range"
                             min="20"
                             max="100"
                             value={iconScale}
                             onChange={(e) => setIconScale(Number(e.target.value))}
                             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                           />
                           <p className="text-xs text-gray-500 mt-1">Scale of the icon inside the button (20% - 100%). Default is 60%.</p>
                        </div>
                     </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Install */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">3</span>
                  Get The Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="bg-gray-900 rounded-xl p-4 shadow-inner overflow-hidden relative group">
                    <div className="absolute top-3 right-3 z-10">
                       <Button 
                        size="sm"
                        variant={copied ? "primary" : "secondary"}
                        onClick={() => copy(displayCode)} 
                        className={copied ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                         {copied ? "Copied!" : "Copy Code"}
                       </Button>
                    </div>
                    <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap overflow-x-auto max-h-64 p-2 custom-scrollbar">
                       {displayCode}
                    </pre>
                 </div>

                 <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-900">
                    <p className="font-semibold mb-1">Installation Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-800">
                       <li>Copy the code above.</li>
                       <li>Paste it into your website&apos;s HTML source code, just before the closing <code className="bg-blue-100 px-1 rounded">&lt;/body&gt;</code> tag.</li>
                       <li>Save your changes and refresh your website.</li>
                    </ol>
                 </div>

                 <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="include-key"
                      checked={includeKey}
                      onChange={(e) => setIncludeKey(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="include-key" className="text-sm text-gray-600">
                      Include API key in generated code (recommended for public websites)
                    </label>
                 </div>
              </CardContent>
            </Card>
          </div>

          {/* Sticky Preview Panel */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
             <div className="sticky top-8">
                <Card className="shadow-lg border-blue-100 overflow-hidden">
                   <CardHeader className="bg-gray-50/50 pb-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                           <span>👀</span>
                           Live Preview
                        </CardTitle>
                        <span className="text-[10px] font-medium text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 uppercase tracking-wide">Interactive</span>
                      </div>
                   </CardHeader>
                   <div className="p-4 bg-gray-100/50 min-h-[400px] flex flex-col items-center justify-center">
                      <ChatPreview template={tpl} />
                   </div>
                   <div className="p-3 bg-white border-t border-gray-100 text-center">
                      <p className="text-xs text-gray-400">
                         Try typing a message in the preview to test your bot!
                      </p>
                   </div>
                </Card>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
