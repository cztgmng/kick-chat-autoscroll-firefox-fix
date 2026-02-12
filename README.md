# Kick Chat Auto-Scroll Fix 

A UserScript (Tampermonkey/Greasemonkey) that improves the chat experience on [Kick.com](https://kick.com). 

## The Problem
By default, Kick's chat on Firefox aggressively auto-scrolls to the bottom whenever a new message arrives. This makes it nearly impossible to scroll up and read previous messages in active streams.

## The Solution
This script intercepts Kick's scroll behavior:
1.  **Smart Locking:** Detects when you scroll up (to read history) and "locks" the view, preventing new messages from yanking you down.
2.  **Resume Button:** Adds a floating "Resume Chat" button when you are scrolled up.
3.  **Debug Panel:** A small overlay (top-right) showing the current lock status and scroll distance (useful for debugging).

## Installation

1.  Install the **Tampermonkey** extension for your browser (Chrome, Firefox, Edge, etc.).
2.  Click the Tampermonkey icon and select **"Create a new script..."**
3.  Delete any default code in the editor.
4.  Copy and paste the code from `script.js` in this repository.
5.  Press `Ctrl+S` or `Cmd+S` to save.
