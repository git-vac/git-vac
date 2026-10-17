'use strict';
const projects=[
  {name:'wpscan-view',language:'Python',description:'WPScan JSON as readable terminal output and a standalone HTML dashboard.',url:'https://github.com/git-vac/wpscan-view'},
  {name:'service-explorer',language:'Python',description:'An IMAP/POP3 mailbox browser and exporter, plus a DNS explorer.',url:'https://github.com/git-vac/service-explorer'},
  {name:'linux-system-report',language:'Bash',description:'Linux system information as Markdown, with explicit collection gaps.',url:'https://github.com/git-vac/linux-system-report'},
  {name:'windows-security-audit',language:'PowerShell',description:'Review eight Windows security settings and export HTML or JSON reports.',url:'https://github.com/git-vac/windows-security-audit'}
];
const input=document.getElementById('command');
const output=document.getElementById('output');
const form=document.getElementById('command-form');
const suggestions=document.getElementById('suggestions');
const history=[];
const dashboardBannerNames=new Set(['ACID 3D','DeathStar','FateGate','Ice Zone']);
let historyIndex=0,draft='',lastBanner=-1,booting=false;
const commands=['help','avg-dashboard','banner','whoami','about','focus','projects','contact','github','ls','ls projects/','cat about.md','cat focus.txt','cat contact.md',...projects.map(p=>'open '+p.name),'pwd','date','echo','clear','reset','home','credits'];
function element(tag,text,cls){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;}
function link(label,url){const a=element('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
function print(container,text){container.append(element('p',text));}
function commandPrompt(command){
  const fragment=document.createDocumentFragment();
  const head=element('div',undefined,'prompt-head');head.setAttribute('aria-hidden','true');
  head.append(document.createTextNode('┌──('),element('span','avg㉿portfolio','identity'),document.createTextNode(')-['),element('span','~','directory'),document.createTextNode(']'));
  const line=element('div',undefined,'command-line');const tail=element('span','└─$','prompt-tail');tail.setAttribute('aria-hidden','true');line.append(tail,command);fragment.append(head,line);return fragment;
}
function focusInput(scroll=true){input.focus({preventScroll:true});if(scroll)input.scrollIntoView({block:'nearest'});}
function fitBanners(){
  document.querySelectorAll('.ascii-banner').forEach(pre=>{const available=pre.parentElement.clientWidth;const columns=Number(pre.dataset.columns);pre.style.fontSize=Math.min(14,Math.max(5,(available-2)/(columns*.6)))+'px';});
}
function showBanner(container,avoidRepeat=false,dashboardOnly=false){
  let choices=AVG_BANNERS.map((_,i)=>i);
  if(dashboardOnly)choices=choices.filter(i=>dashboardBannerNames.has(AVG_BANNERS[i].name));
  if(avoidRepeat&&choices.length>1)choices=choices.filter(i=>i!==lastBanner);
  const index=choices[Math.floor(Math.random()*choices.length)];lastBanner=index;
  const banner=AVG_BANNERS[index];
  const wrap=element('div',undefined,'banner-wrap');const pre=element('pre',undefined,'ascii-banner');pre.dataset.columns=banner.columns;pre.dataset.font=banner.name;pre.setAttribute('role','img');pre.setAttribute('aria-label','AVG ASCII banner — '+banner.name);
  for(const run of banner.runs){const span=element('span',run.text);if(run.fg)span.style.color=run.fg;if(run.bg)span.style.backgroundColor=run.bg;pre.append(span);}
  wrap.append(pre);container.append(wrap);fitBanners();
}
function dashboard(container){
  showBanner(container,false,true);
  const info=element('div',undefined,'dashboard-info');
  print(info,'Offensive Security / Cloud Engineering & Security / Infrastructure');
  container.append(info);
  const help=element('div',undefined,'dashboard-help');
  print(help,'Type help for all commands, or try:');
  const list=element('div');
  ['about','projects','focus','contact','banner','clear'].forEach((cmd,i)=>{if(i)list.append(document.createTextNode('  '));const button=element('button',cmd,'text-command');button.dataset.command=cmd;list.append(button);});
  help.append(list,element('div','Tab completes · ↑ / ↓ history · Ctrl+L clears','hint'));container.append(help);
}
async function start(){
  booting=true;form.hidden=true;output.replaceChildren();history.length=0;historyIndex=0;draft='';suggestions.textContent='';
  const block=element('section',undefined,'command-block boot-command');block.setAttribute('aria-live','off');
  const typed=element('span','','auto-command typing');block.append(commandPrompt(typed));output.append(block);
  const command='avg-dashboard';
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)typed.textContent=command;
  else {await new Promise(resolve=>setTimeout(resolve,180));for(const character of command){typed.textContent+=character;await new Promise(resolve=>setTimeout(resolve,55));}}
  typed.classList.remove('typing');
  const response=element('div',undefined,'response');block.append(response);dashboard(response);
  booting=false;form.hidden=false;input.value='';focusInput(false);
}
function clear(){output.replaceChildren();suggestions.textContent='';}
function showProjects(container){projects.forEach(project=>{const row=element('div',undefined,'project');row.append(link(project.name,project.url),element('span',' ('+project.language+')','project-language'));row.append(element('div',project.description,'project-description'));container.append(row);});}
function showAbout(container){print(container,'AVG — cybersecurity and infrastructure enthusiast.');print(container,'Primarily focused on Offensive Security, with Blue Team capabilities as well.');print(container,'Interested in reliable, scalable systems and practical automation, including AI automation and integration when it matters.');}
function showFocus(container){print(container,'Offensive Security');print(container,'Cloud Engineering & Security');print(container,'Infrastructure');}
function showContact(container){container.append(link('https://github.com/git-vac','https://github.com/git-vac'));}
function run(raw){
  if(booting)return;const value=raw.trim();if(!value)return;
  if(history.at(-1)!==value)history.push(value);if(history.length>100)history.shift();
  historyIndex=history.length;draft='';input.value='';suggestions.textContent='';
  const parts=value.split(/\s+/);const cmd=parts[0].toLowerCase();const arg=parts.slice(1).join(' ');
  if(cmd==='clear'){clear();focusInput();return;}
  if(cmd==='reset'||cmd==='home'){start();return;}
  const block=element('section',undefined,'command-block');block.append(commandPrompt(document.createTextNode(value)));
  const response=element('div',undefined,'response');block.append(response);output.append(block);
  switch(cmd){
    case 'avg-dashboard':dashboard(response);break;
    case 'banner':showBanner(response,true);break;
    case 'help':{
      [['avg-dashboard','Show the dashboard with a random banner'],['banner','Show another ASCII banner'],['whoami / about','About AVG'],['focus','Areas of focus'],['projects','Projects and repository links'],['open <project>','Print a repository link'],['contact / github','GitHub profile'],['ls','List portfolio files'],['cat <file>','Read a portfolio file'],['pwd','Current directory'],['date','Your local date and time'],['echo <text>','Print text'],['clear','Clear the terminal'],['reset','Replay startup'],['credits','ASCII banner source']].forEach(([name,desc])=>{const row=element('div',undefined,'help-row');row.append(element('code',name),element('span',desc));response.append(row);});break;
    }
    case 'whoami':print(response,'AVG');break;
    case 'about':showAbout(response);break;
    case 'focus':showFocus(response);break;
    case 'projects':showProjects(response);break;
    case 'contact':case 'github':showContact(response);break;
    case 'ls':{
      if(arg==='projects/'||arg==='projects')showProjects(response);
      else if(!arg||arg==='.'||arg==='~'||arg==='~/avg'){
        const list=element('div',undefined,'file-list');[['about.md','about'],['focus.txt','focus'],['projects/','projects'],['contact.md','contact']].forEach(([name,command])=>{const button=element('button',name);button.dataset.command=command;list.append(button);});response.append(list);
      }else print(response,'ls: '+arg+': no such directory');break;
    }
    case 'cat':{
      const file=arg.replace(/^\.\//,'');if(file==='about.md')showAbout(response);else if(file==='focus.txt')showFocus(response);else if(file==='contact.md')showContact(response);else print(response,'cat: '+(file||'(missing file)')+': try about.md, focus.txt, or contact.md');break;
    }
    case 'open':{
      const name=arg.replace(/\/$/,'').replace(/^projects\//,'');const project=projects.find(p=>p.name===name);if(project)response.append(link(project.url,project.url));else print(response,'Usage: open <project>. Type projects to see names.');break;
    }
    case 'pwd':print(response,'/home/avg/portfolio');break;
    case 'date':print(response,new Date().toLocaleString(undefined,{dateStyle:'full',timeStyle:'short'}));break;
    case 'echo':print(response,arg);break;
    case 'credits':print(response,'TAAG TheDraw fonts: ACID 3D, DeathStar, Downfall, Eco, FateGate, Font 20, Ice Zone.');response.append(link('https://patorjk.com/software/taag/','https://patorjk.com/software/taag/'));break;
    default:print(response,parts[0]+': command not found. Type help.');
  }
  while(output.children.length>80)output.firstElementChild.remove();focusInput();
}
form.addEventListener('submit',event=>{event.preventDefault();run(input.value);});
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-command]');
  if(button){run(button.dataset.command);return;}
  if(booting||event.defaultPrevented||event.button!==0)return;
  if(event.target.closest('a,button,input,textarea,select,[contenteditable]'))return;
  if(window.getSelection()?.toString())return;
  focusInput(false);
});
input.addEventListener('keydown',event=>{
  if(event.key==='ArrowUp'){event.preventDefault();if(historyIndex===history.length)draft=input.value;historyIndex=Math.max(0,historyIndex-1);input.value=history[historyIndex]||draft;input.setSelectionRange(input.value.length,input.value.length);}
  if(event.key==='ArrowDown'){event.preventDefault();historyIndex=Math.min(history.length,historyIndex+1);input.value=historyIndex===history.length?draft:history[historyIndex];input.setSelectionRange(input.value.length,input.value.length);}
  if(event.key==='Tab'&&!event.shiftKey&&input.value.trim()){
    const prefix=input.value.trim().toLowerCase();const matches=commands.filter(command=>command.startsWith(prefix));if(matches.length){event.preventDefault();if(matches.length===1)input.value=matches[0];else{const common=matches.reduce((a,b)=>{let i=0;while(i<a.length&&a[i]===b[i])i++;return a.slice(0,i);});if(common.length>prefix.length)input.value=common;else suggestions.textContent=matches.join('  ');}}
  }
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='l'){event.preventDefault();clear();focusInput();}
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='c'){if(input.selectionStart!==input.selectionEnd)return;event.preventDefault();const line=element('div',undefined,'command-block');line.append(commandPrompt(document.createTextNode(input.value+'^C')));output.append(line);input.value='';suggestions.textContent='';focusInput();}
  if(event.key==='Escape'){input.value='';historyIndex=history.length;draft='';suggestions.textContent='';}
});
input.addEventListener('input',()=>{suggestions.textContent='';});
window.addEventListener('resize',fitBanners);
start();
