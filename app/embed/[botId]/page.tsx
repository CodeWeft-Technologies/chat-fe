"use client";
import { useEffect, useState, use as usePromise } from "react";

function B() {
  const env = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin.replace(/\/$/, "");
  return "";
}

export default function EmbedPage({ params }: { params: Promise<{ botId: string }> }) {
  const [org] = useState(() => {
    const d = (typeof window !== "undefined" ? localStorage.getItem("orgId") : null) || process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || "";
    return d || "";
  });
  const { botId } = usePromise(params as Promise<{ botId: string }>);
  const [snippet, setSnippet] = useState<string | null>(null);
  const [widget, setWidget] = useState<string>("bubble");
  const [tpl, setTpl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [pubKey, setPubKey] = useState<string | null>(null);
  const [rotatedAt, setRotatedAt] = useState<string | null>(null);
  const [includeKey, setIncludeKey] = useState<boolean>(true);
  const [botName, setBotName] = useState<string>("Assistant");
  const [icon, setIcon] = useState<string>("💬");
  const [brandName, setBrandName] = useState<string>("CodeWeft");
  const [brandLink, setBrandLink] = useState<string>("https://github.com/CodeWeft-Technologies");
  const [primaryColor] = useState<string>("#0ea5e9");
  const [radius, setRadius] = useState<number>(16);
  const [theme, setTheme] = useState<"light"|"dark">("light");
  const [position, setPosition] = useState<"right"|"left">("right");
  
  const [accent, setAccent] = useState<string>("#2563eb");
  const [textColor, setTextColor] = useState<string>("#0f1724");
  const [cardColor, setCardColor] = useState<string>("#ffffff");
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  useEffect(() => {
    if (!org) return;
    (async () => {
      try {
        const headers: Record<string, string> = {};
        if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
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
        const base = B().replace(/\/$/, "");
        let fallback = "";
        if (widget === "cdn") {
          fallback = `<script>window.chatbotConfig={botId:'${botId}',orgId:'${org}',apiBase:'${base}',botKey:''};</script><script src='${base}/api/widget.js' async></script>`;
        } else if (widget === "bubble") {
          fallback = (
            "<script>"+
            "(function(){"+
            `var B='${botId}',O='${org}',K='',U='${base}/api/chat/stream/${botId}';`+
            "function s(m,cb){var h={'Content-Type':'application/json','X-Bot-Key':K};var b=JSON.stringify({message:m,org_id:O});fetch(U,{method:'POST',headers:h,body:b}).then(function(r){var rd=r.body.getReader();var d=new TextDecoder();function n(){rd.read().then(function(x){if(x.done){cb(null,true);return;}var t=d.decode(x.value);t.split('\\n\\n').forEach(function(l){if(l.indexOf('data: ')==0){cb(l.slice(6),false);}});n();});}n();});}"+
            "function ui(){var w=document.createElement('div');w.style.position='fixed';w.style.bottom='24px';w.style.right='24px';w.style.zIndex='99999';var b=document.createElement('button');b.textContent='Chat';b.style.padding='12px 16px';b.style.borderRadius='999px';b.style.border='none';b.style.background='#0ea5e9';b.style.color='#fff';var p=document.createElement('div');p.style.position='fixed';p.style.bottom='96px';p.style.right='24px';p.style.width='min(360px, calc(100vw - 48px))';p.style.maxHeight='70vh';p.style.display='none';p.style.boxShadow='0 8px 24px rgba(0,0,0,0.15)';p.style.borderRadius='12px';p.style.background='#fff';p.style.color='#111';p.style.padding='12px';var a=document.createElement('div');a.style.whiteSpace='pre-wrap';a.style.fontFamily='system-ui, sans-serif';a.style.fontSize='14px';a.style.lineHeight='1.4';var i=document.createElement('input');i.type='text';i.placeholder='Ask a question';i.style.width='100%';i.style.marginTop='8px';i.style.padding='10px';i.style.border='1px solid #e5e7eb';i.style.borderRadius='8px';var go=document.createElement('button');go.textContent='Send';go.style.marginTop='8px';go.style.padding='8px 12px';go.style.borderRadius='8px';go.style.border='none';go.style.background='#0ea5e9';go.style.color='#fff';p.appendChild(a);p.appendChild(i);p.appendChild(go);w.appendChild(b);document.body.appendChild(w);document.body.appendChild(p);b.onclick=function(){p.style.display=p.style.display==='none'?'block':'none';};go.onclick=function(){a.textContent='';var q=i.value;i.value='';s(q,function(tok,end){if(end){return;}a.textContent+=tok;});};}ui();"+
            "})();"+
            "</script>"
          );
        } else if (widget === "inline") {
          fallback = (
            "<div id=\"bot-inline\"></div>"+
            "<script>"+
            "(function(){"+
            `var O='${org}',K='',U='${base}/api/chat/stream/${botId}';`+
            "function s(m,cb){var h={'Content-Type':'application/json','X-Bot-Key':K};var b=JSON.stringify({message:m,org_id:O});fetch(U,{method:'POST',headers:h,body:b}).then(function(r){var rd=r.body.getReader();var d=new TextDecoder();function n(){rd.read().then(function(x){if(x.done){cb(null,true);return;}var t=d.decode(x.value);t.split('\\n\\n').forEach(function(l){if(l.indexOf('data: ')==0){cb(l.slice(6),false);}});n();});}n();});}"+
            "var c=document.getElementById('bot-inline');var a=document.createElement('div');a.style.whiteSpace='pre-wrap';a.style.fontFamily='system-ui, sans-serif';a.style.fontSize='14px';var i=document.createElement('input');i.type='text';i.placeholder='Ask a question';i.style.width='100%';var go=document.createElement('button');go.textContent='Send';c.appendChild(a);c.appendChild(i);c.appendChild(go);go.onclick=function(){a.textContent='';var q=i.value;i.value='';s(q,function(tok,end){if(end){return;}a.textContent+=tok;});};"+
            "})();"+
            "</script>"
          );
        } else if (widget === "iframe") {
          const srcdoc = (
            "<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"></head><body>"+
            "<div id=\"app\" style=\"font-family:sans-serif;font-size:14px\"></div>"+
            "<script>"+
            `var O='${org}',K='',U='${base}/api/chat/stream/${botId}';`+
            "function s(m,cb){var h={'Content-Type':'application/json','X-Bot-Key':K};var b=JSON.stringify({message:m,org_id:O});fetch(U,{method:'POST',headers:h,body:b}).then(function(r){var rd=r.body.getReader();var d=new TextDecoder();function n(){rd.read().then(function(x){if(x.done){cb(null,true);return;}var t=d.decode(x.value);t.split('\\n\\n').forEach(function(l){if(l.indexOf('data: ')==0){cb(l.slice(6),false);}});n();});}n();});}"+
            "var a=document.getElementById('app');var i=document.createElement('input');i.type='text';i.placeholder='Ask';var go=document.createElement('button');go.textContent='Send';a.appendChild(i);a.appendChild(go);var o=document.createElement('pre');o.style.whiteSpace='pre-wrap';a.appendChild(o);go.onclick=function(){o.textContent='';var q=i.value;i.value='';s(q,function(tok,end){if(end){return;}o.textContent+=tok;});};"+
            "</script>"+
            "</body></html>"
          );
          fallback = `<iframe srcdoc="${srcdoc.replace(/"/g, '&quot;')}" style="width:100%;min-height:300px;border:1px solid #e5e7eb;border-radius:8px"></iframe>`;
        } else {
          fallback = `<script>window.chatbotConfig={botId:'${botId}',orgId:'${org}',apiBase:'${base}',botKey:''};</script><script src='${base}/api/widget.js' async></script>`;
        }
        setSnippet(fallback);
      }
      try {
        const headers2: Record<string, string> = {};
        if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers2["Authorization"] = `Bearer ${t}`; }
        const rk = await fetch(`${B()}/api/bots/${encodeURIComponent(botId)}/key?org_id=${encodeURIComponent(org)}`, { headers: headers2 });
        if (rk.ok) {
          const kj = await rk.json();
          setPubKey(kj.public_api_key || null);
          setRotatedAt(kj.rotated_at || null);
        }
      } catch {}
    })();
  }, [org, botId, widget]);
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
  function injectKey(s: string, k: string): string {
    let t = s;
    try {
      t = t.replace(/botKey\s*:\s*['"][^'"]*['"]/g, `botKey:'${k}'`);
      t = t.replace(/var\s+K\s*=\s*['"][^'"]*['"]/g, `var K='${k}'`);
      if (!/botKey\s*:\s*['"]/i.test(t) && /window\.chatbotConfig\s*=\s*\{/.test(t)) {
        t = t.replace(/window\.chatbotConfig\s*=\s*\{/, `window.chatbotConfig={botKey:'${k}',`);
      }
    } catch {}
    return t;
  }
  const finalSnippet = (() => {
    const s = snippet || "";
    if (includeKey && pubKey) return injectKey(s, pubKey);
    return s;
  })();
  function withComments(s: string): string {
    const tt = (s || "").trim();
    if (!tt) return "";
    const isHtmlLike = /<\/?[a-z]/i.test(tt);
    const lines = [
      "Paste into your site and adjust placement.",
      "Include your public bot key as botKey if required.",
    ];
    if (isHtmlLike) {
      return [`<!-- ${lines[0]} -->`, `<!-- ${lines[1]} -->`, tt].join("\n");
    }
    return [`// ${lines[0]}`, `// ${lines[1]}`, tt].join("\n");
  }
  function buildTemplateCode(id: string): string {
    const base = B().replace(/\/$/, "");
    const k = includeKey && pubKey ? pubKey : "";
    if (id === "bubble-blue") {
      const kcfg = includeKey && pubKey ? `,botKey:'${pubKey}'` : '';
      return [
        "<!-- Bubble widget: paste near end of body -->",
        `<script>window.chatbotConfig={botId:'${botId}',orgId:'${org}',apiBase:'${base}',mode:'bubble',theme:'${theme}',position:'${position}',accent:'${accent}',text:'${textColor}',card:'${cardColor}',bg:'${bgColor}'${botName?`,botName:'${botName.replace(/'/g,"\\'")}'`:''}${icon?`,icon:'${icon.replace(/'/g,"\\'")}'`:''}${kcfg}${(brandName.trim()||brandLink.trim())?`,branding:{text:'${brandName.trim().replace(/'/g,"\\'")}',link:'${brandLink.trim().replace(/'/g,"\\'")}'}`:`,branding:false`}};</script>`,
        `<script src='${base}/api/widget.js' async></script>`
      ].join("\n");
    }
    if (id === "bubble-dark") {
      const kcfg = includeKey && pubKey ? `,botKey:'${pubKey}'` : '';
      return [
        "<!-- Bubble widget (dark): paste near end of body -->",
        `<script>window.chatbotConfig={botId:'${botId}',orgId:'${org}',apiBase:'${base}',mode:'bubble',theme:'${theme}',position:'${position}',accent:'${accent}',text:'${textColor}',card:'${cardColor}',bg:'${bgColor}'${botName?`,botName:'${botName.replace(/'/g,"\\'")}'`:''}${icon?`,icon:'${icon.replace(/'/g,"\\'")}'`:''}${kcfg}${(brandName.trim()||brandLink.trim())?`,branding:{text:'${brandName.trim().replace(/'/g,"\\'")}',link:'${brandLink.trim().replace(/'/g,"\\'")}'}`:`,branding:false`}};</script>`,
        `<script src='${base}/api/widget.js' async></script>`
      ].join("\n");
    }
    if (id === "iframe-minimal") {
      return [
        "<!-- Minimal iframe embed -->",
        `<iframe srcdoc="<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><style>body{font-family:sans-serif;font-size:14px;margin:0}.wrap{padding:10px}.msgs{padding:10px;height:36vh;overflow:auto;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;margin-bottom:8px}.m{max-width:80%;margin-bottom:8px;padding:8px 10px;border-radius:12px;white-space:pre-wrap}.m.u{background:#0ea5e9;color:#fff;margin-left:auto;border-bottom-right-radius:4px}.m.b{background:#e2e8f0;color:#0f172a;margin-right:auto;border-bottom-left-radius:4px}.inp{display:flex;gap:8px}.inp input{flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:10px}.inp button{padding:10px 14px;border:none;border-radius:10px;background:#111827;color:#fff;font-weight:600;cursor:pointer}</style></head><body><div class='wrap'><div class='msgs'></div><div class='inp'><input type='text' placeholder='Ask'><button>Send</button></div></div><script>(function(){var O='${org}',K='${k}',U='${base}/api/chat/stream/${botId}';function s(m,cb){var h={'Content-Type':'application/json'};if(K){h['X-Bot-Key']=K;}var b=JSON.stringify({message:m,org_id:O});fetch(U,{method:'POST',headers:h,body:b}).then(function(r){var rd=r.body.getReader();var d=new TextDecoder();function n(){rd.read().then(function(x){if(x.done){cb(null,true);return;}var t=d.decode(x.value);t.split(\\"\\n\\n\\").forEach(function(l){if(l.indexOf('data: ')==0){cb(l.slice(6),false);}});n();});}n();});}var msgs=document.querySelector('.msgs');var i=document.querySelector('.inp input');var go=document.querySelector('.inp button');function addU(m){var e=document.createElement('div');e.className='m u';e.textContent=m;msgs.appendChild(e);msgs.scrollTop=msgs.scrollHeight;}function addB(){var e=document.createElement('div');e.className='m b';msgs.appendChild(e);msgs.scrollTop=msgs.scrollHeight;return e;}function send(){var q=i.value;if(!q.trim()){return;}i.value='';addU(q);var bot=addB();s(q,function(tok,end){if(end){return;}bot.textContent+=tok;});}go.onclick=send;i.addEventListener('keydown',function(ev){if(ev.key==='Enter'){send();}})})();</script></body></html>" style="width:100%;min-height:280px;border:1px solid #e5e7eb;border-radius:8px"></iframe>`
      ].join("\n");
    }
    if (id === "cdn-default") {
      const base2 = B().replace(/\/$/, "");
      const kcfg = includeKey && pubKey ? `,botKey:'${pubKey}'` : '';
      return [
        "<!-- Default CDN widget: paste near end of body -->",
        `<script>window.chatbotConfig={botId:'${botId}',orgId:'${org}',apiBase:'${base2}'${kcfg}${botName?`,botName:'${botName.replace(/'/g,"\\'")}'`:''}${icon?`,icon:'${icon.replace(/'/g,"\\'")}'`:''}};</script>`,
        `<script src='${base2}/api/widget.js' async></script>`
      ].join("\n");
    }
    return "";
  }
  const displayCode = tpl ? buildTemplateCode(tpl) : withComments(finalSnippet);
  function buildTemplateSnippet(id: string): string {
    const base = B().replace(/\/$/, "");
    const k = includeKey && pubKey ? pubKey : "";
    if ((id === "bubble-blue" || id === "bubble-dark")) {
      const conf: Record<string, unknown> = {
        botId: botId,
        orgId: org,
        apiBase: base,
        mode: 'bubble',
        theme,
        position,
        accent,
        text: textColor,
        card: cardColor,
        bg: bgColor,
        botName,
        icon,
      };
      if (includeKey && pubKey) conf.botKey = pubKey;
      if ((brandName && brandName.trim()) || (brandLink && brandLink.trim())) {
        conf.branding = { text: brandName.trim(), link: brandLink.trim() };
      } else {
        conf.branding = false;
      }
      const json = JSON.stringify(conf).replace(/</g, "\\u003c");
      const srcdoc = [
        "<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"></head><body>",
        '<div id=\"cb-preview-placeholder\" style=\"padding:8px;font-family:system-ui,sans-serif;font-size:12px;color:#6b7280\">Loading preview...</div>',
        '<script>window.chatbotConfig='+json+';<\\/script>',
        '<script>setTimeout(function(){var ph=document.getElementById(\"cb-preview-placeholder\");if(ph){ph.textContent=\"Preview not loaded. Check backend URL and org id.\";}},1500);<\\/script>',
        '<script src="'+base+'/api/widget.js" async><\\/script>',
        '<script>(function(){setTimeout(function(){var has=document.querySelector(\".cb-btn,.cb-panel\");if(has) return;var C=window.chatbotConfig||{};var ACC=C.accent||\"#2563eb\";var wrap=document.createElement(\"div\");wrap.style.position=\"fixed\";wrap.style.bottom=\"24px\";wrap.style.right=\"24px\";wrap.style.zIndex=\"99999\";var btn=document.createElement(\"button\");btn.textContent=C.icon||\"💬\";btn.style.padding=\"12px 16px\";btn.style.borderRadius=\"999px\";btn.style.border=\"none\";btn.style.background=ACC;btn.style.color=\"#fff\";var panel=document.createElement(\"div\");panel.style.position=\"fixed\";panel.style.bottom=\"96px\";panel.style.right=\"24px\";panel.style.width=\"min(360px, calc(100vw - 48px))\";panel.style.maxHeight=\"70vh\";panel.style.display=\"block\";panel.style.boxShadow=\"0 8px 24px rgba(0,0,0,0.15)\";panel.style.borderRadius=\"12px\";panel.style.background=\"#fff\";panel.style.color=\"#111\";panel.style.padding=\"12px\";var msg=document.createElement(\"div\");msg.textContent=\"Preview fallback (widget not loaded)\";msg.style.fontFamily=\"system-ui,sans-serif\";msg.style.fontSize=\"12px\";msg.style.color=\"#6b7280\";panel.appendChild(msg);wrap.appendChild(btn);document.body.appendChild(wrap);document.body.appendChild(panel);},1200);})();<\\/script>',
        '</body></html>'
      ].join('');
      return "<iframe sandbox=\"allow-scripts allow-same-origin\" srcdoc=\""+srcdoc.replace(/\"/g,'&quot;')+"\" style=\"width:100%;min-height:540px;border:1px solid #e5e7eb;border-radius:8px\"></iframe>";
    }
    if (id === "bubble-blue") {
      const srcdoc = "<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><style>.cb-wrap{position:fixed;bottom:24px;right:24px;z-index:99999}.cb-btn{padding:12px 16px;border-radius:999px;border:none;background:#0ea5e9;color:#fff;box-shadow:0 10px 20px rgba(14,165,233,0.35);cursor:pointer}.cb-panel{position:fixed;bottom:96px;right:24px;width:min(360px,calc(100vw - 48px));max-height:70vh;display:none;box-shadow:0 16px 40px rgba(0,0,0,0.2);border-radius:16px;background:#fff;color:#0f172a;overflow:hidden;border:1px solid #e5e7eb}.cb-header{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:linear-gradient(90deg,#0ea5e9,#22d3ee);color:#fff}.cb-title{display:flex;align-items:center;gap:8px;font-weight:600}.cb-avatar{width:24px;height:24px;border-radius:999px;background:#fff;color:#0ea5e9;display:flex;align-items:center;justify-content:center;font-size:12px}.cb-messages{padding:12px;height:48vh;overflow:auto;background:#f8fafc}.cb-msg{max-width:80%;margin-bottom:8px;padding:8px 10px;border-radius:12px;font-size:14px;line-height:1.5;white-space:pre-wrap}.cb-msg.user{background:#0ea5e9;color:#fff;margin-left:auto;border-bottom-right-radius:4px}.cb-msg.bot{background:#e2e8f0;color:#0f172a;margin-right:auto;border-bottom-left-radius:4px}.cb-input{display:flex;gap:8px;padding:12px;border-top:1px solid #e5e7eb;background:#fff}.cb-input input{flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px}.cb-input button{padding:10px 14px;border:none;border-radius:10px;background:#0ea5e9;color:#fff;font-weight:600;cursor:pointer}.cb-close{border:none;background:transparent;color:#fff;font-size:18px;cursor:pointer}</style></head><body><div class='cb-wrap'></div><script>(function(){var B='"+botId+"',O='"+org+"',K='"+k+"',U='"+base+"/api/chat/stream/"+botId+"';function s(m,cb){var h={'Content-Type':'application/json'};if(K){h['X-Bot-Key']=K;}var b=JSON.stringify({message:m,org_id:O});fetch(U,{method:'POST',headers:h,body:b}).then(function(r){var rd=r.body.getReader();var d=new TextDecoder();function n(){rd.read().then(function(x){if(x.done){cb(null,true);return;}var t=d.decode(x.value);t.split('\\n\\n').forEach(function(l){if(l.indexOf('data: ')==0){cb(l.slice(6),false);}});n();});}n();});}function ui(){var w=document.querySelector('.cb-wrap');var b=document.createElement('button');b.className='cb-btn';b.textContent='Chat';var p=document.createElement('div');p.className='cb-panel';var h=document.createElement('div');h.className='cb-header';var t=document.createElement('div');t.className='cb-title';var av=document.createElement('div');av.className='cb-avatar';av.textContent='AI';var nm=document.createElement('span');nm.textContent='Assistant';t.appendChild(av);t.appendChild(nm);var x=document.createElement('button');x.className='cb-close';x.textContent='×';h.appendChild(t);h.appendChild(x);var msgs=document.createElement('div');msgs.className='cb-messages';var welcome=document.createElement('div');welcome.className='cb-msg bot';welcome.textContent='Hello! How can I help you today?';msgs.appendChild(welcome);var inp=document.createElement('div');inp.className='cb-input';var i=document.createElement('input');i.type='text';i.placeholder='Ask a question';var go=document.createElement('button');go.textContent='Send';inp.appendChild(i);inp.appendChild(go);p.appendChild(h);p.appendChild(msgs);p.appendChild(inp);w.appendChild(b);document.body.appendChild(p);function addUser(m){var e=document.createElement('div');e.className='cb-msg user';e.textContent=m;msgs.appendChild(e);msgs.scrollTop=msgs.scrollHeight;}function ensureBot(){var e=document.createElement('div');e.className='cb-msg bot';msgs.appendChild(e);msgs.scrollTop=msgs.scrollHeight;return e;}b.onclick=function(){p.style.display=p.style.display==='none'?'block':'none';};x.onclick=function(){p.style.display='none';};function send(){var q=i.value;if(!q.trim()){return;}i.value='';addUser(q);var bot=ensureBot();s(q,function(tok,end){if(end){return;}bot.textContent+=tok;});}go.onclick=send;i.addEventListener('keydown',function(ev){if(ev.key==='Enter'){send();}});}ui();})();</script></body></html>";
      return "<iframe sandbox=\"allow-scripts allow-same-origin\" srcdoc=\""+srcdoc
        .replace(/position:fixed/g,'position:absolute')
        .replace(/bottom:96px;/g,'top:72px;')
        .replace(/bottom:24px;/g,'top:12px;')
        .replace(/display:none;/g,'display:block;')
        .replace(/btn\.textContent='Chat';/g, `btn.textContent='${icon.replace(/'/g,"\\'")}';`)
        .replace(/av\.textContent='AI';/g, `av.textContent='${icon.replace(/'/g,"\\'")}';`)
        .replace(/document\.createTextNode\('Assistant'\)/g, `document.createTextNode('${botName.replace(/'/g,"\\'")}')`)
        .replace(/#0ea5e9/g, primaryColor)
        .replace(/border-radius:16px/g, 'border-radius:'+String(radius)+'px')
        .replace(/border-radius:12px/g, 'border-radius:'+String(Math.max(8, Math.min(24, radius-4)))+'px')
        .replace(/p\.appendChild\(msgs\);/g, `p.appendChild(msgs);var ft=document.createElement('div');ft.style.padding='8px 12px';ft.style.fontSize='11px';ft.style.color='#6b7280';ft.style.borderTop='1px solid #e5e7eb';ft.innerHTML='Powered by <a href=\\'${brandLink.replace(/'/g,"\\'" )}\\' target=\\'_blank\\' rel=\\'noopener noreferrer\\' style=\\'color:${primaryColor}\\'>'+${JSON.stringify(brandName)}+'</a>';p.appendChild(ft);`)
        .replace(/\"/g,'&quot;')+"\" style=\"width:100%;min-height:540px;border:1px solid #e5e7eb;border-radius:12px\"></iframe>";
    }
    if (id === "bubble-dark") {
      const srcdoc = "<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><style>body{background:#0f172a;color:#e5e7eb}.cb-wrap{position:fixed;bottom:24px;left:24px;z-index:99999}.cb-btn{padding:12px 16px;border-radius:12px;border:1px solid #334155;background:#111827;color:#e5e7eb;box-shadow:0 10px 20px rgba(2,6,23,0.5);cursor:pointer}.cb-panel{position:fixed;bottom:96px;left:24px;width:min(360px,calc(100vw - 48px));max-height:70vh;display:none;box-shadow:0 16px 40px rgba(2,6,23,0.7);border-radius:16px;background:#111827;color:#e5e7eb;overflow:hidden;border:1px solid #334155}.cb-header{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#0b1220;color:#e5e7eb;border-bottom:1px solid #334155}.cb-title{display:flex;align-items:center;gap:8px;font-weight:600}.cb-avatar{width:24px;height:24px;border-radius:999px;background:#334155;color:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:12px}.cb-messages{padding:12px;height:48vh;overflow:auto;background:#0b1220}.cb-msg{max-width:80%;margin-bottom:8px;padding:8px 10px;border-radius:12px;font-size:14px;line-height:1.5;white-space:pre-wrap}.cb-msg.user{background:#334155;color:#e5e7eb;margin-left:auto;border-bottom-right-radius:4px}.cb-msg.bot{background:#1f2937;color:#e5e7eb;margin-right:auto;border-bottom-left-radius:4px}.cb-input{display:flex;gap:8px;padding:12px;border-top:1px solid #334155;background:#111827}.cb-input input{flex:1;padding:10px;border:1px solid #334155;border-radius:10px;background:#0b1220;color:#e5e7eb;font-size:14px}.cb-input button{padding:10px 14px;border:1px solid #334155;border-radius:10px;background:#0b1220;color:#e5e7eb;font-weight:600;cursor:pointer}.cb-close{border:none;background:transparent;color:#e5e7eb;font-size:18px;cursor:pointer}</style></head><body><div class='cb-wrap'></div><script>(function(){var B='"+botId+"',O='"+org+"',K='"+k+"',U='"+base+"/api/chat/stream/"+botId+"';function s(m,cb){var h={'Content-Type':'application/json'};if(K){h['X-Bot-Key']=K;}var b=JSON.stringify({message:m,org_id:O});fetch(U,{method:'POST',headers:h,body:b}).then(function(r){var rd=r.body.getReader();var d=new TextDecoder();function n(){rd.read().then(function(x){if(x.done){cb(null,true);return;}var t=d.decode(x.value);t.split('\\n\\n').forEach(function(l){if(l.indexOf('data: ')==0){cb(l.slice(6),false);}});n();});}n();});}function ui(){var w=document.querySelector('.cb-wrap');var b=document.createElement('button');b.className='cb-btn';b.textContent='Chat';var p=document.createElement('div');p.className='cb-panel';var h=document.createElement('div');h.className='cb-header';var t=document.createElement('div');t.className='cb-title';var av=document.createElement('div');av.className='cb-avatar';av.textContent='AI';var nm=document.createElement('span');nm.textContent='Assistant';t.appendChild(av);t.appendChild(nm);var x=document.createElement('button');x.className='cb-close';x.textContent='×';h.appendChild(t);h.appendChild(x);var msgs=document.createElement('div');msgs.className='cb-messages';var welcome=document.createElement('div');welcome.className='cb-msg bot';welcome.textContent='Hello! How can I help you today?';msgs.appendChild(welcome);var inp=document.createElement('div');inp.className='cb-input';var i=document.createElement('input');i.type='text';i.placeholder='Ask a question';var go=document.createElement('button');go.textContent='Send';inp.appendChild(i);inp.appendChild(go);p.appendChild(h);p.appendChild(msgs);p.appendChild(inp);w.appendChild(b);document.body.appendChild(p);function addUser(m){var e=document.createElement('div');e.className='cb-msg user';e.textContent=m;msgs.appendChild(e);msgs.scrollTop=msgs.scrollHeight;}function ensureBot(){var e=document.createElement('div');e.className='cb-msg bot';msgs.appendChild(e);msgs.scrollTop=msgs.scrollHeight;return e;}b.onclick=function(){p.style.display=p.style.display==='none'?'block':'none';};x.onclick=function(){p.style.display='none';};function send(){var q=i.value;if(!q.trim()){return;}i.value='';addUser(q);var bot=ensureBot();s(q,function(tok,end){if(end){return;}bot.textContent+=tok;});}go.onclick=send;i.addEventListener('keydown',function(ev){if(ev.key==='Enter'){send();}});}ui();})();</script></body></html>";
      return "<iframe sandbox=\"allow-scripts allow-same-origin\" srcdoc=\""+srcdoc
        .replace(/position:fixed/g,'position:absolute')
        .replace(/bottom:96px;/g,'top:72px;')
        .replace(/bottom:24px;/g,'top:12px;')
        .replace(/display:none;/g,'display:block;')
        .replace(/btn\.textContent='Chat';/g, `btn.textContent='${icon.replace(/'/g,"\\'")}';`)
        .replace(/av\.textContent='AI';/g, `av.textContent='${icon.replace(/'/g,"\\'")}';`)
        .replace(/document\.createTextNode\('Assistant'\)/g, `document.createTextNode('${botName.replace(/'/g,"\\'")}')`)
        .replace(/p\.appendChild\(msgs\);/g, `p.appendChild(msgs);var ft=document.createElement('div');ft.style.padding='8px 12px';ft.style.fontSize='11px';ft.style.color='#94a3b8';ft.style.borderTop='1px solid #334155';ft.innerHTML='Powered by <a href=\\'${brandLink.replace(/'/g,"\\'" )}\\' target=\\'_blank\\' rel=\\'noopener noreferrer\\' style=\\'color:${primaryColor}\\'>'+${JSON.stringify(brandName)}+'</a>';p.appendChild(ft);`)
        .replace(/\"/g,'&quot;')+"\" style=\"width:100%;min-height:540px;border:1px solid #334155;border-radius:12px\"></iframe>";
    }
    if (id === "inline-card") {
      const srcdoc = "<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><style>body{background:#f8fafc}.card{max-width:560px;margin:24px auto;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 12px 28px rgba(0,0,0,0.08);overflow:hidden;background:#fff}.head{display:flex;align-items:center;gap:8px;padding:12px;background:#111827;color:#fff}.av{width:24px;height:24px;border-radius:999px;background:#fff;color:#111827;display:flex;align-items:center;justify-content:center;font-size:12px}.msgs{padding:12px;height:40vh;overflow:auto;background:#f9fafb}.m{max-width:80%;margin-bottom:8px;padding:8px 10px;border-radius:12px;font-size:14px;line-height:1.5;white-space:pre-wrap}.m.u{background:#111827;color:#fff;margin-left:auto;border-bottom-right-radius:4px}.m.b{background:#e2e8f0;color:#0f172a;margin-right:auto;border-bottom-left-radius:4px}.inp{display:flex;gap:8px;padding:12px;border-top:1px solid #e5e7eb;background:#fff}.inp input{flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px}.inp button{padding:10px 14px;border:none;border-radius:10px;background:#111827;color:#fff;font-weight:600;cursor:pointer}</style></head><body><div class='card'><div class='head'><div class='av'>AI</div><div>Assistant</div></div><div class='msgs'></div><div class='inp'><input type='text' placeholder='Ask a question'><button>Send</button></div></div><script>(function(){var O='"+org+"',K='"+k+"',U='"+base+"/api/chat/stream/"+botId+"';function s(m,cb){var h={'Content-Type':'application/json'};if(K){h['X-Bot-Key']=K;}var b=JSON.stringify({message:m,org_id:O});fetch(U,{method:'POST',headers:h,body:b}).then(function(r){var rd=r.body.getReader();var d=new TextDecoder();function n(){rd.read().then(function(x){if(x.done){cb(null,true);return;}var t=d.decode(x.value);t.split('\\n\\n').forEach(function(l){if(l.indexOf('data: ')==0){cb(l.slice(6),false);}});n();});}n();});}var c=document.querySelector('.card');var msgs=document.querySelector('.msgs');var i=c.querySelector('input');var go=c.querySelector('button');function addU(m){var e=document.createElement('div');e.className='m u';e.textContent=m;msgs.appendChild(e);msgs.scrollTop=msgs.scrollHeight;}function addB(){var e=document.createElement('div');e.className='m b';msgs.appendChild(e);msgs.scrollTop=msgs.scrollHeight;return e;}function send(){var q=i.value;if(!q.trim()){return;}i.value='';addU(q);var bot=addB();s(q,function(tok,end){if(end){return;}bot.textContent+=tok;});}go.onclick=send;i.addEventListener('keydown',function(ev){if(ev.key==='Enter'){send();}});})();</script></body></html>";
      return "<iframe srcdoc=\""+srcdoc.replace(/max-width:560px;/g,'width:min(560px,calc(100vw - 32px));max-width:560px;').replace(/c\.appendChild\(card\);/g, `c.appendChild(card);var ft=document.createElement('div');ft.style.margin='0 24px';ft.style.padding='8px 0';ft.style.fontSize='11px';ft.style.color='#6b7280';ft.style.textAlign='right';ft.innerHTML='Powered by <a href=\\'${brandLink.replace(/'/g,"\\'")}\\' target=\\'_blank\\' rel=\\'noopener noreferrer\\' style=\\'color:${primaryColor}\\'>${brandName.replace(/'/g,"\\'")}</a>';c.appendChild(ft);`).replace(/\"/g,'&quot;')+"\" style=\"width:100%;min-height:340px;border:1px solid #e5e7eb;border-radius:16px\"></iframe>";
    }
    if (id === "iframe-minimal") {
      const srcdoc = "<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><style>body{font-family:sans-serif;font-size:14px;margin:0}.wrap{padding:10px}.msgs{padding:10px;height:36vh;overflow:auto;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;margin-bottom:8px}.m{max-width:80%;margin-bottom:8px;padding:8px 10px;border-radius:12px;white-space:pre-wrap}.m.u{background:#0ea5e9;color:#fff;margin-left:auto;border-bottom-right-radius:4px}.m.b{background:#e2e8f0;color:#0f172a;margin-right:auto;border-bottom-left-radius:4px}.inp{display:flex;gap:8px}.inp input{flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:10px}.inp button{padding:10px 14px;border:none;border-radius:10px;background:#111827;color:#fff;font-weight:600;cursor:pointer}</style></head><body><div class='wrap'><div class='msgs'></div><div class='inp'><input type='text' placeholder='Ask'><button>Send</button></div></div><script>(function(){var O='"+org+"',K='"+k+"',U='"+base+"/api/chat/stream/"+botId+"';function s(m,cb){var h={'Content-Type':'application/json'};if(K){h['X-Bot-Key']=K;}var b=JSON.stringify({message:m,org_id:O});fetch(U,{method:'POST',headers:h,body:b}).then(function(r){var rd=r.body.getReader();var d=new TextDecoder();function n(){rd.read().then(function(x){if(x.done){cb(null,true);return;}var t=d.decode(x.value);t.split('\\n\\n').forEach(function(l){if(l.indexOf('data: ')==0){cb(l.slice(6),false);}});n();});}n();});}var msgs=document.querySelector('.msgs');var i=document.querySelector('.inp input');var go=document.querySelector('.inp button');function addU(m){var e=document.createElement('div');e.className='m u';e.textContent=m;msgs.appendChild(e);msgs.scrollTop=msgs.scrollHeight;}function addB(){var e=document.createElement('div');e.className='m b';msgs.appendChild(e);msgs.scrollTop=msgs.scrollHeight;return e;}function send(){var q=i.value;if(!q.trim()){return;}i.value='';addU(q);var bot=addB();s(q,function(tok,end){if(end){return;}bot.textContent+=tok;});}go.onclick=send;i.addEventListener('keydown',function(ev){if(ev.key==='Enter'){send();}});})();</script></body></html>";
      return "<iframe srcdoc=\""+srcdoc.replace(/\"/g,'&quot;')+"\" style=\"width:100%;min-height:280px;border:1px solid #e5e7eb;border-radius:8px\"></iframe>";
    }
    if (id === "cdn-default") {
      const base2 = B().replace(/\/$/, "");
      const conf: Record<string, unknown> = {
        botId: botId,
        orgId: org,
        apiBase: base2,
        mode: 'bubble',
        theme,
        position,
        accent,
        text: textColor,
        card: cardColor,
        bg: bgColor,
        botName,
        icon,
      };
      if (includeKey && pubKey) conf.botKey = pubKey;
      if ((brandName && brandName.trim()) || (brandLink && brandLink.trim())) {
        conf.branding = { text: brandName.trim(), link: brandLink.trim() };
      } else {
        conf.branding = false;
      }
      const json = JSON.stringify(conf).replace(/</g, "\\u003c");
      const srcdoc = [
        "<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"></head><body>",
        '<div id=\"cb-preview-placeholder\" style=\"padding:8px;font-family:system-ui,sans-serif;font-size:12px;color:#6b7280\">Loading preview...</div>',
        '<script>window.chatbotConfig='+json+';<\\/script>',
        '<script>setTimeout(function(){var ph=document.getElementById(\"cb-preview-placeholder\");if(ph){ph.textContent=\"Preview unavailable. Set NEXT_PUBLIC_BACKEND_URL to backend URL.\";}},1500);<\\/script>',
        '<script src=\"'+base2+'/api/widget.js\" async><\\/script>',
        '</body></html>'
      ].join('');
      return "<iframe srcdoc=\""+srcdoc.replace(/\"/g,'&quot;')+"\" style=\"width:100%;min-height:540px;border:1px solid #e5e7eb;border-radius:8px\"></iframe>";
    }
    return "";
  }
  
  function formatJSBlock(tt: string): string {
    const js = tt
      .replace(/;\s*/g, ";\n")
      .replace(/\}\s*/g, "}\n")
      .replace(/\{\s*/g, "{\n");
    const lines = js.split("\n");
    let indent = 0;
    const out: string[] = [];
    for (const line of lines) {
      const l = line.trim();
      if (!l) { out.push(""); continue; }
      if (l.startsWith("}")) indent = Math.max(0, indent - 1);
      out.push(`${"  ".repeat(indent)}${l}`);
      if (l.endsWith("{")) indent++;
    }
    return out.join("\n");
  }
  function formatSnippet(s: string): string {
    let t = (s ?? "").toString();
    t = t.replace(/\r\n?/g, "\n");
    if (!/\n/.test(t) && /\\n/.test(t)) {
      t = t.replace(/\\n/g, "\n").replace(/\\t/g, "  ");
    }
    const tt = t.trim();
    if (!tt) return "";
    if (tt.startsWith("{") || tt.startsWith("[")) {
      try { return JSON.stringify(JSON.parse(tt), null, 2); } catch { /* fall through */ }
    }
    if (/<[a-zA-Z!\/?]/.test(tt)) {
      const withScript = tt.replace(/<script>([\s\S]*?)<\/script>/g, (_m, js) => {
        return `<script>\n${formatJSBlock(js)}\n<\/script>`;
      });
      const parts = withScript.replace(/>\s*</g, ">\n<").split("\n");
      let indent = 0;
      const out: string[] = [];
      for (const raw of parts) {
        const l = raw.trim();
        const isClose = /^<\//.test(l);
        const isSelf = /\/>$/.test(l) || /^<!/.test(l) || /^<\?/.test(l);
        if (isClose) indent = Math.max(0, indent - 1);
        out.push(`${"  ".repeat(indent)}${l}`);
        if (!isClose && !isSelf && /^<[^>]+>$/.test(l)) indent++;
      }
      return out.join("\n");
    }
    return formatJSBlock(tt);
  }
  function highlightCode(s: string): string {
    function esc(x: string): string {
      return x.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    const t0 = esc(s || "");
    if (/<[a-z]/i.test(t0)) {
      let h = t0;
      h = h.replace(/(&lt;\/?)([a-zA-Z0-9:-]+)([^>]*?)(>)/g, function(_: string, a: string, tag: string, rest: string, b: string) {
        const tagC = `<span style=\"color:#60a5fa\">${tag}</span>`;
        const restC = rest.replace(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)(=)/g, function(__: string, n: string, eq: string) {
          return `<span style=\"color:#34d399\">${n}</span>${eq}`;
        }).replace(/(&quot;[^&]*?&quot;)/g, function(m: string) { return `<span style=\"color:#fca5a5\">${m}</span>`; });
        return `${a}${tagC}${restC}${b}`;
      });
      return h;
    }
    let h = t0;
    h = h.replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#6b7280">$1</span>');
    h = h.replace(/(^|\n)(\s*\/\/.*)/g, '$1<span style="color:#6b7280">$2</span>');
    h = h.replace(/([\'\"])(?:\\.|(?!\1).)*\1/g, function(m: string) { return `<span style=\"color:#fca5a5\">${m}</span>`; });
    h = h.replace(/`(?:\\.|[^`\\])*`/g, function(m: string) { return `<span style=\"color:#fca5a5\">${m}</span>`; });
    h = h.replace(/\b(?:var|let|const|function|return|if|else|for|while|new|class|try|catch|finally|switch|case|break|continue|import|from|export|default|await|async|typeof|in|instanceof)\b/g, '<span style="color:#93c5fd">$&</span>');
    h = h.replace(/\b(?:true|false|null|undefined)\b/g, '<span style="color:#fcd34d">$&</span>');
    h = h.replace(/\b\d+(?:\.\d+)?\b/g, '<span style="color:#fcd34d">$&</span>');
    return h;
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Embed Chatbot</h1>
          <p className="text-sm text-black/60">Choose a type and template. Copy the commented code on the left and preview on the right.</p>
        </div>
        <div className="text-xs text-black/60">Last rotated: {rotatedAt ? new Date(rotatedAt).toLocaleString() : "Not set"}</div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-black/10 bg-white">
          <div className="p-4 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm">Embed Type</label>
              <select value={widget} onChange={e=>{setWidget(e.target.value); setTpl('');}} className="px-3 py-2 rounded-md border border-black/10 text-sm">
                <option value="bubble">Bubble</option>
                <option value="iframe">Iframe</option>
                <option value="cdn">CDN</option>
              </select>
              <label className="text-sm">Template</label>
              <select value={tpl} onChange={e=>setTpl(e.target.value)} className="px-3 py-2 rounded-md border border-black/10 text-sm">
                <option value="">None</option>
                <option value="bubble-blue">Bubble • Blue</option>
                <option value="bubble-dark">Bubble • Dark</option>
                <option value="iframe-minimal">Iframe • Minimal</option>
                <option value="cdn-default">CDN • Default</option>
              </select>
              <input value={botName} onChange={e=>setBotName(e.target.value)} placeholder="Bot name" className="px-3 py-2 rounded-md border border-black/10 text-sm w-36" />
              <input value={icon} onChange={e=>setIcon(e.target.value)} placeholder="Icon" className="px-3 py-2 rounded-md border border-black/10 text-sm w-20" />
              <select value={theme} onChange={e=>setTheme(e.target.value as ("light"|"dark"))} className="px-3 py-2 rounded-md border border-black/10 text-sm">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
              <select value={position} onChange={e=>setPosition(e.target.value as ("right"|"left"))} className="px-3 py-2 rounded-md border border-black/10 text-sm">
                <option value="right">Right</option>
                <option value="left">Left</option>
              </select>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-black/60">Accent</span>
                <input type="color" value={accent} onChange={e=>setAccent(e.target.value)} className="w-10 h-8 border border-black/10 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-black/60">Text</span>
                <input type="color" value={textColor} onChange={e=>setTextColor(e.target.value)} className="w-10 h-8 border border-black/10 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-black/60">Card</span>
                <input type="color" value={cardColor} onChange={e=>setCardColor(e.target.value)} className="w-10 h-8 border border-black/10 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-black/60">Background</span>
                <input type="color" value={bgColor} onChange={e=>setBgColor(e.target.value)} className="w-10 h-8 border border-black/10 rounded" />
              </div>
              <input type="number" min={8} max={24} value={radius} onChange={e=>setRadius(parseInt(e.target.value||'16'))} className="px-2 py-2 rounded-md border border-black/10 text-sm w-20" />
              <input value={brandName} onChange={e=>setBrandName(e.target.value)} placeholder="Brand" className="px-3 py-2 rounded-md border border-black/10 text-sm w-28" />
              <input value={brandLink} onChange={e=>setBrandLink(e.target.value)} placeholder="Brand link" className="px-3 py-2 rounded-md border border-black/10 text-sm w-56" />
              <label className="text-sm flex items-center gap-2">
                <input type="checkbox" checked={includeKey} onChange={e=>setIncludeKey(e.target.checked)} /> Include public key
              </label>
          <button onClick={() => { if (displayCode) copy(formatSnippet(displayCode)); }} className="px-3 py-2 rounded-md bg-blue-600 text-white" disabled={!snippet}>{copied?"Copied":"Copy"}</button>
            </div>
            <div className="rounded-md border border-black/10">
              <div className="flex items-center justify-between px-3 py-2 border-b border-black/10">
                <span className="text-xs text-black/60">Embed Code</span>
                <button onClick={() => copy(formatSnippet(displayCode))} className="px-2 py-1 rounded bg-black/80 text-white text-xs" disabled={!snippet}>{copied?"Copied":"Copy"}</button>
              </div>
              {(() => { const codeText = formatSnippet(displayCode); const lines = codeText.split("\n"); const highlighted = highlightCode(codeText); return (
                <div className="bg-[#0b1220] text-[#e5e7eb]">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-[#142036]">
                    <div className="text-xs text-[#93a4b8]">snippet.js</div>
                    <div className="text-xs text-[#93a4b8]">UTF-8</div>
                  </div>
                  <div className="grid grid-cols-[48px_1fr] text-xs font-mono max-h-[540px] overflow-auto">
                    <div className="select-none text-[#5b6b7f] border-r border-[#142036] p-3 pr-0">
                      {lines.map((_, i) => (<div key={i} className="leading-5">{i+1}</div>))}
                    </div>
                    <pre className="whitespace-pre-wrap break-words p-3" dangerouslySetInnerHTML={{ __html: highlighted }} />
                  </div>
                </div>
              ); })()}
            </div>
            <div className="rounded-md border border-black/10 p-3 text-xs space-y-1">
              <div className="font-medium">How to preview</div>
              <div>1) Ensure the backend is running at {B() || ''}.</div>
              <div>2) Select a template (Bubble, Inline, CDN).</div>
              <div>3) Adjust colors and position; the preview updates live.</div>
              <div>4) Copy the code and paste near the end of your site’s <code>&lt;body&gt;</code>.</div>
            </div>
            <div className="rounded-md border border-yellow-300 bg-yellow-50 text-yellow-900 p-3 text-xs">
              If you rotate the public API key, include the new value as <span className="font-medium">botKey</span>.
            </div>
            <div className="rounded-md border border-black/10">
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-black/60">Current bot key</span>
                  <span className="text-xs text-black/60">Last rotated: {rotatedAt ? new Date(rotatedAt).toLocaleString() : "Not set"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input readOnly value={pubKey || ""} placeholder="No key" className="px-3 py-2 rounded-md border border-black/10 w-full text-sm" />
                  <button onClick={async()=>{ const k = pubKey || ""; if(!k) return; await copy(k); }} className="px-3 py-2 rounded-md bg-black/80 text-white text-sm">Copy</button>
                </div>
                <div className="text-xs text-black/60">Paste as <span className="font-medium">botKey</span> in your embed config.</div>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-black/10 bg-white">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-black/60">Template Preview</span>
            </div>
            {tpl ? (
              /^<iframe /.test(buildTemplateSnippet(tpl)) ? (
                <div className="rounded-md border border-black/10 overflow-hidden flex items-start">
                  <div className="w-full min-h-[540px]" dangerouslySetInnerHTML={{ __html: buildTemplateSnippet(tpl) }} />
                </div>
              ) : (
                <div className="text-xs text-black/60">No live preview for this type.</div>
              )
            ) : (
              <div className="text-xs text-black/60">Select a template to preview.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
