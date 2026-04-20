# Instagram Tagger

A browser extension that lets you tag Instagram accounts you follow and filter them by tag.

---

## Overview

If you follow a lot of Instagram accounts across different topics, finding the ones you actually want to browse at a given moment is tedious. This extension lets you assign tags like "jewelry" or "food" to any account, then filter your tagged accounts by those tags from a simple panel.

No login required. No data leaves your browser. Everything is stored locally.

---

## Technical

Built with the Chrome Extension API (Manifest V3), compatible with any Chromium-based browser (Chrome, Edge, Opera, Brave, etc.). Uses a content script to inject a tagging panel into Instagram profile pages, and a popup for filtering. Data is persisted via `chrome.storage.local`.

---

## Installation

1. Download or clone this repository.
2. Open your browser's extensions page (`chrome://extensions`, `opera://extensions`, etc.).
3. Enable Developer Mode.
4. Click "Load unpacked" and select the project folder.

The extension icon will appear in your toolbar.

---

## Usage

**Tagging an account**

Go to any Instagram profile page. A panel will appear in the bottom-right corner showing the current tags for that account. Type a tag and press Enter or click Add. You can add multiple tags to the same account and remove them individually by clicking the x next to each tag.

**Filtering by tag**

Click the extension icon in the toolbar. All your tags will appear as buttons at the top. Click a tag to see only the accounts you assigned it to. Click All to see every tagged account. Clicking an account name opens its Instagram page.

---

## Notes

- If you unfollow an account on Instagram, it will not be automatically removed from your tag list. You need to remove it manually from the popup.
- If the tagging panel does not appear on a profile page, wait a moment and refresh. Instagram's dynamic rendering can sometimes delay the injection.
