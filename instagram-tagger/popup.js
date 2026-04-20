let allData = {};
let activeTag = null;

async function loadData() {
    return new Promise(resolve => {
        chrome.storage.local.get(['taggedAccounts'], (result) => {
            resolve(result.taggedAccounts || {});
        });
    });
}

function getAllTags(data) {
    const tagSet = new Set();
    Object.values(data).forEach(acc => {
        (acc.tags || []).forEach(t => tagSet.add(t));
    });
    return [...tagSet].sort();
}

function renderTagFilters(tags) {
    const container = document.getElementById('tag-filters');
    container.innerHTML = '';

    if (tags.length === 0) {
        container.innerHTML = '<span style="color:#aaa;font-size:12px;">Henüz etiket eklenmedi.</span>';
        return;
    }

    // "Tümü" butonu
    const allBtn = document.createElement('button');
    allBtn.className = 'tag-btn' + (activeTag === null ? ' active' : '');
    allBtn.textContent = 'Tümü';
    allBtn.addEventListener('click', () => { activeTag = null; render(); });
    container.appendChild(allBtn);

    tags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'tag-btn' + (activeTag === tag ? ' active' : '');
        btn.textContent = tag;
        btn.addEventListener('click', () => { activeTag = tag; render(); });
        container.appendChild(btn);
    });
}

function renderAccounts(data) {
    const list = document.getElementById('account-list');
    const empty = document.getElementById('empty');
    list.innerHTML = '';

    const filtered = Object.entries(data).filter(([username, acc]) => {
        if (activeTag === null) return true;
        return (acc.tags || []).includes(activeTag);
    });

    if (filtered.length === 0) {
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    filtered.forEach(([username, acc]) => {
        const item = document.createElement('div');
        item.className = 'account-item';
        item.innerHTML = `
      <a href="https://www.instagram.com/${username}/" target="_blank">@${username}</a>
      <div class="account-tags">
        ${(acc.tags || []).map(t => `<span class="mini-tag">${t}</span>`).join('')}
      </div>
    `;
        list.appendChild(item);
    });
}

async function render() {
    allData = await loadData();
    const tags = getAllTags(allData);
    renderTagFilters(tags);
    renderAccounts(allData);
}

render();