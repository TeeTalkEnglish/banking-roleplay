/* =============================================
   AUSSIE MONEY SURVIVAL — SHARED SCRIPT
   ============================================= */

// ── TOAST NOTIFICATIONS ────────────────────────
function toast(msg, sub, type = 'blue', duration = 4000) {
  const icons = { blue:'💬', green:'✅', red:'🚨', amber:'⚠️' };
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `
    <span class="toast-icon">${icons[type]||'ℹ️'}</span>
    <span class="toast-msg">${msg}${sub ? `<small>${sub}</small>` : ''}</span>
    <span class="toast-close" onclick="removeToast(this.parentElement)">✕</span>
  `;
  container.appendChild(el);
  setTimeout(() => removeToast(el), duration);
}
function removeToast(el) {
  if (!el || !el.parentElement) return;
  el.classList.add('removing');
  setTimeout(() => el.remove(), 300);
}

// ── MONEY POP ANIMATION ────────────────────────
function moneyPop(amount, gain = true, x, y) {
  const el = document.createElement('div');
  el.className = `money-pop ${gain ? 'gain' : 'loss'}`;
  el.textContent = gain ? `+$${amount}` : `-$${amount}`;
  el.style.left = (x || window.innerWidth/2) + 'px';
  el.style.top  = (y || window.innerHeight/2) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}

