/* ============================================================
   MOTOR DO CONVITE — não precisa editar (dados ficam no config.js)
   Sales Soluções
   ============================================================ */
(function () {
  const C = window.CONVITE;
  const TZ = 'America/Sao_Paulo';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const inicio = new Date(C.data);
  const fim = new Date(inicio.getTime() + (C.duracaoHoras || 5) * 3600000);
  const f = (o) => inicio.toLocaleString('pt-BR', { timeZone: TZ, ...o });
  const hh = f({ hour: '2-digit', hour12: false });
  const mm = f({ minute: '2-digit' }).padStart(2, '0');
  const mapsBusca = 'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent(C.local.nome + ', ' + C.local.endereco);

  /* ---------- textos ---------- */
  const campos = {
    nome: C.nome,
    primeiroNome: C.primeiroNome,
    inicial: C.inicial || C.primeiroNome[0],
    idade: C.idade,
    dia: f({ day: '2-digit' }),
    mes: f({ month: 'long' }),
    mesCurto: f({ month: 'short' }).replace('.', ''),
    mesNum: f({ month: '2-digit' }),
    ano: f({ year: 'numeric' }),
    semana: f({ weekday: 'long' }),
    hora: mm === '00' ? `${hh}h` : `${hh}h${mm}`,
    dataCompleta: f({ day: 'numeric', month: 'long', year: 'numeric' }),
    dataCurta: f({ day: '2-digit', month: '2-digit', year: 'numeric' }),
    localNome: C.local.nome,
    localEndereco: C.local.endereco,
    mensagem: C.mensagem,
    traje: C.traje,
    presentes: C.presentes,
    pix: C.pix,
  };
  $$('[data-c]').forEach((el) => {
    const v = campos[el.dataset.c];
    if (v !== undefined) el.textContent = v;
  });
  document.title = `${C.primeiroNome} ${C.idade} anos | Você está convidado(a)!`;

  /* ---------- seções opcionais ---------- */
  const temFotos = C.fotos && C.fotos.length;
  const regras = {
    traje: !!C.traje,
    presentes: !!(C.presentes || C.pix),
    pix: !!C.pix,
    fotos: temFotos || C.demonstracao,
  };
  $$('[data-se]').forEach((el) => {
    if (!regras[el.dataset.se]) el.remove();
  });

  /* ---------- mapa ---------- */
  $$('[data-maps]').forEach((a) => {
    a.href = mapsBusca;
    a.target = '_blank';
    a.rel = 'noopener';
  });
  $$('[data-waze]').forEach((a) => {
    a.href = 'https://waze.com/ul?q=' + encodeURIComponent(C.local.endereco) + '&navigate=yes';
    a.target = '_blank';
    a.rel = 'noopener';
  });
  $$('[data-mapa]').forEach((box) => {
    const ifr = document.createElement('iframe');
    ifr.loading = 'lazy';
    ifr.title = 'Mapa – ' + C.local.nome;
    ifr.referrerPolicy = 'no-referrer-when-downgrade';
    ifr.src = 'https://maps.google.com/maps?q=' +
      encodeURIComponent(C.local.nome + ', ' + C.local.endereco) + '&z=16&output=embed';
    box.appendChild(ifr);
  });

  /* ---------- galeria ---------- */
  $$('[data-galeria]').forEach((g) => {
    const lista = temFotos ? C.fotos : Array(4).fill(null);
    lista.forEach((src, i) => {
      const fig = document.createElement('figure');
      fig.className = 'foto' + (src ? '' : ' foto-vazia');
      if (src) {
        const img = new Image();
        img.src = src;
        img.alt = `${C.primeiroNome} – foto ${i + 1}`;
        img.loading = 'lazy';
        img.decoding = 'async';
        fig.appendChild(img);
      } else {
        fig.innerHTML = '<span>sua foto<br>aqui</span>';
      }
      g.appendChild(fig);
    });
  });

  /* ---------- contagem ---------- */
  const cd = { d: $$('[data-cd="d"]'), h: $$('[data-cd="h"]'), m: $$('[data-cd="m"]'), s: $$('[data-cd="s"]') };
  function tick() {
    let ms = inicio - Date.now();
    if (ms <= 0) {
      $$('[data-cd-box]').forEach((b) => b.classList.add('chegou'));
      $$('[data-cd-fim]').forEach((b) => (b.hidden = false));
      ms = 0;
    }
    const v = {
      d: Math.floor(ms / 864e5),
      h: Math.floor((ms % 864e5) / 36e5),
      m: Math.floor((ms % 36e5) / 6e4),
      s: Math.floor((ms % 6e4) / 1e3),
    };
    for (const k in cd) cd[k].forEach((el) => {
      const t = String(v[k]).padStart(2, '0');
      if (el.textContent !== t) {
        el.textContent = t;
        el.classList.remove('pula');
        void el.offsetWidth;
        el.classList.add('pula');
      }
    });
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- agenda ---------- */
  const z = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const tituloEv = `Aniversário de ${C.idade} anos – ${C.primeiroNome}`;
  $$('[data-agenda="google"]').forEach((a) => {
    a.href = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent(tituloEv) +
      '&dates=' + z(inicio) + '/' + z(fim) +
      '&details=' + encodeURIComponent('Te espero lá! 🎉 ' + location.href) +
      '&location=' + encodeURIComponent(C.local.nome + ', ' + C.local.endereco);
    a.target = '_blank';
    a.rel = 'noopener';
  });
  $$('[data-agenda="ics"]').forEach((b) =>
    b.addEventListener('click', () => {
      const ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sales Solucoes//Convite//PT',
        'BEGIN:VEVENT', 'UID:' + Date.now() + '@convite', 'DTSTAMP:' + z(new Date()),
        'DTSTART:' + z(inicio), 'DTEND:' + z(fim), 'SUMMARY:' + tituloEv,
        'LOCATION:' + (C.local.nome + ', ' + C.local.endereco).replace(/,/g, '\\,'),
        'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:Amanhã tem festa!', 'END:VALARM',
        'END:VEVENT', 'END:VCALENDAR',
      ].join('\r\n');
      const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
      const a = Object.assign(document.createElement('a'), { href: url, download: 'aniversario-' + C.primeiroNome.toLowerCase() + '.ics' });
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    })
  );

  /* ---------- aviso (toast) ---------- */
  function aviso(txt) {
    let t = $('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      t.setAttribute('role', 'status');
      document.body.appendChild(t);
    }
    t.textContent = txt;
    t.classList.add('on');
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove('on'), 2400);
  }
  async function copiar(txt) {
    try {
      await navigator.clipboard.writeText(txt);
    } catch {
      const ta = Object.assign(document.createElement('textarea'), { value: txt });
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
  }

  /* ---------- pix / compartilhar ---------- */
  $$('[data-copiar-pix]').forEach((b) =>
    b.addEventListener('click', async () => {
      await copiar(C.pix);
      aviso('Chave Pix copiada! 💸');
    })
  );
  $$('[data-share]').forEach((b) =>
    b.addEventListener('click', async () => {
      const dados = { title: document.title, text: `Você foi convidado(a) para o aniversário da ${C.primeiroNome}! 🎉`, url: location.href };
      if (navigator.share) {
        try { await navigator.share(dados); } catch {}
      } else {
        await copiar(location.href);
        aviso('Link copiado!');
      }
    })
  );

  /* ---------- confirmação (RSVP) ---------- */
  $$('form[data-rsvp]').forEach((form) => {
    const sel = form.querySelector('[name="acomp"]');
    if (sel && !sel.options.length) {
      for (let i = 0; i <= (C.maxAcompanhantes ?? 4); i++) {
        sel.add(new Option(i === 0 ? 'Só eu' : `Eu + ${i}`, i));
      }
    }
    const linhaAcomp = form.querySelector('[data-linha-acomp]');
    form.addEventListener('change', () => {
      const vai = form.querySelector('[name="vai"]:checked')?.value !== 'nao';
      if (linhaAcomp) linhaAcomp.hidden = !vai;
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = form.nome.value.trim();
      if (!nome) {
        form.nome.focus();
        aviso('Digite seu nome 😉');
        return;
      }
      const vai = form.querySelector('[name="vai"]:checked')?.value !== 'nao';
      const n = Number(sel?.value || 0);
      const recado = form.recado?.value.trim();
      let msg = vai
        ? `Oi, ${C.primeiroNome}! 🎉 Aqui é ${nome} e eu *confirmo presença* no seu aniversário de ${C.idade} anos!` +
          (n ? `\nVou levar ${n} acompanhante${n > 1 ? 's' : ''} (total: ${n + 1} pessoas).` : '')
        : `Oi, ${C.primeiroNome}! Aqui é ${nome}. Infelizmente *não vou conseguir ir* à sua festa 😢 mas desejo um aniversário incrível!`;
      if (recado) msg += `\n\nRecado: ${recado}`;
      if (vai && window.festa) festa.explodir(innerWidth / 2, innerHeight * 0.6);
      setTimeout(() => {
        // location.href evita bloqueio de pop-up no iPhone/Android
        location.href = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg)}`;
      }, vai ? 600 : 0);
    });
  });

  /* ---------- aparecer ao rolar ---------- */
  if ('IntersectionObserver' in window && !reduz) {
    const io = new IntersectionObserver(
      (ents) => ents.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('visivel');
          io.unobserve(en.target);
        }
      }),
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    $$('.reveal').forEach((el) => io.observe(el));
  } else {
    $$('.reveal').forEach((el) => el.classList.add('visivel'));
  }

  /* ============================================================
     FESTA: confete, brilhos e balões
     ============================================================ */
  const cssCores = () => {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--festa').trim();
    return v ? v.split(',').map((s) => s.trim()) : ['#ff4d8d', '#ffd166', '#06d6a0', '#4cc9f0', '#9b5de5'];
  };
  window.festa = (() => {
    let cv, ctx, parts = [], rodando = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const fator = reduz ? 0.25 : 1;
    function prepara() {
      if (cv) return;
      cv = document.createElement('canvas');
      cv.setAttribute('aria-hidden', 'true');
      Object.assign(cv.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 });
      document.body.appendChild(cv);
      ctx = cv.getContext('2d');
      ajusta();
      addEventListener('resize', ajusta);
    }
    function ajusta() {
      cv.width = innerWidth * dpr;
      cv.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function add(p) {
      prepara();
      parts.push(p);
      if (!rodando) {
        rodando = true;
        requestAnimationFrame(loop);
      }
    }
    function estrela(s) {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const r = i % 2 ? s * 0.22 : s;
        const a = (i * Math.PI) / 4;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
    }
    function loop() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter((p) => p.vida > 0 && p.y < innerHeight + 60);
      for (const p of parts) {
        p.vx *= p.atr;
        p.vy = p.vy * p.atr + p.g;
        p.x += p.vx + Math.sin(p.t * p.osc) * p.bal;
        p.y += p.vy;
        p.rot += p.vr;
        p.t++;
        p.vida--;
        ctx.save();
        ctx.globalAlpha = Math.min(1, p.vida / 40) * (p.pisca ? 0.5 + 0.5 * Math.sin(p.t * 0.3) : 1);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.cor;
        if (p.forma === 'ret') {
          ctx.scale(1, Math.cos(p.t * p.flip));
          ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        } else if (p.forma === 'circ') {
          ctx.beginPath();
          ctx.arc(0, 0, p.s / 3, 0, 7);
          ctx.fill();
        } else if (p.forma === 'serp') {
          ctx.strokeStyle = p.cor;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          for (let i = 0; i < 4; i++) ctx.quadraticCurveTo(i % 2 ? 5 : -5, i * 4 + 2, 0, i * 4 + 4);
          ctx.stroke();
        } else {
          ctx.shadowColor = p.cor;
          ctx.shadowBlur = 10;
          estrela(p.s / 2);
        }
        ctx.restore();
      }
      if (parts.length) requestAnimationFrame(loop);
      else {
        rodando = false;
        ctx.clearRect(0, 0, innerWidth, innerHeight);
      }
    }
    const R = (a, b) => a + Math.random() * (b - a);
    const pega = (arr) => arr[(Math.random() * arr.length) | 0];
    function base(o) {
      return Object.assign({ t: 0, rot: R(0, 6.28), vr: R(-0.2, 0.2), flip: R(0.08, 0.2), osc: R(0.05, 0.12), bal: R(0.2, 0.9), atr: 0.985, g: 0.18, vida: R(140, 220) }, o);
    }
    return {
      explodir(x = innerWidth / 2, y = innerHeight / 2, o = {}) {
        const cores = o.cores || cssCores();
        const formas = o.formas || ['ret', 'ret', 'circ', 'serp'];
        const qtd = Math.round((o.qtd || 140) * fator);
        const forca = o.forca || 13;
        for (let i = 0; i < qtd; i++) {
          const ang = R(0, Math.PI * 2);
          const v = R(forca * 0.3, forca);
          add(base({ x, y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v - forca * 0.35, s: R(7, 13), cor: pega(cores), forma: pega(formas), atr: 0.955, g: 0.22 }));
        }
      },
      canhoes(o = {}) {
        const cores = o.cores || cssCores();
        const qtd = Math.round((o.qtd || 90) * fator);
        [[0, 1], [innerWidth, -1]].forEach(([x, lado]) => {
          for (let i = 0; i < qtd; i++) {
            const v = R(10, 20);
            const ang = R(-1.25, -0.7);
            add(base({ x, y: innerHeight, vx: Math.cos(ang) * v * lado, vy: Math.sin(ang) * v, s: R(7, 13), cor: pega(cores), forma: pega(['ret', 'ret', 'circ', 'serp']), atr: 0.975, g: 0.2, vida: R(180, 260) }));
          }
        });
      },
      chuva(o = {}) {
        const cores = o.cores || cssCores();
        const dur = o.duracao || 2500;
        const porQuadro = Math.max(1, Math.round((o.densidade || 3) * fator));
        const t0 = performance.now();
        (function gera() {
          for (let i = 0; i < porQuadro; i++)
            add(base({ x: R(0, innerWidth), y: -20, vx: R(-1, 1), vy: R(1, 3), s: R(7, 12), cor: pega(cores), forma: pega(o.formas || ['ret', 'circ']), g: 0.05, atr: 0.99, vida: 600 }));
          if (performance.now() - t0 < dur) requestAnimationFrame(gera);
        })();
      },
      brilhos(o = {}) {
        const cores = o.cores || cssCores();
        const qtd = Math.round((o.qtd || 40) * fator);
        for (let i = 0; i < qtd; i++)
          add(base({ x: o.x ?? R(0, innerWidth), y: o.y ?? R(0, innerHeight), vx: R(-1.5, 1.5), vy: R(-1.5, 1.5), s: R(6, 14), cor: pega(cores), forma: 'estrela', g: 0.01, atr: 0.96, vr: R(-0.05, 0.05), pisca: true, vida: R(60, 120) }));
      },
      baloes(o = {}) {
        if (reduz) return;
        const cores = o.cores || cssCores();
        const qtd = o.qtd || 12;
        for (let i = 0; i < qtd; i++) {
          const cor = pega(cores);
          const w = R(44, 74);
          const gid = 'bg' + Math.random().toString(36).slice(2);
          const el = document.createElement('div');
          el.setAttribute('aria-hidden', 'true');
          Object.assign(el.style, { position: 'fixed', left: R(-5, 95) + 'vw', bottom: '-160px', width: w + 'px', zIndex: 9998, pointerEvents: 'none' });
          el.innerHTML = `<svg viewBox="0 0 60 130" width="${w}" style="display:block;overflow:visible">
            <defs><radialGradient id="${gid}" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset=".25" stop-color="${cor}"/><stop offset="1" stop-color="${cor}" stop-opacity=".85"/></radialGradient></defs>
            <path d="M30 2C13 2 2 16 2 33c0 20 16 36 28 40 12-4 28-20 28-40C58 16 47 2 30 2z" fill="url(#${gid})"/>
            <path d="M26 73l4 5 4-5z" fill="${cor}"/>
            <path d="M30 78c-5 10 5 18 0 28s5 16 0 24" stroke="#ffffff99" stroke-width="1" fill="none"/></svg>`;
          document.body.appendChild(el);
          const dur = R(5500, 9000);
          const deriva = R(-60, 60);
          el.animate(
            [
              { transform: 'translate(0,0) rotate(-4deg)' },
              { transform: `translate(${deriva / 2}px,-55vh) rotate(5deg)` },
              { transform: `translate(${deriva}px,calc(-100vh - 220px)) rotate(-3deg)` },
            ],
            { duration: dur, delay: R(0, 1400), easing: 'cubic-bezier(.35,.1,.6,1)', fill: 'both' }
          ).onfinish = () => el.remove();
        }
      },
    };
  })();

  /* ---------- toque em qualquer lugar = brilhinho ---------- */
  document.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a,button,input,select,textarea,label,iframe,[data-sem-brilho]')) return;
    if (document.body.classList.contains('aberto')) festa.brilhos({ x: e.clientX, y: e.clientY, qtd: 10 });
  });

  /* ---------- abrir convite (chamado pelo efeito de cada modelo) ---------- */
  window.abrirConvite = function () {
    document.body.classList.add('aberto');
    const ab = $('#abertura');
    if (ab) {
      ab.classList.add('saindo');
      setTimeout(() => ab.remove(), 1200);
    }
    window.scrollTo(0, 0);
  };
})();
