const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
const money=v=>"৳"+Number(v||0).toLocaleString("en-BD");
const api="/api";

function shell(){
  document.getElementById("site-header").innerHTML=`<header class="site-header"><div class="container nav-wrap"><a class="brand" href="/"><img src="/assets/images/logo.png" alt="Luminesse Beauty"><span><strong>Luminesse</strong><small>BEAUTY</small></span></a><nav class="nav"><a href="/">ওয়েবসাইট দেখুন</a><a href="/shop.html">শপ</a></nav></div></header>`;
  document.getElementById("site-footer").innerHTML=`<footer class="footer"><div class="container footer-bottom"><span>Luminesse Beauty Admin</span><span>Making Beauty personal • সৌন্দর্য হোক আপনার মতো</span></div></footer>`;
}

async function login(){
  document.getElementById("admin-app").innerHTML=`<section class="admin-auth"><div class="auth-card"><img src="/assets/images/logo.png" alt="Luminesse Beauty"><p class="eyebrow">STORE ADMIN</p><h1>Welcome back</h1><p class="auth-bn">আপনার বিউটি শপকে সহজে ম্যানেজ করুন।</p><div id="err"></div><form id="login"><label>Admin password<input id="pw" type="password" required autocomplete="current-password" placeholder="আপনার অ্যাডমিন পাসওয়ার্ড"></label><button class="btn btn-dark btn-wide">Sign in</button></form><p class="microcopy">নিরাপদ লগইনের জন্য পাসওয়ার্ড Netlify environment variable-এ রাখা হয়।</p></div></section>`;
  document.getElementById("login").onsubmit=async e=>{
    e.preventDefault();
    const btn=e.target.querySelector("button"); btn.disabled=true; btn.textContent="Signing in…";
    try{
      const r=await fetch(api+"/auth",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",cache:"no-store",body:JSON.stringify({password:document.getElementById("pw").value})});
      const x=await r.json().catch(()=>({}));
      if(!r.ok) throw new Error(x.error||`Login failed (${r.status})`);
      await dashboard();
    }catch(err){document.getElementById("err").innerHTML=`<div class="alert">${esc(err.message)}</div>`;}
    finally{btn.disabled=false;btn.textContent="Sign in";}
  };
}

async function products(){
  const r=await fetch(api+"/products",{credentials:"same-origin",cache:"no-store"});
  if(r.status===401){login();return null}
  const x=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(x.error||`Products API error (${r.status})`);
  return x;
}

async function dashboard(){
  const data=await products(); if(!data)return;
  document.getElementById("admin-app").innerHTML=`<section class="admin-wrap"><div class="container narrow"><div class="admin-top"><div><p class="eyebrow">STORE MANAGEMENT</p><h1>Products</h1><p class="muted">পণ্য, ছবি, দাম, স্টক ও বর্ণনা এক জায়গা থেকে ম্যানেজ করুন।</p></div><div><button id="add" class="btn btn-dark">+ Add product</button> <button id="logout" class="btn btn-light">Logout</button></div></div><div class="admin-tip">✨ নতুন পণ্য যোগ করুন, ছবি আপলোড করুন এবং Save করলেই সেটি শপে প্রকাশিত হবে।</div><div id="content"></div></div></section>`;
  document.getElementById("logout").onclick=async()=>{const b=document.getElementById("logout");b.disabled=true;b.textContent="Logging out…";try{await fetch(api+"/logout",{method:"POST",credentials:"same-origin",cache:"no-store"});}finally{location.reload();}};
  document.getElementById("add").onclick=()=>form(); renderTable(data);
}

function renderTable(data){
  document.getElementById("content").innerHTML=`<div class="admin-table"><table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead><tbody>${data.map(p=>`<tr><td><div class="table-product"><img loading="lazy" src="${esc(p.image_url||'/assets/images/logo.png')}" alt="${esc(p.name)}"><span>${esc(p.name)}</span></div></td><td>${esc(p.category)}</td><td>${money(p.price)}</td><td>${p.stock}</td><td>${p.is_active?'Active':'Hidden'}</td><td><button class="link-btn" data-edit="${p.id}">Edit</button><button class="link-btn danger" data-del="${p.id}">Delete</button></td></tr>`).join("")||'<tr><td colspan="6">No products yet.</td></tr>'}</tbody></table></div>`;
  document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>form(data.find(p=>p.id===b.dataset.edit)));
  document.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>del(b.dataset.del));
}