// ── BUDGET TRACKER (STUDENT) ───────────────────
const BudgetManager = {
  balance: 850,
  weekly: 450,
  expenses: [],
  stress: 30,

  init() {
    this.render();
  },

  addExpense(label, amount, type='loss') {
    this.expenses.unshift({ label, amount, type, time: new Date().toLocaleTimeString('en-AU', {hour:'2-digit',minute:'2-digit'}) });
    if (type === 'loss') {
      this.balance -= amount;
      this.stress = Math.min(100, this.stress + Math.round(amount / 20));
      moneyPop(amount, false, window.innerWidth - 200, 80);
    } else {
      this.balance += amount;
      this.stress = Math.max(0, this.stress - 10);
      moneyPop(amount, true, window.innerWidth - 200, 80);
    }
    this.render();
    this.renderExpenses();
  },

  render() {
    const balEl = document.getElementById('stat-balance');
    const stressEl = document.getElementById('stress-level');
    const stressBar = document.getElementById('stress-bar');
    const savePct = document.getElementById('save-pct');

    if (balEl) {
      balEl.textContent = `$${this.balance.toFixed(2)}`;
      balEl.style.color = this.balance < 200 ? 'var(--red2)' : this.balance < 400 ? 'var(--amber2)' : 'var(--green2)';
    }
    if (stressEl) stressEl.textContent = this.stress + '%';
    if (stressBar) {
      stressBar.style.width = this.stress + '%';
      stressBar.className = 'progress-bar ' + (this.stress < 40 ? 'green' : this.stress < 70 ? 'amber' : 'red');
    }
    if (savePct) {
      const pct = Math.max(0, Math.min(100, Math.round((this.balance / 1200) * 100)));
      savePct.style.width = pct + '%';
    }
    this.renderOrbs();
  },

  renderOrbs() {
    const orbs = document.querySelectorAll('.orb');
    const level = this.stress < 40 ? 'low' : this.stress < 70 ? 'mid' : 'high';
    const filled = Math.round((this.stress / 100) * orbs.length);
    orbs.forEach((o, i) => {
      o.classList.toggle('active', i < filled);
      o.classList.remove('low','mid','high');
      if (i < filled) o.classList.add(level);
    });
  },

  renderExpenses() {
    const list = document.getElementById('expense-list');
    if (!list) return;
    list.innerHTML = this.expenses.slice(0, 8).map(e => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid var(--border)">
        <span style="font-size:.85rem;color:var(--text2)">${e.label}</span>
        <span style="font-family:var(--mono);font-size:.85rem;font-weight:700;color:${e.type==='gain'?'var(--green2)':'var(--red2)'}">
          ${e.type==='gain'?'+':'-'}$${e.amount.toFixed(2)}
        </span>
      </div>
    `).join('') || '<p style="font-size:.85rem;color:var(--text3)">No transactions yet.</p>';
  }
};

// ── STRESS METER ───────────────────────────────
function setStress(val) {
  if (typeof BudgetManager !== 'undefined') {
    BudgetManager.stress = Math.max(0, Math.min(100, val));
    BudgetManager.render();
  }
}

// ── WEEK NAVIGATION ────────────────────────────
function initWeekPills() {
  const pills = document.querySelectorAll('.week-pill');
  const sections = document.querySelectorAll('.week-section');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const w = pill.dataset.week;
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      sections.forEach(s => {
        s.style.display = s.dataset.week === w ? '' : 'none';
      });
    });
  });

  // Show first week by default
  if (sections.length) {
    sections.forEach((s,i) => { s.style.display = i === 0 ? '' : 'none'; });
    pills[0]?.classList.add('active');
  }
}

// ── RANDOM EMERGENCIES ─────────────────────────
const emergencies = [
  { title: 'Cracked Phone Screen!', desc: 'Dropped your phone on the way to work. Screen repair: $180–$260.', amount: 180, icon:'📱' },
  { title: 'Transport Fine!', desc: "Forgot to tap on the tram. Inspector caught you. Fine: $97.", amount: 97, icon:'🚃' },
  { title: 'Delayed Paycheck!', desc: 'Your employer says there was a payroll error. Wage delayed 5 days.', amount: 0, icon:'🏦', stress: 25 },
  { title: 'ATM Fee Surprise!', desc: "You used a non-CBA ATM. Hidden fee: $3.50 (plus $2 card fee).", amount: 5.50, icon:'🏧' },
  { title: 'Surprise Medical Bill!', desc: "You visited an urgent care clinic. Out-of-pocket gap: $68.", amount: 68, icon:'🏥' },
  { title: 'Fake Delivery Text!', desc: "Almost paid $3.95 'redelivery fee' for a parcel you never ordered!", amount: 0, icon:'📦', scam: true },
  { title: 'Overdraft Warning!', desc: "Your balance dropped below $0. Bank overdraft fee: $15.", amount: 15, icon:'💸' },
];

function triggerRandomEmergency() {
  const e = emergencies[Math.floor(Math.random() * emergencies.length)];
  const overlay = document.getElementById('emergency-overlay');
  const modal = document.getElementById('emergency-modal');
  if (!overlay || !modal) {
    toast(`🚨 ${e.title}`, e.desc, 'red', 5000);
    if (e.amount) BudgetManager.addExpense(e.title, e.amount, 'loss');
    return;
  }
  document.getElementById('em-icon').textContent = e.icon;
  document.getElementById('em-title').textContent = e.title;
  document.getElementById('em-desc').textContent = e.desc;
  document.getElementById('em-amount').textContent = e.scam
    ? '🚨 THIS IS A SCAM — DON\'T PAY!'
    : e.amount
      ? `-$${e.amount.toFixed(2)} from your budget`
      : 'No money lost — but stress increases!';
  document.getElementById('em-amount').style.color = e.scam ? 'var(--amber2)' : e.amount ? 'var(--red2)' : 'var(--text2)';
  overlay.classList.add('open');

  document.getElementById('em-close').onclick = () => {
    overlay.classList.remove('open');
    if (e.amount) BudgetManager.addExpense(e.title, e.amount, 'loss');
    if (e.stress) setStress(BudgetManager.stress + e.stress);
  };
}

// ── BUDGET INPUT HANDLER ───────────────────────
function handleBudgetInput(inputEl, label) {
  const val = parseFloat(inputEl.value);
  if (isNaN(val) || val <= 0) return;
  BudgetManager.addExpense(label, val, 'loss');
  toast(`Spent $${val.toFixed(2)} on ${label}`, 'Budget updated', 'amber');
  inputEl.value = '';
}

// ── SCORE MANAGER ──────────────────────────────
const Score = {
  val: 0,
  add(n) {
    this.val += n;
    const el = document.getElementById('score-val');
    if (el) el.textContent = this.val;
    toast(`+${n} pts`, 'Score updated!', 'green', 2500);
  },
  set(n) {
    this.val = n;
    const el = document.getElementById('score-val');
    if (el) el.textContent = this.val;
  }
};

// ── MINIGAMES ──────────────────────────────────

// --- ATM CHALLENGE ---
const ATMGame = {
  questions: [
    { q: "The ATM screen says 'with or without receipt?' What do you press if you don't want paper?", correct: 1, options: ["With receipt","Without receipt","Cancel","Confirm"], explain: "'Without receipt' means no printed slip — saves paper and is standard in Aus." },
    { q: "Your card shows 'daily limit reached'. What does this mean?", correct: 2, options: ["Your card is broken","You have no money","You've hit max ATM withdrawals for today","Fraud detected"], explain: "Australian banks set daily ATM withdrawal limits (usually $500–$1000/day)." },
    { q: "The screen says 'checking account'. Which account is this?", correct: 0, options: ["Your everyday spending account","Your savings account","A loan account","A foreign account"], explain: "In Australia, 'checking' = 'transaction account' — your main spending account." },
    { q: "ATM says 'service fee: $2.50 will apply'. What should you do?", correct: 1, options: ["Accept and withdraw","Cancel and find your bank's ATM","Press confirm twice to avoid fee","Ignore it — banks always charge"], explain: "Always check if the ATM belongs to your bank to avoid fees. CBA, NAB, ANZ, Westpac ATMs are fee-free for their customers." },
    { q: "The screen shows 'card retained'. What does this mean?", correct: 3, options: ["Card was declined","Out of service","Processing…","ATM has kept your card"], explain: "If your card is 'retained', the machine has taken it. Contact your bank immediately — usually on 13xxxx number on the back." },
  ],
  current: 0,
  score: 0,
  start() {
    this.current = 0; this.score = 0;
    this.render();
    document.getElementById('atm-game').style.display = '';
  },
  render() {
    const q = this.questions[this.current];
    if (!q) { this.end(); return; }
    const el = document.getElementById('atm-question');
    if (!el) return;
    el.innerHTML = `
      <div style="font-family:var(--mono);font-size:.72rem;color:var(--text3);margin-bottom:.5rem">Question ${this.current+1} / ${this.questions.length}</div>
      <p style="font-size:.95rem;font-weight:600;color:var(--text);margin-bottom:1rem">${q.q}</p>
      <div style="display:flex;flex-direction:column;gap:.5rem">
        ${q.options.map((o,i) => `<button class="btn btn-secondary btn-full atm-opt" data-idx="${i}" style="text-align:left">${o}</button>`).join('')}
      </div>
    `;
    el.querySelectorAll('.atm-opt').forEach(btn => {
      btn.addEventListener('click', () => this.answer(parseInt(btn.dataset.idx)));
    });
  },
  answer(idx) {
    const q = this.questions[this.current];
    const el = document.getElementById('atm-question');
    const correct = idx === q.correct;
    if (correct) { this.score++; toast('Correct! 🎉', q.explain, 'green', 4000); }
    else { toast('Not quite!', q.explain, 'amber', 5000); }
    const btns = el.querySelectorAll('.atm-opt');
    btns.forEach((b,i) => {
      b.disabled = true;
      if (i === q.correct) b.style.background = 'rgba(16,185,129,.2)';
      else if (i === idx) b.style.background = 'rgba(239,68,68,.15)';
    });
    setTimeout(() => { this.current++; this.render(); }, 1800);
  },
  end() {
    const el = document.getElementById('atm-question');
    if (el) el.innerHTML = `
      <div style="text-align:center;padding:1rem">
        <div style="font-size:2.5rem;margin-bottom:.5rem">🏧</div>
        <h3>ATM Challenge Complete!</h3>
        <p style="margin:.5rem 0">Score: <strong style="color:var(--accent2)">${this.score} / ${this.questions.length}</strong></p>
        <button class="btn btn-primary" onclick="ATMGame.start()" style="margin-top:1rem">Try Again</button>
      </div>
    `;
    Score.add(this.score * 10);
  }
};

// --- SCAM DETECTOR ---
const ScamGame = {
  items: [
    { msg: "Dear Customer, Your NAB account has been SUSPENDED. Click here to verify: nab-secure-login.ru/auth", scam: true, reason: "Real Australian banks NEVER send .ru links. 'Suspended' urgency is a red flag." },
    { msg: "Hi! This is Service Victoria reminding you your Myki card expires. Recharge at myki.com.au", scam: false, reason: "This is genuine. The official Myki website is myki.com.au — always check the real URL." },
    { msg: "Congratulations! You have been selected for a $500 Woolworths gift card. Reply YES to claim now!", scam: true, reason: "Woolworths doesn't send random texts with prizes. This is a classic phishing scam." },
    { msg: "ATO: You have a tax refund of $742.18 pending. Provide bank details via: ato-refund.online/claim", scam: true, reason: "The ATO website is always ato.gov.au. Never give bank details via SMS links." },
    { msg: "Your CBA account: Low balance alert — balance below $50. Log in at commbank.com.au", scam: false, reason: "CBA does send genuine balance alerts. Commbank.com.au is the real domain — always check." },
    { msg: "Urgent: Your Centrelink payment is on hold. Call 1900-CLAIM now to release funds.", scam: true, reason: "1900 numbers are premium-rate and charged per minute. Centrelink uses 13xx numbers, not 1900." },
    { msg: "Hi [Name], your Amazon parcel requires a $3.95 redelivery fee. Pay here: delivery-aus.net", scam: true, reason: "Amazon Australia doesn't charge redelivery fees via text. 'delivery-aus.net' is NOT Amazon." },
  ],
  current: 0,
  score: 0,
  start() {
    this.current = 0; this.score = 0;
    const el = document.getElementById('scam-game');
    if (el) { el.style.display = ''; this.render(); }
  },
  render() {
    const item = this.items[this.current];
    const el = document.getElementById('scam-question');
    if (!el) return;
    if (!item) { this.end(); return; }
    el.innerHTML = `
      <div style="font-family:var(--mono);font-size:.72rem;color:var(--text3);margin-bottom:.5rem">Message ${this.current+1} / ${this.items.length}</div>
      <div style="background:var(--surface3);border:1px solid var(--border2);border-radius:var(--radius-sm);padding:1rem;margin-bottom:1rem;font-size:.9rem;color:var(--text);line-height:1.6">${item.msg}</div>
      <div style="display:flex;gap:.75rem;justify-content:center">
        <button class="btn btn-success btn-lg" onclick="ScamGame.answer(false)">✅ Legit</button>
        <button class="btn btn-danger btn-lg" onclick="ScamGame.answer(true)">🚨 SCAM!</button>
      </div>
    `;
  },
  answer(guessScam) {
    const item = this.items[this.current];
    const correct = guessScam === item.scam;
    if (correct) { this.score++; toast('Good catch! 🎯', item.reason, 'green', 5000); }
    else { toast(item.scam ? '⚠️ That was a scam!' : '❌ That was legitimate', item.reason, 'red', 5000); }
    this.current++;
    setTimeout(() => this.render(), 2000);
  },
  end() {
    const el = document.getElementById('scam-question');
    if (el) el.innerHTML = `
      <div style="text-align:center;padding:1rem">
        <div style="font-size:2.5rem;margin-bottom:.5rem">🛡️</div>
        <h3>Scam Detector Complete!</h3>
        <p>Score: <strong style="color:var(--accent2)">${this.score} / ${this.items.length}</strong></p>
        <p style="margin-top:.5rem">${this.score >= 6 ? "Excellent! You\'re scam-aware! 🇦🇺" : "Keep practising — scammers are tricky!"}</p>
        <button class="btn btn-primary" onclick="ScamGame.start()" style="margin-top:1rem">Try Again</button>
      </div>
    `;
    Score.add(this.score * 15);
  }
};

// --- SPLIT THE BILL ---
const BillSplit = {
  items: [],
  init() {
    this.render();
  },
  addItem() {
    const nameEl = document.getElementById('bill-item-name');
    const amtEl  = document.getElementById('bill-item-amt');
    const pplEl  = document.getElementById('bill-people');
    if (!nameEl || !amtEl || !pplEl) return;
    const name = nameEl.value.trim() || 'Expense';
    const amt  = parseFloat(amtEl.value);
    const ppl  = parseInt(pplEl.value) || 4;
    if (isNaN(amt) || amt <= 0) { toast('Enter a valid amount', '', 'amber'); return; }
    this.items.push({ name, amt, ppl, each: (amt/ppl) });
    nameEl.value = ''; amtEl.value = '';
    this.render();
  },
  render() {
    const el = document.getElementById('bill-results');
    if (!el) return;
    if (!this.items.length) { el.innerHTML = '<p style="color:var(--text3);font-size:.85rem">No items added yet.</p>'; return; }
    const total = this.items.reduce((a,i) => a+i.amt, 0);
    el.innerHTML = this.items.map((it,i) => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid var(--border)">
        <span style="font-size:.875rem;color:var(--text)">${it.name}</span>
        <div style="display:flex;align-items:center;gap:.75rem">
          <span style="font-size:.8rem;color:var(--text3)">÷${it.ppl}</span>
          <span style="font-family:var(--mono);font-size:.875rem;color:var(--accent2)">$${it.each.toFixed(2)}/ea</span>
          <button class="btn btn-sm btn-danger" onclick="BillSplit.remove(${i})">✕</button>
        </div>
      </div>
    `).join('') + `<div style="display:flex;justify-content:space-between;padding:.75rem 0;font-weight:700"><span>Total split</span><span style="font-family:var(--mono);color:var(--green2)">$${(total/(this.items[0]?.ppl||1)).toFixed(2)}/person</span></div>`;
  },
  remove(i) { this.items.splice(i, 1); this.render(); }
};

