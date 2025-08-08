// Interactive JS for feature cards
// This script makes each feature card clickable and navigates to the relevant page
// Only authenticated users can access the features

document.addEventListener('DOMContentLoaded', function() {
  const featureCards = document.querySelectorAll('.pockit-feature-card');
  const featureLinks = [
    '/dashboard.html', // Smart Analytics
    '/expense.html',   // Expense Tracking
    '/emi.html',       // EMI Management
    '/savings.html'    // Savings Goals
  ];

  // Function to check if user is authenticated
  function isUserAuthenticated() {
    const user = localStorage.getItem('user');
    return user && user !== 'null' && user !== 'undefined';
  }

  featureCards.forEach((card, idx) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function() {
      if (isUserAuthenticated()) {
        // User is logged in, allow access to features
        window.location.href = featureLinks[idx];
      } else {
        // User is not logged in, redirect to login page
        window.location.href = '/login.html';
      }
    });
    card.addEventListener('mouseover', function() {
      card.style.transform = 'scale(1.05)';
      card.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
    });
    card.addEventListener('mouseout', function() {
      card.style.transform = 'scale(1)';
      card.style.boxShadow = '';
    });
  });

  // Improved mode toggle button logic
  // Remove any existing toggle button to avoid duplicates
  const oldToggle = document.getElementById('mode-toggle-btn');
  if (oldToggle) oldToggle.remove();

  const nav = document.querySelector('.pockit-nav');
  if (nav) {
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = '🌙';
    toggleBtn.className = 'pockit-btn';
    toggleBtn.id = 'mode-toggle-btn';
    toggleBtn.style.marginLeft = '1rem';
    nav.appendChild(toggleBtn);
    toggleBtn.addEventListener('click', function() {
      document.body.classList.toggle('dark-mode');
      if (document.body.classList.contains('dark-mode')) {
        toggleBtn.textContent = '☀️';
      } else {
        toggleBtn.textContent = '🌙';
      }
    });
  }

  // Savings Tips Carousel for savings.html
  const tips = [
    'Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.',
    'Automate your savings to build wealth effortlessly.',
    'Review subscriptions and cancel unused ones to save more.',
    'Set specific goals and track your progress regularly.',
    'Round up purchases and save the difference.',
    'Cook at home more often to cut down on expenses.',
    'Use cash for discretionary spending to avoid overspending.',
    'Compare prices before big purchases to get the best deal.'
  ];
  const tipElem = document.querySelector('.savings-tip');
  const prevBtn = document.querySelectorAll('.savings-tips-btn')[0];
  const nextBtn = document.querySelectorAll('.savings-tips-btn')[1];
  const pageElem = document.querySelector('.savings-tips-page');
  if (tipElem && prevBtn && nextBtn && pageElem) {
    let idx = Math.floor(Math.random() * tips.length);
    function updateTip() {
      tipElem.textContent = tips[idx];
      pageElem.textContent = `${idx + 1} of ${tips.length}`;
    }
    prevBtn.addEventListener('click', function() {
      idx = (idx - 1 + tips.length) % tips.length;
      updateTip();
    });
    nextBtn.addEventListener('click', function() {
      idx = (idx + 1) % tips.length;
      updateTip();
    });
    updateTip();
  }

  // Savings Goals (Add, Render, Delete, Persist)
  const addBtn = document.getElementById('addSavingsBtn');
  const modal = document.getElementById('savingsModal');
  const closeModalBtn = document.getElementById('closeSavingsModal');
  const form = document.getElementById('savingsForm');
  const grid = document.getElementById('savingsGoalsGrid');
  function getGoals() {
    return JSON.parse(localStorage.getItem('savingsGoals') || '[]');
  }
  function saveGoals(goals) {
    localStorage.setItem('savingsGoals', JSON.stringify(goals));
  }
  function renderGoals() {
    grid.innerHTML = '';
    const goals = getGoals();
    // Update summary cards
    const totalSavings = goals.reduce((sum, g) => sum + (Number(g.saved) || 0), 0);
    const plansCount = goals.length;
    const totalSavingsValue = document.getElementById('totalSavingsValue');
    const plansValue = document.getElementById('plansValue');
    if (totalSavingsValue) totalSavingsValue.textContent = `₹${totalSavings}`;
    if (plansValue) plansValue.textContent = plansCount;
    goals.forEach((goal, idx) => {
      const card = document.createElement('div');
      card.className = 'savings-goal-card';
      const saved = goal.saved ? Number(goal.saved) : 0;
      const total = Number(goal.amount);
      const percent = total > 0 ? Math.min(100, (saved / total) * 100) : 0;
      const remaining = Math.max(0, total - saved);
      
      // Create unique goal ID for celebration tracking
      const goalId = `${goal.for}_${goal.amount}_${goal.date}`;
      
      // Determine if goal was previously completed but is no longer
      const wasCompleted = localStorage.getItem(`celebrated_goal_${goalId}`);
      const isCurrentlyCompleted = saved >= total && total > 0;
      const needsReset = wasCompleted && !isCurrentlyCompleted;
      
      card.innerHTML = `
        <div class="savings-goal-header">
          <span class="savings-goal-dot" style="background:#00BFFF;"></span>
          <span class="savings-goal-title">${goal.for}</span>
          <span class="savings-goal-sub">Target: ${goal.date}</span>
          ${needsReset ? '<span style="color:#FF6B6B;font-size:0.8rem;margin-left:8px;">⚠️ Goal incomplete</span>' : ''}
        </div>
        <div class="savings-goal-progress-bar-bg">
          <div class="savings-goal-progress-bar" style="width:${percent}%"></div>
        </div>
        <div class="savings-goal-info">
          <span>Saved ₹${saved}</span>
          <span style="color:#7B8A97;">/</span>
          <span>₹${total}</span>
          <span style="color: ${remaining === 0 ? '#00BFFF' : '#2C3E50'}; font-weight: ${remaining === 0 ? '600' : '400'};">Remaining ₹${remaining}</span>
          <span>Target Date: ${goal.date}</span>
        </div>
        <div class="savings-goal-actions">
          <button class="savings-goal-btn savings-goal-btn-cyan add-money-btn">Add Money</button>
          <button class="savings-goal-btn savings-goal-btn-gray remove-money-btn">Remove Money</button>
          <button class="savings-goal-btn savings-goal-btn-gray delete-goal-btn">Delete</button>
        </div>
        <div class="add-money-form" style="display:none;margin-top:10px;">
          <input type="number" min="1" placeholder="Enter amount" class="add-money-input" style="padding:7px 12px;border-radius:6px;border:1px solid #ccc;width:120px;">
          <button class="savings-goal-btn savings-goal-btn-cyan confirm-add-money" style="margin-left:8px;">Add</button>
          <button class="savings-goal-btn savings-goal-btn-gray cancel-add-money" style="margin-left:4px;">Cancel</button>
        </div>
        <div class="remove-money-form" style="display:none;margin-top:10px;">
          <input type="number" min="1" placeholder="Enter amount" class="remove-money-input" style="padding:7px 12px;border-radius:6px;border:1px solid #ccc;width:120px;">
          <button class="savings-goal-btn savings-goal-btn-cyan confirm-remove-money" style="margin-left:8px;">Remove</button>
          <button class="savings-goal-btn savings-goal-btn-gray cancel-remove-money" style="margin-left:4px;">Cancel</button>
        </div>
        <div class="goal-congrats" style="display:none;text-align:center;margin-top:10px;padding:15px;background:linear-gradient(135deg,#00BFFF,#1DE9B6);color:#fff;border-radius:12px;font-weight:700;box-shadow:0 4px 16px rgba(0,191,255,0.3);">
          <div style="font-size:2rem;margin-bottom:8px;">🎉</div>
          <div style="font-size:1.2rem;margin-bottom:4px;">Congratulations!</div>
          <div style="font-size:0.9rem;opacity:0.9;">Goal Achieved!</div>
        </div>
        <canvas class="confetti-canvas" style="display:none;position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:10;"></canvas>
      `;
      
      // Check if goal is completed and celebration hasn't been shown yet
      if (saved >= total && total > 0) {
        const celebrationFlag = localStorage.getItem(`celebrated_goal_${goalId}`);
        if (!celebrationFlag) {
          // Trigger celebration only once for this specific goal
          triggerCelebration();
          setTimeout(() => {
            const congrats = card.querySelector('.goal-congrats');
            const canvas = card.querySelector('.confetti-canvas');
            if (congrats && canvas) {
              congrats.style.display = 'block';
              canvas.style.display = 'block';
              confettiBurst(canvas);
              // Set the flag to prevent future celebrations for this goal
              localStorage.setItem(`celebrated_goal_${goalId}`, 'true');
              console.log(`🎉 Celebration triggered for goal: ${goal.for}`);
              
              // Hide celebration after 3 seconds
              setTimeout(() => {
                congrats.style.display = 'none';
                canvas.style.display = 'none';
              }, 3000);
            }
          }, 500);
        }
      } else if (saved < total && total > 0) {
        // Reset the celebration flag if goal is no longer completed
        localStorage.removeItem(`celebrated_goal_${goalId}`);
        console.log(`🔄 Celebration flag reset for goal: ${goal.for} (no longer completed)`);
      }
      
      // Add Money logic
      const addBtn = card.querySelector('.add-money-btn');
      const addFormDiv = card.querySelector('.add-money-form');
      const addInput = card.querySelector('.add-money-input');
      const confirmAddBtn = card.querySelector('.confirm-add-money');
      const cancelAddBtn = card.querySelector('.cancel-add-money');
      addBtn.onclick = () => { addFormDiv.style.display = 'inline-block'; addInput.value = ''; addInput.focus(); };
      cancelAddBtn.onclick = () => { addFormDiv.style.display = 'none'; };
      confirmAddBtn.onclick = () => {
        const val = Number(addInput.value);
        if (!val || val < 1) { addInput.focus(); return; }
        const goals = getGoals();
        goals[idx].saved = (Number(goals[idx].saved) || 0) + val;
        saveGoals(goals);
        renderGoals();
      };
      // Remove Money logic
      const removeBtn = card.querySelector('.remove-money-btn');
      const removeFormDiv = card.querySelector('.remove-money-form');
      const removeInput = card.querySelector('.remove-money-input');
      const confirmRemoveBtn = card.querySelector('.confirm-remove-money');
      const cancelRemoveBtn = card.querySelector('.cancel-remove-money');
      removeBtn.onclick = () => { removeFormDiv.style.display = 'inline-block'; removeInput.value = ''; removeInput.focus(); };
      cancelRemoveBtn.onclick = () => { removeFormDiv.style.display = 'none'; };
      confirmRemoveBtn.onclick = () => {
        const val = Number(removeInput.value);
        if (!val || val < 1) { removeInput.focus(); return; }
        const goals = getGoals();
        const currentSaved = Number(goals[idx].saved) || 0;
        goals[idx].saved = Math.max(0, currentSaved - val);
        saveGoals(goals);
        renderGoals();
      };
      // Delete logic
      card.querySelector('.delete-goal-btn').onclick = function() {
        const goals = getGoals();
        goals.splice(idx, 1);
        saveGoals(goals);
        renderGoals();
      };
      grid.appendChild(card);
    });
  }
  if (addBtn && modal && closeModalBtn && form && grid) {
    addBtn.onclick = () => { modal.style.display = 'flex'; };
    closeModalBtn.onclick = () => { modal.style.display = 'none'; form.reset(); };
    form.onsubmit = function(e) {
      e.preventDefault();
      const forVal = document.getElementById('savingsFor').value;
      const amount = document.getElementById('savingsAmount').value;
      const date = document.getElementById('savingsDate').value;
      const goals = getGoals();
      goals.push({ for: forVal, amount, date });
      saveGoals(goals);
      renderGoals();
      modal.style.display = 'none';
      form.reset();
    };
    renderGoals();
  }

