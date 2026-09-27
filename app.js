(() => {
  'use strict';
  const app = document.querySelector('#app'), dialog = document.querySelector('dialog');
  let data, filter = 'featured', category = 'All', unlockAction, pending = false;
  const unlocked = new Map();
  const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const imageURL = s => /^(assets\/[^\s]+|data:image\/(png|jpeg|webp|gif);base64,[a-z\d+/=]+)$/i.test(s || '') ? s : 'assets/work-1.svg';
  const img = (src, alt, lazy = true) => `<img src="${e(imageURL(src))}" alt="${e(alt)}" ${lazy ? 'loading="lazy"' : ''}>`;
  function ask(action, site = false) {
    unlockAction = action; document.querySelector('#password-form').reset();
    document.querySelector('#password-error').textContent = '';
    document.querySelector('#password-description').textContent = site ? '비밀번호를 입력하면 포트폴리오를 볼 수 있습니다.' : '비밀번호를 입력하면 프로젝트를 볼 수 있습니다.';
    dialog.showModal(); document.querySelector('#password').focus();
  }
  document.querySelector('.dialog-close').onclick = () => dialog.close();
  dialog.addEventListener('close', () => { document.querySelector('#password').value = ''; unlockAction = null; });
  document.querySelector('#password-form').onsubmit = async event => {
    event.preventDefault(); if (pending) return;
    pending = true; const button = event.target.querySelector('[type=submit]'); button.disabled = true;
    const action = unlockAction;
    try { await action(document.querySelector('#password').value); dialog.close(); }
    catch { document.querySelector('#password-error').textContent = '비밀번호가 올바르지 않거나 파일을 열 수 없습니다. 다시 시도해 주세요.'; }
    finally { pending = false; button.disabled = false; }
  };
  function gate() {
    app.innerHTML = '<main class="gate"><span class="eyebrow">PERSONAL PORTFOLIO</span><h1>Welcome.</h1><div><h2>A private collection<br>of selected works.</h2><button id="enter">Enter portfolio ↗</button></div><span class="eyebrow">PASSWORD REQUIRED</span></main>';
    document.querySelector('#enter').onclick = () => ask(async password => { data = await PortfolioCrypto.open(window.PORTFOLIO_DATA, password); render(); }, true);
  }
  function card(p) { return `<button class="card" data-project="${e(p.id)}"><div class="visual">${p.encrypted ? '<span class="lock-cover" aria-label="비공개">↗</span>' : img(p.cover,p.title)}</div><span class="caption"><span>${e(p.title)}<span class="category">${e(p.category)} · ${e(p.year)}</span></span><span class="arrow">${p.encrypted ? '⌑' : '↗'}</span></span></button>`; }
  function render() {
    if (!data) return gate();
    const path = location.hash.slice(1).split('/');
    const section = ['about','works','more'].includes(path[0]) ? path[0] : '';
    const project = section === 'works' && path[1] ? data.projects.find(p => p.id === path[1]) : null;
    app.innerHTML = `<main id="workspace" tabindex="-1" class="workspace ${section ? 'expanded' : ''}">
      <section class="panel about ${section==='about'?'active':''}" aria-label="About"><div class="portrait">${img(data.portrait,`${data.name} — portrait placeholder`,false)}</div><header class="panel-head"><h1><a href="#about">${e(data.name)}</a></h1><a class="close-panel" href="#">Close ×</a></header><p class="intro">${e(data.intro).replace(/\n/g,'<br>')}</p><div class="contact"><div><strong>Based in</strong><p>${e(data.location)}</p></div><div><strong>Connect</strong>${data.email ? `<a href="mailto:${e(data.email)}">${e(data.email)} ↗</a>` : '<p>Contact coming soon</p>'}</div><div><strong>Follow</strong>${/^https:\/\/www\.instagram\.com\//.test(data.instagram) ? `<a target="_blank" rel="noopener noreferrer" href="${e(data.instagram)}">Instagram ↗</a>` : '<p>Independent<br>Designer</p>'}</div></div></section>
      <section class="panel works ${section==='works'?'active':''}" aria-label="Works"><header class="panel-head"><h2><a href="#works">Works</a></h2><a class="close-panel" href="#">Close ×</a></header><div id="works-body"></div></section>
      <section class="panel more ${section==='more'?'active':''}" aria-label="More"><header class="panel-head"><h2><a href="#more">More</a></h2><a class="close-panel" href="#">Close ×</a></header><div class="more-image">${img('assets/work-6.svg','Object study placeholder')}</div><p class="more-tagline">${e(data.tagline).replace(/\n/g,'<br>')}</p><div class="more-links">${data.notes.map((n,i)=>`<button data-note="${i}">${e(n.title)}</button><p id="note-${i}" hidden style="font-size:18px;line-height:1.6;padding-bottom:24px">${e(n.text)}</p>`).join('')}</div></section>
      </main><footer class="page-footer"><span>SELECTED WORKS / ${new Date().getFullYear()}</span><span>Objects, spaces & everything in between.</span><button id="relock">Lock session ↗</button></footer>`;
    document.querySelectorAll('[data-note]').forEach(b => b.onclick = () => { const p = document.querySelector(`#note-${b.dataset.note}`); p.hidden = !p.hidden; b.setAttribute('aria-expanded', String(!p.hidden)); });
    document.querySelector('#relock').onclick = () => { unlocked.clear(); if(window.PORTFOLIO_DATA.encrypted) data = null; render(); };
    if(project) showProject(project); else if(path[1] && section === 'works') document.querySelector('#works-body').innerHTML='<p class="empty">프로젝트를 찾을 수 없습니다. <a href="#works">작업 목록으로 돌아가기 ↗</a></p>'; else showGrid();
  }
  function showGrid() {
    const categories = [...new Set(data.projects.map(p=>p.category))];
    const projects = data.projects.filter(p => (filter === 'archive' || p.featured) && (category==='All' || p.category === category));
    document.querySelector('#works-body').innerHTML = `<div class="filter-bar"><div class="tabs"><button data-filter="featured" aria-pressed="${filter==='featured'}">Featured</button><button data-filter="archive" aria-pressed="${filter==='archive'}">Archive</button></div><select aria-label="Filter projects"><option value="All">All disciplines</option>${categories.map(c=>`<option ${category===c?'selected':''}>${e(c)}</option>`).join('')}</select></div><div class="grid">${projects.map(card).join('')}</div>${projects.length ? '' : '<p class="empty">해당 카테고리의 작업이 없습니다.</p>'}`;
    document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;showGrid();});
    document.querySelector('select').onchange=event=>{category=event.target.value;showGrid();};
    document.querySelectorAll('[data-project]').forEach(b=>b.onclick=()=>{location.hash=`works/${b.dataset.project}`;});
  }
  function showProject(p) {
    const body=document.querySelector('#works-body');
    if(p.encrypted && !unlocked.has(p.id)) {
      body.innerHTML=`<div class="detail"><div class="detail-top"><a href="#works">← All works</a><span>PRIVATE PROJECT</span></div><h2>${e(p.title)}</h2><p>이 프로젝트는 비밀번호로 보호되어 있습니다.</p><button id="unlock-project" class="detail-next">Unlock project ↗</button></div>`;
      document.querySelector('#unlock-project').onclick=()=>ask(async password=>{unlocked.set(p.id,await PortfolioCrypto.open(p.payload,password));render();}); return;
    }
    const content=unlocked.get(p.id)||p;
    const next=data.projects[(data.projects.indexOf(p)+1)%data.projects.length];
    body.innerHTML=`<article class="detail"><div class="detail-top"><a href="#works">← All works</a><span>${e(content.category)} / ${e(content.year)}</span>${p.encrypted?'<button id="lock-project">Lock ↗</button>':''}</div><h2>${e(content.title)}</h2><div class="detail-info"><p>${e(content.credits)}</p><p>${e(content.description)}</p></div><div class="detail-gallery">${content.images.map((src,i)=>img(src,`${content.title} — ${i+1}`)).join('')}</div><a class="detail-next" style="display:block" href="#works/${e(next.id)}">Next project — ${e(next.title)} ↗</a></article>`;
    if(p.encrypted) document.querySelector('#lock-project').onclick=()=>{unlocked.delete(p.id);render();};
  }
  addEventListener('hashchange',()=>{render();document.querySelector('.active')?.scrollTo(0,0);});
  if(!window.PORTFOLIO_DATA) {app.textContent='콘텐츠 파일을 불러올 수 없습니다.';return;}
  data=window.PORTFOLIO_DATA.encrypted ? null : window.PORTFOLIO_DATA;render();
})();
