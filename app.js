
(function(){
  const LS = {
    get: (k, def) => JSON.parse(localStorage.getItem(k) || JSON.stringify(def)),
    set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
  };
  const KEYS = {produtos:'amadeus_produtos', vendas:'amadeus_vendas', caixa:'amadeus_caixa', agenda:'amadeus_agenda'};
  const fmtMoney = n => (Number(n||0)).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const fmtDate = iso => iso ? new Date(iso).toLocaleDateString('pt-BR') : '';

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
      if(btn.dataset.tab==='vendas') populateVendaProdutos();
      if(btn.dataset.tab==='relatorios') renderIndicadores();
    });
  });

  const seed = () => {
    const demoP = [
      {id: crypto.randomUUID(), nome:'Cerveja Pilsen 600ml', categoria:'Bebida', qtd:48, validade:''},
      {id: crypto.randomUUID(), nome:'Refrigerante Lata', categoria:'Bebida', qtd:36, validade:''},
      {id: crypto.randomUUID(), nome:'Porção de Batata', categoria:'Comida', qtd:20, validade:''},
    ];
    const now = new Date();
    const demoV = [
      {data: now.toISOString(), produtoId: demoP[0].id, produtoNome: demoP[0].nome, qtd:3, mesa:'Mesa 2', preco:14.9, total: 44.7},
      {data: now.toISOString(), produtoId: demoP[1].id, produtoNome: demoP[1].nome, qtd:2, mesa:'Mesa 1', preco:7.5, total: 15.0},
    ];
    const demoC = [
      {data: now.toISOString(), tipo:'entrada', desc:'Vendas do dia (seed)', valor:59.7},
      {data: now.toISOString(), tipo:'saida', desc:'Pagamento banda (seed)', valor:250},
    ];
    const demoE = [
      {id: crypto.randomUUID(), data: now.toISOString().substring(0,10), titulo:'Trio de Samba', notas:'20h · Couvert R$ 8'}
    ];
    LS.set(KEYS.produtos, demoP);
    LS.set(KEYS.vendas, demoV);
    LS.set(KEYS.caixa, demoC);
    LS.set(KEYS.agenda, demoE);
    renderProdutos(); renderVendas(); renderCaixa(); renderAgenda(); populateVendaProdutos();
    alert('Dados de exemplo carregados!');
  };

  // ESTOQUE
  const formProduto = document.getElementById('formProduto');
  formProduto.addEventListener('submit', e => {
    e.preventDefault();
    const id = document.getElementById('p_id').value || crypto.randomUUID();
    const item = {
      id,
      nome: document.getElementById('p_nome').value.trim(),
      categoria: document.getElementById('p_categoria').value.trim(),
      qtd: Number(document.getElementById('p_qtd').value || 0),
      validade: document.getElementById('p_validade').value || ''
    };
    const arr = LS.get(KEYS.produtos, []);
    const idx = arr.findIndex(x=>x.id===id);
    if(idx>=0) arr[idx]=item; else arr.push(item);
    LS.set(KEYS.produtos, arr);
    formProduto.reset(); document.getElementById('p_id').value=''; renderProdutos();
  });
  document.getElementById('btnLimparProduto').addEventListener('click', ()=>{ formProduto.reset(); document.getElementById('p_id').value=''; });
  document.getElementById('btnSeed').addEventListener('click', seed);
  document.getElementById('filtroEstoque').addEventListener('input', renderProdutos);

  function renderProdutos(){
    const q = (document.getElementById('filtroEstoque').value || '').toLowerCase();
    const tb = document.querySelector('#tblEstoque tbody'); tb.innerHTML='';
    const arr = LS.get(KEYS.produtos, []);
    arr.filter(x => (x.nome+x.categoria).toLowerCase().includes(q)).forEach(p => {
      const tr = document.createElement('tr');
      const nearExpiry = p.validade && (new Date(p.validade) - new Date() < 7*24*3600*1000);
      tr.innerHTML = `
        <td>${p.nome} ${nearExpiry? '<span class="badge warn">⚠ validade</span>':''}</td>
        <td>${p.categoria||''}</td>
        <td>${p.qtd}</td>
        <td>${p.validade? fmtDate(p.validade): ''}</td>
        <td><button class="secondary" data-edit="${p.id}">Editar</button>
            <button class="danger" data-del="${p.id}">Excluir</button></td>`;
      tb.appendChild(tr);
    });
    tb.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click', ()=>editProduto(b.dataset.edit)));
    tb.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click', ()=>delProduto(b.dataset.del)));
  }
  function editProduto(id){
    const p = LS.get(KEYS.produtos, []).find(x=>x.id===id); if(!p) return;
    document.getElementById('p_id').value = p.id;
    document.getElementById('p_nome').value = p.nome;
    document.getElementById('p_categoria').value = p.categoria;
    document.getElementById('p_qtd').value = p.qtd;
    document.getElementById('p_validade').value = p.validade;
    document.getElementById('p_nome').focus();
  }
  function delProduto(id){
    if(!confirm('Excluir produto?')) return;
    const arr = LS.get(KEYS.produtos, []).filter(x=>x.id!==id);
    LS.set(KEYS.produtos, arr); renderProdutos(); populateVendaProdutos();
  }

  // VENDAS
  function populateVendaProdutos(){
    const sel = document.getElementById('v_produto');
    const arr = LS.get(KEYS.produtos, []);
    sel.innerHTML = arr.map(p=>`<option value="${p.id}" data-nome="${p.nome}">${p.nome} (Estoque: ${p.qtd})</option>`).join('');
  }
  document.getElementById('formVenda').addEventListener('submit', e=>{
    e.preventDefault();
    const produtoId = document.getElementById('v_produto').value;
    const qtd = Number(document.getElementById('v_qtd').value || 1);
    const mesa = document.getElementById('v_mesa').value.trim();
    const preco = Number(document.getElementById('v_preco').value || 0);
    const produtos = LS.get(KEYS.produtos, []);
    const p = produtos.find(x=>x.id===produtoId);
    if(!p) return alert('Selecione um produto');
    if(p.qtd < qtd) return alert('Estoque insuficiente');
    const total = +(qtd * preco).toFixed(2);
    const venda = {data:new Date().toISOString(), produtoId, produtoNome:p.nome, qtd, mesa, preco, total};
    const vendas = LS.get(KEYS.vendas, []); vendas.push(venda); LS.set(KEYS.vendas, vendas);
    p.qtd -= qtd; LS.set(KEYS.produtos, produtos);
    const caixa = LS.get(KEYS.caixa, []); caixa.push({data:venda.data, tipo:'entrada', desc:`Venda · ${p.nome} x${qtd}`, valor: total}); LS.set(KEYS.caixa, caixa);
    renderProdutos(); renderVendas(); renderCaixa(); document.getElementById('formVenda').reset(); populateVendaProdutos();
  });
  function renderVendas(){
    const tb = document.querySelector('#tblVendas tbody'); tb.innerHTML='';
    const vendas = LS.get(KEYS.vendas, []);
    vendas.slice().reverse().forEach(v => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${fmtDate(v.data)}</td><td>${v.produtoNome}</td><td>${v.qtd}</td><td>${v.mesa||''}</td><td>${v.preco? fmtMoney(v.preco): '-'}</td><td>${fmtMoney(v.total)}</td>`;
      tb.appendChild(tr);
    });
  }

  // CAIXA
  document.getElementById('formCaixa').addEventListener('submit', e=>{
    e.preventDefault();
    const tipo = document.getElementById('c_tipo').value;
    const desc = document.getElementById('c_desc').value.trim();
    const valor = Number(document.getElementById('c_valor').value || 0);
    const data = document.getElementById('c_data').value || new Date().toISOString().substring(0,10);
    const arr = LS.get(KEYS.caixa, []);
    arr.push({data: new Date(data).toISOString(), tipo, desc, valor});
    LS.set(KEYS.caixa, arr); e.target.reset(); renderCaixa();
  });
  document.getElementById('filtroCaixa').addEventListener('input', renderCaixa);
  function renderCaixa(){
    const tb = document.querySelector('#tblCaixa tbody'); tb.innerHTML='';
    const q = (document.getElementById('filtroCaixa').value||'').toLowerCase();
    const arr = LS.get(KEYS.caixa, []);
    let saldo = 0;
    arr.filter(x => (x.desc||'').toLowerCase().includes(q)).slice().reverse().forEach(l => {
      const val = Number(l.valor||0) * (l.tipo==='saida' ? -1 : 1);
      saldo += val;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${fmtDate(l.data)}</td><td>${l.tipo}</td><td>${l.desc}</td><td>${fmtMoney(val)}</td>`;
      tb.appendChild(tr);
    });
    document.getElementById('saldoCaixa').textContent = fmtMoney(saldo);
  }

  // AGENDA
  document.getElementById('formEvento').addEventListener('submit', e=>{
    e.preventDefault();
    const item = {id: crypto.randomUUID(), data: document.getElementById('e_data').value, titulo: document.getElementById('e_titulo').value.trim(), notas: document.getElementById('e_notas').value.trim()};
    const arr = LS.get(KEYS.agenda, []); arr.push(item); LS.set(KEYS.agenda, arr); e.target.reset(); renderAgenda();
  });
  function renderAgenda(){
    const tb = document.querySelector('#tblAgenda tbody'); tb.innerHTML='';
    const arr = LS.get(KEYS.agenda, []);
    arr.slice().sort((a,b)=>a.data.localeCompare(b.data)).forEach(ev=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${fmtDate(ev.data)}</td><td>${ev.titulo}</td><td>${ev.notas||''}</td><td><button class="danger" data-del="${ev.id}">Excluir</button></td>`;
      tb.appendChild(tr);
    });
    tb.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click', ()=>delEvento(b.dataset.del)));
  }
  function delEvento(id){
    if(!confirm('Excluir evento?')) return;
    const arr = LS.get(KEYS.agenda, []).filter(x=>x.id!==id);
    LS.set(KEYS.agenda, arr); renderAgenda();
  }

  // RELATÓRIOS
  document.getElementById('btnRelatorio').addEventListener('click', renderIndicadores);
  document.getElementById('btnCSV').addEventListener('click', exportCSV);
  function inRange(dt, ini, fim){ const d = new Date(dt); if(ini && d < new Date(ini)) return false; if(fim && d > new Date(fim)) return false; return true; }
  function renderIndicadores(){
    const ini = document.getElementById('r_ini').value || null;
    const fim = document.getElementById('r_fim').value || null;
    const vendas = LS.get(KEYS.vendas, []).filter(v => inRange(v.data, ini, fim));
    const totalVendas = vendas.reduce((s,v)=>s+Number(v.total||0),0);
    const porProduto = {}; vendas.forEach(v => { porProduto[v.produtoNome]=(porProduto[v.produtoNome]||0)+v.qtd; });
    const top = Object.entries(porProduto).sort((a,b)=>b[1]-a[1]).slice(0,3);
    const caixa = LS.get(KEYS.caixa, []).filter(c => inRange(c.data, ini, fim));
    const saldo = caixa.reduce((s,c)=> s + (c.tipo==='saida'?-1:1)*Number(c.valor||0), 0);
    const cont = document.getElementById('indicadores');
    cont.innerHTML = `
      <div class="indic"><h3>Total de Vendas</h3><p style="font-size:22px; margin:6px 0;">${fmtMoney(totalVendas)}</p><small>Período aplicado</small></div>
      <div class="indic"><h3>Top Produtos</h3><ul>${top.map(([n,q])=>`<li>${n} — <strong>${q}</strong> und.</li>`).join('')||'<li>N/A</li>'}</ul></div>
      <div class="indic"><h3>Saldo de Caixa</h3><p style="font-size:22px; margin:6px 0;">${fmtMoney(saldo)}</p></div>`;
  }
  function exportCSV(){
    const vendas = LS.get(KEYS.vendas, []);
    const rows = [['data','produto','qtd','mesa_cliente','preco','total'], ...vendas.map(v=>[v.data, v.produtoNome, v.qtd, v.mesa||'', v.preco||0, v.total||0])];
    const csv = rows.map(r=>r.map(x=>`"${String(x).replaceAll('"','""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'vendas.csv'; a.click(); URL.revokeObjectURL(url);
  }

  // First render
  renderProdutos(); renderVendas(); renderCaixa(); renderAgenda(); renderIndicadores();
})();