// === Debt Management ===
const debtListSection = document.getElementById('debtListSection');
const addDebtBtn = document.getElementById('addDebtBtn');
const debtModal = document.getElementById('debtModal');
const closeDebtModal = document.getElementById('closeDebtModal');
const debtForm = document.getElementById('debtForm');
const debtCount = document.getElementById('debtCount');
const debtTotal = document.getElementById('debtTotal');
const debtMonthlyMin = document.getElementById('debtMonthlyMin');
const debtAvgInterest = document.getElementById('debtAvgInterest');

function getDebts() {
  return JSON.parse(localStorage.getItem('debts') || '[]');
}
function saveDebts(debts) {
  localStorage.setItem('debts', JSON.stringify(debts));
}
function renderDebts() {
  if (!debtListSection) return;
  const debts = getDebts();
  debtListSection.innerHTML = '';
  // Summary
  debtCount && (debtCount.textContent = debts.length);
  let total = 0, minSum = 0, interestSum = 0, interestCount = 0;
  debts.forEach(d => {
    total += Number(d.remaining || d.amount || 0);
    if (d.minPayment) minSum += Number(d.minPayment);
    if (d.interest) { interestSum += Number(d.interest); interestCount++; }
  });
  debtTotal && (debtTotal.textContent = `Total Outstanding ₹${total}`);
  debtMonthlyMin && (debtMonthlyMin.textContent = `₹${minSum}`);
  debtAvgInterest && (debtAvgInterest.textContent = interestCount ? (interestSum/interestCount).toFixed(2) + '%' : '0%');
  if (debts.length === 0) {
    debtListSection.innerHTML = '<div style="text-align:center;color:#7B8A97;font-size:1.1rem;margin-top:32px;">No debts yet. Click <b>Add New Debt</b> to get started!</div>';
    return;
  }
  debts.forEach((debt, idx) => {
    const card = document.createElement('div');
    card.className = 'debt-card';
    const percent = debt.amount > 0 ? Math.min(100, ((debt.amount-debt.remaining)/debt.amount)*100) : 0;
    card.innerHTML = `
      <div class="debt-card-details">
        <div class="debt-card-title">${debt.name}</div>
        <div class="debt-card-sub">Due: ${debt.due}</div>
        <div class="debt-progress-bar-bg">
          <div class="debt-progress-bar" style="width:${percent}%"></div>
        </div>
        <div class="debt-card-row">
          <span class="debt-card-sub">Interest Rate: ${debt.interest || '-'}%</span>
          <span class="debt-card-sub">Min Payment: ₹${debt.minPayment || '-'}</span>
          <span class="debt-card-sub">Due Date: ${debt.due}</span>
        </div>
        <div class="debt-card-row">
          <span class="debt-card-sub">Remaining: ₹${debt.remaining}</span>
          <span class="debt-total-amount">Total: ₹${debt.amount}</span>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:12px;min-width:180px;">
        <div style="display:flex;gap:8px;">
          <button class="debt-pay-btn">Add Money</button>
          <button class="debt-custom-btn" disabled>Remove Money</button>
          <button class="debt-custom-btn delete-debt-btn">Delete</button>
        </div>
        <div class="add-money-form" style="display:none;margin-top:10px;">
          <input type="number" min="1" placeholder="Enter amount" class="add-money-input" style="padding:7px 12px;border-radius:6px;border:1px solid #ccc;width:120px;">
          <button class="debt-pay-btn confirm-add-money" style="margin-left:8px;">Add</button>
          <button class="debt-custom-btn cancel-add-money" style="margin-left:4px;">Cancel</button>
        </div>
        <div class="remove-money-form" style="display:none;margin-top:10px;">
          <input type="number" min="1" placeholder="Enter amount" class="remove-money-input" style="padding:7px 12px;border-radius:6px;border:1px solid #ccc;width:120px;">
          <button class="debt-pay-btn confirm-remove-money" style="margin-left:8px;">Remove</button>
          <button class="debt-custom-btn cancel-remove-money" style="margin-left:4px;">Cancel</button>
        </div>
      </div>
    `;
    // Add Money logic
    const addBtn = card.querySelector('.debt-pay-btn');
    const addFormDiv = card.querySelector('.add-money-form');
    const addInput = card.querySelector('.add-money-input');
    const confirmAddBtn = card.querySelector('.confirm-add-money');
    const cancelAddBtn = card.querySelector('.cancel-add-money');
    addBtn.onclick = () => { addFormDiv.style.display = 'inline-block'; addInput.value = ''; addInput.focus(); };
    cancelAddBtn.onclick = () => { addFormDiv.style.display = 'none'; };
    confirmAddBtn.onclick = () => {
      const val = Number(addInput.value);
      if (!val || val < 1) { addInput.focus(); return; }
      const debts = getDebts();
      debts[idx].remaining = Math.max(0, Number(debts[idx].remaining) - val);
      saveDebts(debts);
      renderDebts();
    };
    // Remove Money logic
    const removeBtn = card.querySelectorAll('.debt-custom-btn')[0];
    const removeFormDiv = card.querySelector('.remove-money-form');
    const removeInput = card.querySelector('.remove-money-input');
    const confirmRemoveBtn = card.querySelector('.confirm-remove-money');
    const cancelRemoveBtn = card.querySelector('.cancel-remove-money');
    
    // Enable Remove Money button by default
    removeBtn.disabled = false;
    removeBtn.style.background = '#FF5A5A';
    removeBtn.style.color = '#fff';
    removeBtn.textContent = 'Remove Money';
    
    removeBtn.onclick = () => {
      removeFormDiv.style.display = 'inline-block'; 
      removeInput.value = ''; 
      removeInput.focus();
    };
    cancelRemoveBtn.onclick = () => { removeFormDiv.style.display = 'none'; };
    confirmRemoveBtn.onclick = () => {
      const val = Number(removeInput.value);
      if (!val || val < 1) { removeInput.focus(); return; }
      const debts = getDebts();
      debts[idx].remaining = Math.min(Number(debts[idx].amount), Number(debts[idx].remaining) + val);
      saveDebts(debts);
      renderDebts();
    };
    // Delete logic
    card.querySelector('.delete-debt-btn').onclick = function() {
      if (confirm('Are you sure you want to delete this debt?')) {
        const debts = getDebts();
        debts.splice(idx, 1);
        saveDebts(debts);
        renderDebts();
      }
    };
    debtListSection.appendChild(card);
  });
}
if (addDebtBtn && debtModal && closeDebtModal && debtForm && debtListSection) {
  addDebtBtn.onclick = () => { debtModal.style.display = 'flex'; };
  closeDebtModal.onclick = () => { debtModal.style.display = 'none'; debtForm.reset(); };
  debtForm.onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('debtName').value;
    const amount = Number(document.getElementById('debtAmount').value);
    const due = document.getElementById('debtDue').value;
    const interest = document.getElementById('debtInterest').value;
    const minPayment = document.getElementById('debtMinPayment').value;
    const debts = getDebts();
    debts.push({ name, amount, due, interest, minPayment, remaining: amount });
    saveDebts(debts);
    renderDebts();
    debtModal.style.display = 'none';
    debtForm.reset();
  };
  renderDebts();
}

