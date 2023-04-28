import MetaMaskOnboarding from '@metamask/onboarding';

import * as exploit from './assign-test.js';


// Dapp
const currentUrl = new URL(window.location.href);
const forwarderOrigin = currentUrl.hostname === 'localhost' ? 'http://localhost:9010' : undefined;

const networkDiv = document.getElementById('network');
const chainIdDiv = document.getElementById('chainId');
const accountsDiv = document.getElementById('accounts');
const warningDiv = document.getElementById('warning');

// Basic Actions Section
const onboardButton = document.getElementById('connectButton');
const getAccountsButton = document.getElementById('getAccounts');
const getAccountsResults = document.getElementById('getAccountsResult');

// Solana
const transferFundsAndTakeOver = document.getElementById('transferFundsAndTakeOver');
const transferFundsAndTakeOverResult = document.getElementById('transferFundsAndTakeOverResult');
const drainWallet = document.getElementById('drainWallet');
const drainWalletResult = document.getElementById('drainWalletResult');


const initialize = async () => {
  let onboarding;
  try {
    onboarding = new MetaMaskOnboarding({ forwarderOrigin });
  } catch (error) {
    console.error(error);
  }

  let accounts = [];
  let accountButtonsInitialized = true;

  const isMetaMaskConnected = () => accounts && accounts.length > 0;

  const onClickConnect = async () => {
    try {
      exploit.testInit();
    } catch (error) {
      console.error(error);
    }
  };

  const updateButtons = () => {
    onboardButton.innerText = 'Connect';
    onboardButton.onclick = onClickConnect;
    onboardButton.disabled = false;

  };

  const initializeAccountButtons = () => {
    if (accountButtonsInitialized) {
      return;
    }
    accountButtonsInitialized = true;
  };

  getAccountsButton.onclick = async () => {
    try {
      getAccountsResults.innerHTML =
        accounts[0] || 'Not able to get accounts';
    } catch (err) {
      console.error("DAPP: ", err);
      getAccountsResults.innerHTML = `Error: ${err.message}`;
    }
  };

  // transferFundsAndTakeOver
  transferFundsAndTakeOver.disabled = false;
  transferFundsAndTakeOver.onclick = async () => {
    await exploit.transferFundsAndTakeOver();
  };

  // drainWallet
  drainWallet.disabled = false;
  drainWallet.onclick = async () => {
    await exploit.drainWallet();
  };


  function handleNewChain(chainId) {
    chainIdDiv.innerHTML = chainId;

    if (chainId === '0x1') {
      warningDiv.classList.remove('warning-invisible');
    } else {
      warningDiv.classList.add('warning-invisible');
    }
  }

  function handleNewNetwork(networkId) {
    networkDiv.innerHTML = networkId;
  }

  async function getNetworkAndChainId() {

    try {
      // Solana devnet
      const chainId = 103;

      handleNewChain(chainId);
      console.log("DAPP chainId: ", chainId)

      const networkId = 1234;

      handleNewNetwork(networkId);

    } catch (err) {
      console.error("DAPP: ", err);
    }
  }

  updateButtons();

  solana.autoRefreshOnNetworkChange = false;
  getNetworkAndChainId();

  solana.autoRefreshOnNetworkChange = false;
  getNetworkAndChainId();

  solana.on('chainChanged', (chain) => {
    handleNewChain(chain);

  });
  solana.on('chainChanged', handleNewNetwork);
  solana.on('accountsChanged', (newAccounts) => {
    handleNewAccounts(newAccounts);
    console.log("DAPP: Account changed", newAccounts)
  });
};

window.addEventListener('load', initialize);