async function del(id){
  if(!confirm("এই পণ্যটি মুছে ফেলবেন?"))return;
  const r=await fetch(api+"/products",{method:"DELETE",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
  if(!r.ok){alert("Delete failed");return} dashboard();
}

function form(p){
  document.getElementById("content").innerHTML=`<form id="pf" class="admin-form"><div class="admin-top"><div><p class="eyebrow">${p?'EDIT':'NEW'} PRODUCT</p><h2>${p?'Edit':'Add'} product</h2></div><button type="button" id="back" class="btn btn-light">← Back</button></div><label>Product name<input name="name" required value="${esc(p?.name||"")}" placeholder="যেমন: Velvet Matte Lipstick"></label><div class="two-col"><label>Category<select name="category"><option value="lipsticks" ${p?.category==='lipsticks'?'selected':''}>Lipsticks</option><option value="skincare" ${p?.category==='skincare'?'selected':''}>Skincare</option><option value="beauty" ${p?.category==='beauty'?'selected':''}>Beauty Essentials</option></select></label><label>Price (BDT)<input name="price" type="number" min="0" step="1" required value="${p?.price??''}"></label></div><div class="two-col"><label>Stock<input name="stock" type="number" min="0" step="1" required value="${p?.stock??0}"></label><label>Product image<input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif"><span class="file-note">JPG/PNG/WebP/GIF • সর্বোচ্চ 4MB</span></label></div><label>Description<textarea name="description" rows="5" placeholder="পণ্যের সংক্ষিপ্ত বর্ণনা লিখুন…">${esc(p?.description||"")}</textarea></label><label class="check-row"><input name="is_featured" type="checkbox" ${p?.is_featured?'checked':''}> Featured product</label><label class="check-row"><input name="is_active" type="checkbox" ${p?.is_active!==false?'checked':''}> Visible on shop</label>${p?.image_url?`<div><p class="file-note">Current image:</p><img class="preview" loading="lazy" src="${esc(p.image_url)}" alt="Current product image"></div>`:''}<button class="btn btn-dark btn-wide">${p?'Save changes':'Upload product'}</button><div id="saveerr"></div></form>`;
  document.getElementById("back").onclick=dashboard;
  document.getElementById("pf").onsubmit=async e=>{
    e.preventDefault();const btn=e.target.querySelector("button[type=submit]");btn.disabled=true;btn.textContent=p?"Saving…":"Uploading…";
    const fd=new FormData(e.target);fd.set("is_featured",e.target.is_featured.checked?'true':'false');fd.set("is_active",e.target.is_active.checked?'true':'false');if(p)fd.set('id',p.id);
    try{const r=await fetch(api+"/products",{method:p?'PUT':'POST',credentials:'same-origin',body:fd});const x=await r.json().catch(()=>({}));if(!r.ok)throw new Error(x.error||"Upload failed");await dashboard();}catch(err){document.getElementById('saveerr').innerHTML=`<div class="alert">${esc(err.message)}</div>`;btn.disabled=false;btn.textContent=p?'Save changes':'Upload product';}
  };
}

shell();
(async()=>{
  try{
    const r=await fetch(api+"/auth",{credentials:"same-origin",cache:"no-store"});
    const state=await r.json().catch(()=>({authenticated:false}));
    if(state.authenticated) await dashboard(); else login();
  }catch(e){
    document.getElementById("admin-app").innerHTML='<section class="admin-auth"><div class="auth-card"><p class="eyebrow">BACKEND CHECK</p><h1>Netlify setup needed</h1><div class="alert">The Netlify backend is not reachable. Make sure the project is deployed from GitHub with the <b>netlify/functions</b> folder and the Netlify Functions directory is set to <b>netlify/functions</b>.</div><button class="btn btn-dark btn-wide" onclick="location.reload()">Try again</button></div></section>';
  }
})();