// === Expense Management ===
const addExpenseForm = document.getElementById('addExpenseForm');
const expenseAmount = document.getElementById('expenseAmount');
const expenseCategory = document.getElementById('expenseCategory');
const expenseNote = document.getElementById('expenseNote');
const recentExpensesList = document.getElementById('recentExpensesList');
const categoryBreakdownGrid = document.getElementById('categoryBreakdownGrid');
const expenseBalance = document.querySelector('.expense-balance');

const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Rent & Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Others'
];
const CATEGORY_ICONS = [
  '🍽️', '🚌', '🏠', '🎬', '❤️', '🛍️', '⚙️'
];
const CATEGORY_COLORS = [
  '#FF5A5A', '#00BFFF', '#1DE9B6', '#B39DDB', '#E57373', '#7B8A97', '#757575'
];

function getExpenses() {
  return JSON.parse(localStorage.getItem('expenses') || '[]');
}
function saveExpenses(expenses) {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}
function renderExpenses() {
  const expenses = getExpenses();
  // Render recent expenses
  if (recentExpensesList) {
    recentExpensesList.innerHTML = '';
    if (expenses.length === 0) {
      recentExpensesList.innerHTML = '<li style="color:#7B8A97;text-align:center;">No expenses yet.</li>';
    } else {
      expenses.slice().reverse().forEach((exp, idx) => {
        const li = document.createElement('li');
        li.className = 'recent-expense-item';
        li.innerHTML = `
          <div class="recent-expense-info">
            <span class="recent-expense-title">${exp.note || 'Expense'}</span>
            <span class="recent-expense-meta">${exp.category} · ${exp.date}</span>
          </div>
          <div>
            <span class="recent-expense-amount">₹${Number(exp.amount).toFixed(2)}</span>
            <span class="recent-expense-delete" data-idx="${expenses.length-1-idx}">Delete</span>
          </div>
        `;
        recentExpensesList.appendChild(li);
      });
      // Delete logic
      recentExpensesList.querySelectorAll('.recent-expense-delete').forEach(btn => {
        btn.onclick = function() {
          const idx = Number(this.getAttribute('data-idx'));
          const expenses = getExpenses();
          expenses.splice(idx, 1);
          saveExpenses(expenses);
          renderExpenses();
        };
      });
    }
  }
  // Render balance
  if (expenseBalance) {
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    expenseBalance.textContent = `₹${total.toFixed(2)}`;
  }
  // Render category breakdown
  if (categoryBreakdownGrid) {
    categoryBreakdownGrid.innerHTML = '';
    const totals = Array(CATEGORIES.length).fill(0);
    let grandTotal = 0;
    expenses.forEach(e => {
      const idx = CATEGORIES.indexOf(e.category);
      if (idx !== -1) totals[idx] += Number(e.amount);
      grandTotal += Number(e.amount);
    });
    CATEGORIES.forEach((cat, i) => {
      const amt = totals[i];
      const percent = grandTotal > 0 ? (amt / grandTotal) * 100 : 0;
      const card = document.createElement('div');
      card.className = 'category-card';
      card.innerHTML = `
        <div class="category-icon" style="color:${CATEGORY_COLORS[i]};">${CATEGORY_ICONS[i]}</div>
        <div class="category-name">${cat}</div>
        <div class="category-amount">₹${amt.toFixed(2)}</div>
        <div class="category-percent">${percent.toFixed(1)}%</div>
      `;
      categoryBreakdownGrid.appendChild(card);
    });
  }
}
if (addExpenseForm && expenseAmount && expenseCategory && expenseNote) {
  addExpenseForm.onsubmit = function(e) {
    e.preventDefault();
    const amount = Number(expenseAmount.value);
    const category = expenseCategory.value;
    const note = expenseNote.value;
    const date = new Date().toLocaleDateString('en-GB');
    if (!amount || !category) {
      expenseAmount.focus();
      return;
    }
    const expenses = getExpenses();
    expenses.push({ amount, category, note, date });
    saveExpenses(expenses);
    renderExpenses();
    addExpenseForm.reset();
  };
  renderExpenses();
}

});

