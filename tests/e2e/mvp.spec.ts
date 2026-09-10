import {
  test,
  expect,
  type Page,
  type APIRequestContext,
} from '@playwright/test';
import { withDesign } from '../../lib/checkout-design';
import type {Session} from '../../lib/model';
const origin='http://127.0.0.1:5174';
async function login(page:Page){await page.goto('/login');await page.getByLabel('E-mail',{exact:true}).fill('admin@example.test');await page.getByLabel('Senha',{exact:true}).fill(process.env.TEST_ADMIN_PASSWORD!);await page.getByRole('button',{name:'Entrar',exact:true}).click();await expect(page.getByRole('heading',{name:'Operações white label'})).toBeVisible();}
async function state(api:APIRequestContext):Promise<Session>{const r=await api.get('/api/workspace');expect(r.status()).toBe(200);return r.json();}
async function save(api:APIRequestContext,s:Session,action:string,value:unknown,extra:Record<string,unknown>={}){return api.post('/api/workspace',{headers:{origin},data:{revision:s.revision,action,value,...extra}});}
test('login, role switch, visual editor, responsive preview and reload',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1440,height:1000});await login(page);
 await expect(page.locator('.metric-line')).toHaveCount(0);await expect(page.getByText('Conexões Robox',{exact:true})).toHaveCount(0);
 await page.screenshot({path:'outputs/admin-desktop.png',fullPage:true});
 await page.getByRole('tab',{name:'Tenant',exact:true}).click();await expect(page.getByRole('heading',{name:'Visão geral',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Nova operação'})).toHaveCount(0);await page.getByRole('button',{name:'Gerenciar checkouts'}).click();
 await page.getByRole('button',{name:'Editar Plano Pro',exact:true}).click();await expect(page.locator('.builder2')).toBeVisible();
 await page.locator('.layer-name').filter({hasText:'Título'}).click();await page.getByRole('tab',{name:'Estilo',exact:true}).click();await page.getByRole('spinbutton',{name:'Tamanho',exact:true}).fill('38');
 await expect(page.locator('.document-block.kind-title')).toHaveCSS('font-size','38px');
 await page.getByRole('tab',{name:'Conteúdo',exact:true}).click();await page.getByLabel('Título da oferta',{exact:true}).fill('Sua plataforma, do seu jeito');
 await page.locator('.layer-name').filter({hasText:'Formulário'}).click();await page.getByRole('tab',{name:'Posição',exact:true}).click();await page.getByRole('combobox',{name:'Região no desktop'}).click();await page.getByRole('option',{name:'Conteúdo',exact:true}).click();
 await expect(page.locator('.document-main .kind-form')).toHaveCount(1);
 await page.getByRole('tab',{name:'Mobile',exact:true}).click();await page.getByRole('spinbutton',{name:'Posição no mobile',exact:true}).fill('1');
 await expect(page.locator('.document-block.kind-form')).toHaveCSS('order','0');
 await page.getByRole('button',{name:'Salvar',exact:true}).click();await expect(page.locator('.save-state')).toHaveText('Salvo');
 await page.getByRole('tab',{name:'Desktop',exact:true}).click();await page.screenshot({path:'outputs/builder-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.getByRole('tab',{name:'Mobile',exact:true}).click();await page.locator('.builder-mobile-tabs').getByRole('tab',{name:'Prévia',exact:true}).click();
 await expect(page.locator('.builder2-canvas')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'outputs/builder-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Voltar',exact:true}).click();await page.reload();await expect(page.getByRole('heading',{name:'Operações white label'})).toBeVisible();
 const persisted=await state(page.request);expect(persisted.state.checkouts[0].title).toBe('Sua plataforma, do seu jeito');expect(persisted.state.checkouts[0].design?.blocks.find(b=>b.kind==='title')?.desktop.size).toBe(38);
 await page.getByRole('button',{name:'Sair',exact:true}).click();await expect(page).toHaveURL(/\/login/);await page.goto('/');await expect(page).toHaveURL(/\/login/);expect(errors).toEqual([]);
});
test('tenant invitation, authorization, publication snapshots and upload',async({page,browser})=>{
 await login(page);let s=await state(page.request);const first=s.state.tenants[0];const id=crypto.randomUUID();const t={...first,id,name:'Tenant de teste',slug:`test-${id}`,email:`tenant-${id}@example.test`,connections:[]};
 let r=await save(page.request,s,'tenant',t);expect(r.status()).toBe(200);s=await r.json();
 const inviteResponse=await page.request.post('/api/auth/invite',{headers:{origin},data:{tenantId:id}});expect(inviteResponse.status()).toBe(200);const invitation=await inviteResponse.json();
 const ctx=await browser.newContext({baseURL:origin});const tp=await ctx.newPage();await tp.goto(invitation.url);await tp.getByLabel('Crie uma senha',{exact:true}).fill('Tenant-Test-Password-2026');await tp.getByRole('button',{name:'Ativar conta'}).click();await expect(tp.getByRole('heading',{name:'Visão geral',exact:true})).toBeVisible();await expect(tp.getByRole('tab',{name:'Super admin'})).toBeDisabled();
 let ts=await state(ctx.request);expect(ts.state.tenants).toHaveLength(1);expect(ts.state.tenants[0].id).toBe(id);
 r=await save(ctx.request,ts,'tenant',{...first,name:'Intrusion'});expect(r.status()).toBe(403);
 r=await save(ctx.request,ts,'tenant',{...t,connections:['Bybit']});expect(r.status()).toBe(200);ts=await r.json();expect(ts.state.tenants[0].connections).toEqual([]);
 s=await state(page.request);const draft=withDesign({...s.state.checkouts[0],id:crypto.randomUUID(),tenantId:id,name:'Oferta de teste',title:'Título publicado',published:false,publishedData:undefined,price:249});
 const banner=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jD1kAAAAASUVORK5CYII=','base64');const upload=await page.request.post('/api/media',{headers:{origin},multipart:{file:{name:'banner.png',mimeType:'image/png',buffer:banner}}});expect(upload.status()).toBe(200);draft.banner=(await upload.json()).url;
 r=await save(page.request,s,'checkout',draft,{publish:true});expect(r.status()).toBe(200);const before=s;s=await r.json();r=await save(page.request,before,'checkout',draft);expect(r.status()).toBe(409);
 const updated={...s.state.checkouts.find(c=>c.id===draft.id)!,title:'Rascunho ainda não publicado',price:299};r=await save(page.request,s,'checkout',updated);expect(r.status()).toBe(200);s=await r.json();
 const publicPage=await browser.newPage({viewport:{width:390,height:844}});await publicPage.goto(`${origin}/checkout/${draft.id}`);await expect(publicPage.getByRole('heading',{name:'Título publicado'})).toBeVisible();await expect(publicPage.getByText('Rascunho ainda não publicado')).toHaveCount(0);expect(await publicPage.locator('.document-image').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);expect(await publicPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await publicPage.screenshot({path:'outputs/checkout-mobile.png',fullPage:true});await publicPage.close();
 r=await save(page.request,s,'tenant',{...t,status:'suspended'});expect(r.status()).toBe(200);expect((await ctx.request.get('/api/workspace')).status()).toBe(403);expect((await page.request.get(`/checkout/${draft.id}`)).status()).toBe(404);await ctx.close();
});