// --- GROCERY BUDGET RUSH ---
const GroceryGame = {
  budget: 80,
  cart: [],
  items: [
    { name: '🍞 Bread (Wonder White)', price: 3.50, necessity: true },
    { name: '🥛 Milk (2L Full Cream)', price: 3.00, necessity: true },
    { name: '🥚 Eggs (12 free range)', price: 6.99, necessity: true },
    { name: '🍗 Chicken Breast (1kg)', price: 10.00, necessity: true },
    { name: '🥦 Broccoli', price: 2.50, necessity: true },
    { name: '🍚 Rice (5kg Sunrice)', price: 12.00, necessity: true },
    { name: '🧄 Garlic (3 pack)', price: 2.00, necessity: true },
    { name: '🍜 Mi Goreng (5pk)', price: 2.50, necessity: true },
    { name: '☕ Nescafé Instant (100g)', price: 7.50, necessity: false },
    { name: '🍫 Tim Tams', price: 4.50, necessity: false },
    { name: '🥤 Coke (1.25L)', price: 4.00, necessity: false },
    { name: '🧃 Orange Juice (2L)', price: 5.00, necessity: false },
    { name: '🍎 Apple (1kg)', price: 3.50, necessity: true },
    { name: '🥜 Peanut Butter (375g)', price: 4.20, necessity: false },
    { name: '🧴 Shampoo (Pantene)', price: 8.50, necessity: false },
    { name: '🧻 Toilet Paper (12pk)', price: 7.00, necessity: true },
  ],
  init() { this.cart = []; this.render(); },
  toggle(i) {
    const idx = this.cart.indexOf(i);
    if (idx > -1) this.cart.splice(idx, 1);
    else this.cart.push(i);
    this.render();
  },
  total() { return this.cart.reduce((a,i) => a + this.items[i].price, 0); },
  render() {
    const el = document.getElementById('grocery-items');
    const totalEl = document.getElementById('grocery-total');
    const barEl = document.getElementById('grocery-bar');
    if (!el) return;
    const tot = this.total();
    el.innerHTML = this.items.map((it,i) => {
      const inCart = this.cart.includes(i);
      return `
        <div onclick="GroceryGame.toggle(${i})" style="display:flex;align-items:center;gap:.75rem;padding:.6rem .8rem;border-radius:var(--radius-sm);border:1px solid ${inCart?'rgba(59,130,246,.5)':'var(--border)'};background:${inCart?'rgba(59,130,246,.08)':'var(--surface2)'};cursor:pointer;transition:var(--transition);margin-bottom:.4rem">
          <span style="font-size:1.1rem">${it.name.split(' ')[0]}</span>
          <div style="flex:1">
            <div style="font-size:.875rem;color:var(--text)">${it.name.split(' ').slice(1).join(' ')}</div>
            <div style="font-size:.72rem;color:var(--text3)">${it.necessity?'🟢 Essential':'🔵 Optional'}</div>
          </div>
          <span style="font-family:var(--mono);font-size:.875rem;color:${inCart?'var(--accent2)':'var(--text2)'}">$${it.price.toFixed(2)}</span>
          <span style="font-size:1rem">${inCart?'✅':'⬜'}</span>
        </div>
      `;
    }).join('');
    if (totalEl) {
      totalEl.textContent = `$${tot.toFixed(2)} / $${this.budget.toFixed(2)}`;
      totalEl.style.color = tot > this.budget ? 'var(--red2)' : 'var(--green2)';
    }
    if (barEl) {
      const pct = Math.min(100, (tot / this.budget) * 100);
      barEl.style.width = pct + '%';
      barEl.className = 'progress-bar ' + (pct > 100 ? 'red' : pct > 80 ? 'amber' : 'green');
    }
  }
};

// ── DOM READY INIT ──────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initWeekPills();
  if (document.getElementById('stat-balance')) BudgetManager.init();
  if (document.getElementById('bill-results')) BillSplit.init();
  if (document.getElementById('grocery-items')) GroceryGame.init();

  // Random emergency button
  const emergBtn = document.getElementById('btn-emergency');
  if (emergBtn) emergBtn.addEventListener('click', triggerRandomEmergency);

  // Budget quick-add
  document.querySelectorAll('.budget-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const inp = document.getElementById(btn.dataset.input);
      const label = btn.dataset.label || 'Expense';
      if (inp) handleBudgetInput(inp, label);
    });
  });
});

  // sync final score display
  document.addEventListener('DOMContentLoaded', () => {
    setInterval(() => {
      const sv2 = document.getElementById('score-val-2');
      const sv = document.getElementById('score-val');
      if (sv2 && sv) sv2.textContent = sv.textContent;
      const bfinal = document.getElementById('stat-balance-final');
      const bmain = document.getElementById('stat-balance');
      if (bfinal && bmain) bfinal.textContent = bmain.textContent;
    }, 500);
  });