// Confetti animation helper
function confettiBurst(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth;
  const H = canvas.height = canvas.offsetHeight;
  
  // Create more colorful and varied confetti pieces
  const pieces = Array.from({length: 50}, () => ({
    x: Math.random() * W,
    y: -10 - Math.random() * 50, // Start above the canvas
    r: 4 + Math.random() * 8,
    c: [
      '#FF5A5A', '#00BFFF', '#1DE9B6', '#FFE066', '#B39DDB',
      '#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'
    ][Math.floor(Math.random() * 10)],
    vx: (Math.random() - 0.5) * 8,
    vy: 2 + Math.random() * 4,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10
  }));
  
  let frame = 0;
  const maxFrames = 120; // Longer animation
  
  function draw() {
    ctx.clearRect(0, 0, W, H);
    
    pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      
      // Draw confetti piece (rectangle instead of circle for more confetti-like appearance)
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r);
      
      ctx.restore();
      
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // Gravity
      p.rotation += p.rotationSpeed;
      
      // Add some wind effect
      p.vx += (Math.random() - 0.5) * 0.5;
    });
    
    frame++;
    if (frame < maxFrames) {
      requestAnimationFrame(draw);
    }
  }
  
  draw();
}

// Celebration trigger function
function triggerCelebration() {
  // This function can be called to trigger the celebration animation
  // It's used in the savings goal completion logic
  console.log('🎉 Celebration triggered!');
  
  // Optional: Add a subtle success sound (if supported by browser)
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    // Sound not supported or blocked, continue without sound
    console.log('Sound effect not available');
  }
}

