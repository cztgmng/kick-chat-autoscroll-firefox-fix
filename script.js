// ==UserScript==
// @name         Kick Chat Anti-AutoScroll (Debug + Fix v7 with Scroll Button)
// @namespace    http://tampermonkey.net/
// @version      7.0
// @description  Prevents auto-scroll with visual debugging and a manual Scroll-to-Bottom button.
// @author       You
// @match        https://kick.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    console.log("[KickFix] Script started.");

    const CHAT_ID = 'chatroom-messages';
    let chatContainer = null;
    let isLocked = false;

    // =========================================================================
    // 1. VISUAL DEBUG PANEL
    // =========================================================================
    const debugPanel = document.createElement('div');
    debugPanel.style.cssText = `
        position: fixed; top: 60px; right: 10px; z-index: 99999;
        background: rgba(0,0,0,0.8); color: white; padding: 10px;
        font-family: monospace; font-size: 12px; border-radius: 5px;
        pointer-events: none; border: 2px solid #00ff00;
        min-width: 200px;
    `;
    debugPanel.innerHTML = 'KickFix: WAITING...';
    document.body.appendChild(debugPanel);

    function updateDebug(dist, locked) {
        debugPanel.style.borderColor = locked ? 'red' : '#00ff00';
        debugPanel.innerHTML = `
            <strong>KickFix v7.0</strong><br>
            Status: ${locked ? '<span style="color:red">LOCKED (Reading History)</span>' : '<span style="color:#00ff00">LIVE (Auto-Scroll)</span>'}<br>
            Dist from Bottom: ${Math.round(dist)}px<br>
            ScrollTop: ${Math.round(chatContainer ? chatContainer.scrollTop : 0)}
        `;
    }

    // =========================================================================
    // 1.5 SCROLL TO BOTTOM BUTTON
    // =========================================================================
    const scrollBtn = document.createElement('button');
    scrollBtn.innerText = '⬇ Resume Chat';
    scrollBtn.style.cssText = `
        position: fixed; bottom: 120px; right: 20px; z-index: 99999;
        background: #53fc18; color: #000; padding: 10px 20px;
        font-family: sans-serif; font-weight: bold; font-size: 14px;
        border: 2px solid #000; border-radius: 20px; cursor: pointer;
        box-shadow: 0 4px 6px rgba(0,0,0,0.5); display: none;
    `;

    // When clicked, unlock the trap and force scroll
    scrollBtn.onclick = function() {
        if (!chatContainer) return;
        console.log("[KickFix] Manual Scroll Requested");

        // 1. Unlock first so the interceptors don't block the scroll
        isLocked = false;

        // 2. Force scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // 3. Hide button immediately
        scrollBtn.style.display = 'none';
    };
    document.body.appendChild(scrollBtn);


    // =========================================================================
    // 2. THE INTERCEPTORS (The traps)
    // =========================================================================

    // TRAP A: Block 'scrollIntoView' on message elements
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function(...args) {
        if (isLocked && this.closest && this.closest(`#${CHAT_ID}`)) {
            console.log("[KickFix] BLOCKED scrollIntoView call on message element.", this);
            return; // DENIED
        }
        return originalScrollIntoView.apply(this, args);
    };

    // TRAP B: Block 'scrollTop' assignment
    const originalScrollTopDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop');
    if (originalScrollTopDescriptor) {
        Object.defineProperty(Element.prototype, 'scrollTop', {
            get: function() {
                return originalScrollTopDescriptor.get.call(this);
            },
            set: function(value) {
                if (this.id === CHAT_ID && isLocked) {
                    console.log(`[KickFix] BLOCKED scrollTop set to ${value} (Current: ${this.scrollTop})`);
                    return; // DENIED
                }
                originalScrollTopDescriptor.set.call(this, value);
            }
        });
    }

    // TRAP C: Block 'scrollTo' function
    const originalScrollTo = Element.prototype.scrollTo;
    Element.prototype.scrollTo = function(x, y) {
        if (this.id === CHAT_ID && isLocked) {
             console.log("[KickFix] BLOCKED scrollTo() call.");
             return; // DENIED
        }
        return originalScrollTo.apply(this, arguments);
    };


    // =========================================================================
    // 3. MAIN LOGIC
    // =========================================================================
    function init() {
        chatContainer = document.getElementById(CHAT_ID);

        if (!chatContainer) {
            setTimeout(init, 500);
            return;
        }

        console.log("[KickFix] Chat container found:", chatContainer);

        chatContainer.style.overflowAnchor = 'none';

        // Listen for ANY scroll on the chat container
        chatContainer.addEventListener('scroll', () => {
            const dist = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight;

            // Threshold logic
            isLocked = dist > 100;

            // Update Debug Panel
            updateDebug(dist, isLocked);

            // Toggle Button Visibility based on lock state
            scrollBtn.style.display = isLocked ? 'block' : 'none';
        });
    }

    init();

})();