// Instagram profil sayfasında çalışır
// Kullanıcı adını URL'den alır, etiket butonu ekler

let currentUsername = null;
let panelInjected = false;

function getUsernameFromURL() {
    const match = location.pathname.match(/^\/([^\/]+)\/?$/);
    return match ? match[1] : null;
}

function isProfilePage() {
    const username = getUsernameFromURL();
    const excluded = ['explore', 'reels', 'stories', 'direct', 'accounts', 'p', 'tv'];
    return username && !excluded.includes(username);
}

async function getTags(username) {
    return new Promise(resolve => {
        chrome.storage.local.get(['taggedAccounts'], (result) => {
            const data = result.taggedAccounts || {};
            resolve(data[username]?.tags || []);
        });
    });
}

async function saveTags(username, tags) {
    return new Promise(resolve => {
        chrome.storage.local.get(['taggedAccounts'], (result) => {
            const data = result.taggedAccounts || {};
            if (!data[username]) data[username] = {};
            data[username].tags = tags;
            data[username].url = `https://www.instagram.com/${username}/`;
            chrome.storage.local.set({ taggedAccounts: data }, resolve);
        });
    });
}

async function injectPanel() {
    if (panelInjected) return;
    const username = getUsernameFromURL();
    if (!username || !isProfilePage()) return;

    currentUsername = username;
    panelInjected = true;

    const existingTags = await getTags(username);

    // Panel oluştur
    const panel = document.createElement('div');
    panel.id = 'ig-tagger-panel';
    panel.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #fff;
    border: 1.5px solid #dbdbdb;
    border-radius: 16px;
    padding: 16px 20px;
    z-index: 99999;
    font-family: -apple-system, sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.13);
    min-width: 240px;
  `;

    panel.innerHTML = `
    <div style="font-weight:700;margin-bottom:10px;color:#111;">
      🏷️ @${username} Etiketleri
    </div>
    <div id="ig-tag-list" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;"></div>
    <div style="display:flex;gap:6px;">
      <input id="ig-tag-input" type="text" placeholder="Etiket ekle (örn: takı)"
        style="flex:1;padding:6px 10px;border:1px solid #dbdbdbff;border-radius:8px;font-size:13px;outline:none;color:#111;" />
      <button id="ig-tag-add"
        style="background:#0095f6;color:#fff;border:none;border-radius:8px;padding:6px 12px;cursor:pointer;font-size:13px;">
        Ekle
      </button>
    </div>
    <div id="ig-tag-msg" style="margin-top:8px;font-size:12px;color:#888;"></div>
  `;

    document.body.appendChild(panel);

    function renderTags(tags) {
        const list = document.getElementById('ig-tag-list');
        list.innerHTML = '';
        if (tags.length === 0) {
            list.innerHTML = '<span style="color:#aaa;font-size:12px;">Henüz etiket yok</span>';
            return;
        }
        tags.forEach(tag => {
            const chip = document.createElement('span');
            chip.style.cssText = `
        background:#f0f0f0;border-radius:20px;padding:3px 10px;
        font-size:12px;cursor:pointer;display:flex;align-items:center;gap:5px;color:#111;
      `;
            chip.innerHTML = `${tag} <span style="color:#999;font-size:11px;" data-remove="${tag}">✕</span>`;
            chip.querySelector('[data-remove]').addEventListener('click', async () => {
                const newTags = existingTagsRef.filter(t => t !== tag);
                existingTagsRef.length = 0;
                existingTagsRef.push(...newTags);
                await saveTags(username, newTags);
                renderTags(newTags);
            });
            list.appendChild(chip);
        });
    }

    // Referans dizisi (chip silme için)
    const existingTagsRef = [...existingTags];
    renderTags(existingTagsRef);

    document.getElementById('ig-tag-add').addEventListener('click', async () => {
        const input = document.getElementById('ig-tag-input');
        const msg = document.getElementById('ig-tag-msg');
        const newTag = input.value.trim().toLowerCase();
        if (!newTag) return;
        if (existingTagsRef.includes(newTag)) {
            msg.textContent = 'Bu etiket zaten var.';
            return;
        }
        existingTagsRef.push(newTag);
        await saveTags(username, [...existingTagsRef]);
        renderTags([...existingTagsRef]);
        input.value = '';
        msg.textContent = '✓ Kaydedildi!';
        setTimeout(() => { msg.textContent = ''; }, 1500);
    });

    // Enter tuşu desteği
    document.getElementById('ig-tag-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('ig-tag-add').click();
    });
}

function cleanup() {
    const panel = document.getElementById('ig-tagger-panel');
    if (panel) panel.remove();
    panelInjected = false;
    currentUsername = null;
}

// Instagram SPA olduğu için URL değişimini izle
let lastPath = location.pathname;
setInterval(() => {
    if (location.pathname !== lastPath) {
        lastPath = location.pathname;
        cleanup();
        setTimeout(injectPanel, 1000);
    }
}, 500);

// İlk yükleme
setTimeout(injectPanel, 1500);