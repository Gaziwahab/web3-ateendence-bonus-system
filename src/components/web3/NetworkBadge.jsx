import React from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { Radio, AlertTriangle } from 'lucide-react';

export const NetworkBadge = () => {
  const { isConnected, isSepolia, switchNetwork } = useWeb3();

  if (!isConnected) return null;

  if (isSepolia) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-medium rounded-full">
        <Radio className="w-3 h-3 text-purple-500 animate-pulse" />
        <span>Sepolia Testnet</span>
      </div>
    );
  }

  return (
    <button
      onClick={switchNetwork}
      className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-300 text-amber-800 text-xs font-semibold rounded-full hover:bg-amber-100 transition shadow-sm"
      title="Click to switch MetaMask to Sepolia Testnet"
    >
      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
      <span>Switch to Sepolia</span>
    </button>
  );
};
