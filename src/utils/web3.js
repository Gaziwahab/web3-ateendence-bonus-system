import { ethers } from 'ethers';
import {
  SEPOLIA_CHAIN_ID,
  SEPOLIA_HEX_CHAIN_ID,
  SEPOLIA_CONFIG,
  DEFAULT_CONTRACT_ADDRESS,
  CONTRACT_ABI,
} from './constants';

export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && Boolean(window.ethereum);
};

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const getStoredContractAddress = () => {
  return localStorage.getItem('attend_contract_address') || DEFAULT_CONTRACT_ADDRESS;
};

export const setStoredContractAddress = (address) => {
  if (address && ethers.isAddress(address)) {
    localStorage.setItem('attend_contract_address', address);
    return true;
  }
  return false;
};

/**
 * Prompt MetaMask to switch to Sepolia testnet or add it if missing
 */
export const switchToSepoliaNetwork = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask to interact with the blockchain.');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_HEX_CHAIN_ID }],
    });
    return true;
  } catch (switchError) {
    // 4902 means the chain has not been added to MetaMask
    if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [SEPOLIA_CONFIG],
        });
        return true;
      } catch (addError) {
        throw new Error(`Failed to add Sepolia testnet to MetaMask: ${addError.message}`);
      }
    }
    throw switchError;
  }
};

/**
 * Creates Ethers contract instance
 */
export const getContractInstance = async (withSigner = false) => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not detected. Please install the MetaMask extension.');
  }

  const contractAddress = getStoredContractAddress();
  if (!contractAddress || !ethers.isAddress(contractAddress)) {
    throw new Error('Smart contract address is not configured or invalid.');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  
  if (withSigner) {
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
  }

  return new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
};
