(() => {
  const $=s=>document.querySelector(s), source=$('#source');
  let current;
  const status=s=>$('#status').textContent=s;
  function parse() {
    const d=JSON.parse(source.value);
    if(!d.name || !Array.isArray(d.projects) || !Array.isArray(d.notes)) throw Error('name, projects, notes 항목을 확인하세요.');
    const ids=new Set();
    for(const p of d.projects){if(!/^[a-z0-9-]+$/.test(p.id)||ids.has(p.id)||!p.title||!Array.isArray(p.images)||p.encrypted)throw Error('프로젝트의 고유 id, title, images를 확인하세요. 암호화 전 원본이 필요합니다.');ids.add(p.id);}
    return d;
  }
  function prepare() {
    current=parse(); $('#project-passwords').replaceChildren();$('#target').replaceChildren();
    const portrait=new Option('프로필 이미지','portrait');$('#target').add(portrait);
    for(const p of current.projects){
      $('#target').add(new Option(p.title,p.id));
      const label=document.createElement('label');label.textContent=p.title+' — 프로젝트 비밀번호 (선택)';
      const input=document.createElement('input');input.type='password';input.autocomplete='new-password';input.dataset.id=p.id;input.minLength=12;label.append(input);
      const confirm=document.createElement('input');confirm.type='password';confirm.autocomplete='new-password';confirm.dataset.confirm=p.id;confirm.placeholder='비밀번호 확인';confirm.setAttribute('aria-label',p.title+' 비밀번호 확인');label.append(confirm);
      $('#project-passwords').append(label);
    }
  }
  function download(name,text,type){const u=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
  $('#prepare').onclick=()=>{try{prepare();status('내용을 적용했습니다. 비밀번호를 새로 입력하세요.');}catch(e){status(e.message);}};
  $('#import').onchange=async event=>{try{source.value=await event.target.files[0].text();prepare();status('원본을 불러왔습니다.');}catch(e){status(e.message);}};
  $('#backup').onclick=()=>{try{download('portfolio-private-source.json',JSON.stringify(parse(),null,2),'application/json');}catch(e){status(e.message);}};
  $('#images').onchange=async event=>{try{
    const d=parse(), images=[];
    for(const file of event.target.files){if(!/^image\/(png|jpeg|webp|gif)$/.test(file.type)||file.size>8*1024*1024)throw Error('지원 이미지 형식과 8MB 크기 제한을 확인하세요.');images.push(await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);}));}
    if(!images.length)return;
    if($('#target').value==='portrait')d.portrait=images[0];else{const p=d.projects.find(p=>p.id===$('#target').value);if(!p)throw Error('내용 적용 버튼을 먼저 눌러 주세요.');p.images=images;p.cover=images[0];}
    source.value=JSON.stringify(d,null,2);status('이미지를 포함했습니다. 원본 백업도 갱신해 주세요.');
  }catch(e){status(e.message);}};
  $('#export').onclick=async()=>{
    const button=$('#export');button.disabled=true;
    try{
      const d=parse();
      if(!current||d.projects.map(p=>p.id).join()!==current.projects.map(p=>p.id).join())throw Error('프로젝트가 변경되었습니다. 내용 적용 버튼을 먼저 눌러 주세요.');
      const site=$('#site-password').value;
      if(site!==$('#site-confirm').value)throw Error('전체 사이트 비밀번호 확인이 일치하지 않습니다.');
      const passwords=new Map();
      for(const input of document.querySelectorAll('[data-id]')){const confirm=[...document.querySelectorAll('[data-confirm]')].find(x=>x.dataset.confirm===input.dataset.id);if(input.value!==confirm.value)throw Error('프로젝트 비밀번호 확인이 일치하지 않습니다.');if(input.value&&input.value.length<12)throw Error('비밀번호는 12자 이상 입력하세요.');passwords.set(input.dataset.id,input.value);}
      if(site&&site.length<12)throw Error('비밀번호는 12자 이상 입력하세요.');
      // A path to a public file cannot protect the file itself. Reject it for private content.
      const privateImage=s=>!s||/^data:image\/(png|jpeg|webp|gif);base64,/.test(s)||/^assets\/(work-[1-6]|portrait)\.svg$/.test(s);
      if(site&&!privateImage(d.portrait))throw Error('비공개 프로필 사진은 이미지 넣기로 포함하세요.');
      status('배포 파일을 준비하고 있습니다…');
      for(let i=0;i<d.projects.length;i++){
        const p=d.projects[i],password=passwords.get(p.id);
        if((site||password)&&![p.cover,...p.images].every(privateImage))throw Error('비공개 이미지는 공개 경로 대신 이미지 넣기로 포함하세요.');
        if(password)d.projects[i]={id:p.id,title:'Private project',category:p.category,year:p.year,featured:p.featured,encrypted:true,payload:await PortfolioCrypto.seal(p,password)};
      }
      const output=site?await PortfolioCrypto.seal(d,site):d;
      download('site-data.js','window.PORTFOLIO_DATA = '+JSON.stringify(output)+';\n','text/javascript');
      document.querySelectorAll('input[type=password]').forEach(input=>input.value='');
      status('완료! 내려받은 site-data.js로 루트 파일을 교체하세요. 실제 파일 변경 전에는 사이트에 적용되지 않습니다.');
    }catch(e){status(e.message);}finally{button.disabled=false;}
  };
  if(window.PORTFOLIO_DATA.encrypted||window.PORTFOLIO_DATA.projects.some(p=>p.encrypted)){source.value='';status('저장해 둔 암호화 전 원본 JSON을 가져오세요.');}
  else{source.value=JSON.stringify(window.PORTFOLIO_DATA,null,2);prepare();}
})();