// Helper function to clear celebration flags (for testing)
function clearCelebrationFlags() {
  const keys = Object.keys(localStorage);
  let clearedCount = 0;
  keys.forEach(key => {
    if (key.startsWith('celebrated_goal_')) {
      localStorage.removeItem(key);
      clearedCount++;
    }
  });
  console.log(`🎉 Cleared ${clearedCount} celebration flags!`);
}

// Helper function to show current celebration flags (for debugging)
function showCelebrationFlags() {
  const keys = Object.keys(localStorage);
  const celebrationFlags = keys.filter(key => key.startsWith('celebrated_goal_'));
  console.log('🎉 Current celebration flags:', celebrationFlags);
  return celebrationFlags;
}

// Expose functions to window for testing
window.clearCelebrationFlags = clearCelebrationFlags;
window.showCelebrationFlags = showCelebrationFlags;

// Test function to demonstrate the dynamic celebration system
function testCelebrationSystem() {
  console.log('🧪 Testing Dynamic Celebration System...');
  
  // Clear all existing flags
  clearCelebrationFlags();
  
  // Create a test goal
  const testGoal = {
    for: 'Test Goal',
    amount: 1000,
    date: '2024-12-31',
    saved: 0
  };
  
  const goalId = `${testGoal.for}_${testGoal.amount}_${testGoal.date}`;
  console.log(`📝 Test Goal ID: ${goalId}`);
  
  // Simulate different scenarios
  console.log('\n📊 Test Scenarios:');
  console.log('1. Goal at 0% - No celebration');
  console.log('2. Goal at 50% - No celebration');
  console.log('3. Goal at 100% - Should celebrate!');
  console.log('4. Goal drops to 80% - Flag should reset');
  console.log('5. Goal back to 100% - Should celebrate again!');
  
  return {
    goalId,
    testGoal,
    scenarios: [
      { saved: 0, expected: 'No celebration' },
      { saved: 500, expected: 'No celebration' },
      { saved: 1000, expected: 'Should celebrate!' },
      { saved: 800, expected: 'Flag should reset' },
      { saved: 1000, expected: 'Should celebrate again!' }
    ]
  };
}

window.testCelebrationSystem = testCelebrationSystem;
