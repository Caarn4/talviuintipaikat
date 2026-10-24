(()=>{
 const button=document.querySelector('.ws-toggle'), nav=document.getElementById('ws-secondary');
 if(button&&nav)button.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');button.setAttribute('aria-expanded',String(open));});
 document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;document.querySelectorAll('.ws-more[open]').forEach(d=>d.open=false);const menu=document.querySelector('.ws-header .is-open');if(menu){menu.classList.remove('is-open');const toggle=document.querySelector('.ws-toggle,.tu-hero__menu-btn');toggle?.setAttribute('aria-expanded','false');toggle?.focus();}});
 document.querySelectorAll('.ws-header nav a').forEach(link=>link.addEventListener('click',()=>{const menu=document.querySelector('.ws-header .is-open');if(menu){menu.classList.remove('is-open');document.querySelector('.ws-toggle,.tu-hero__menu-btn')?.setAttribute('aria-expanded','false');}}));

})();
