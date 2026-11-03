import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  SEPOLIA_CHAIN_ID,
  ETHERSCAN_BASE_URL,
} from '../utils/constants';
import {
  isMetaMaskInstalled,
  switchToSepoliaNetwork,
  getContractInstance,
  getStoredContractAddress,
  setStoredContractAddress,
} from '../utils/web3';

const Web3Context = createContext(null);

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isContractLoading, setIsContractLoading] = useState(false);
  const [contractAddress, setContractAddressState] = useState(getStoredContractAddress());
  const [error, setError] = useState(null);

  const isSepolia = chainId === SEPOLIA_CHAIN_ID;
  const isConnected = Boolean(account);

  // Check initial connection
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const checkInitialState = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_accounts', []);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
        const network = await provider.getNetwork();
        setChainId(Number(network.chainId));
      } catch (err) {
        console.warn('Initial web3 state check error:', err);
      }
    };

    checkInitialState();

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        setAccount(null);
      }
    };

    const handleChainChanged = (newChainId) => {
      setChainId(parseInt(newChainId, 16));
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const connectWallet = async () => {
    setError(null);
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed. Please install MetaMask to connect your wallet.');
      return false;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);
      setChainId(currentChainId);

      // Prompt to switch network if not Sepolia
      if (currentChainId !== SEPOLIA_CHAIN_ID) {
        await switchToSepoliaNetwork();
        const updatedNet = await provider.getNetwork();
        setChainId(Number(updatedNet.chainId));
      }
      return accounts[0];
    } catch (err) {
      console.error('Wallet connection error:', err);
      if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
        setError('Connection request was rejected in MetaMask.');
      } else {
        setError(err.message || 'Failed to connect MetaMask.');
      }
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  const switchNetwork = async () => {
    try {
      setError(null);
      await switchToSepoliaNetwork();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const updateContractAddress = (newAddress) => {
    if (setStoredContractAddress(newAddress)) {
      setContractAddressState(newAddress);
      return true;
    }
    return false;
  };

  /**
   * Distribute reward points to a student on the blockchain
   */
  const distributeRewardOnChain = async (studentWallet, points, semesterId) => {
    if (!isConnected) {
      throw new Error('Please connect your MetaMask admin wallet first.');
    }
    if (!isSepolia) {
      throw new Error('Please switch MetaMask network to Sepolia Testnet.');
    }
    if (!studentWallet || !ethers.isAddress(studentWallet)) {
      throw new Error('Student does not have a valid Ethereum wallet address bound.');
    }

    setIsContractLoading(true);
    setError(null);

    try {
      const contract = await getContractInstance(true);
      
      // First check if already distributed on-chain
      const alreadyClaimed = await contract.hasReceivedReward(studentWallet, Number(semesterId));
      if (alreadyClaimed) {
        throw new Error(`Student has already received rewards for Semester ${semesterId} on the blockchain.`);
      }

      // Execute transaction
      const tx = await contract.distributeReward(studentWallet, Number(points), Number(semesterId));
      
      // Wait for 1 confirmation
      const receipt = await tx.wait(1);

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        explorerUrl: `${ETHERSCAN_BASE_URL}/tx/${receipt.hash}`,
      };
    } catch (err) {
      console.error('Smart contract distribution error:', err);
      let userFriendlyMessage = err.reason || err.message;

      if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
        userFriendlyMessage = 'Transaction was rejected by user in MetaMask.';
      } else if (err.message && err.message.includes('insufficient funds')) {
        userFriendlyMessage = 'Insufficient Sepolia ETH in your admin wallet to pay for transaction gas fees.';
      } else if (err.message && err.message.includes('Only authorized college admin')) {
        userFriendlyMessage = 'Your connected wallet is not the owner/admin of this smart contract.';
      }

      setError(userFriendlyMessage);
      throw new Error(userFriendlyMessage);
    } finally {
      setIsContractLoading(false);
    }
  };

  /**
   * Read reward balance directly from smart contract
   */
  const getOnChainStudentBalance = useCallback(async (studentWallet) => {
    if (!studentWallet || !ethers.isAddress(studentWallet)) return 0;
    
    try {
      const contract = await getContractInstance(false);
      const balance = await contract.getRewardBalance(studentWallet);
      return Number(balance);
    } catch (err) {
      console.warn('Could not fetch on-chain balance (contract might not be deployed at this address yet):', err.message);
      return null;
    }
  }, []);

  /**
   * Check on-chain whether reward was already distributed
   */
  const checkOnChainHasReceived = useCallback(async (studentWallet, semesterId) => {
    if (!studentWallet || !ethers.isAddress(studentWallet)) return false;
    
    try {
      const contract = await getContractInstance(false);
      const received = await contract.hasReceivedReward(studentWallet, Number(semesterId));
      return Boolean(received);
    } catch (err) {
      console.warn('Could not check hasReceivedReward on-chain:', err.message);
      return false;
    }
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        isSepolia,
        isConnected,
        isConnecting,
        isContractLoading,
        contractAddress,
        error,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        updateContractAddress,
        distributeRewardOnChain,
        getOnChainStudentBalance,
        checkOnChainHasReceived,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
