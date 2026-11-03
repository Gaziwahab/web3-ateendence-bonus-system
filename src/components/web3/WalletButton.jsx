import React from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useAuth } from '../../context/AuthContext';
import { formatAddress } from '../../utils/web3';
import { Wallet, LogOut, Check, Link as LinkIcon } from 'lucide-react';
import { Button } from '../common/Button';

export const WalletButton = ({ onLinked }) => {
  const { account, isConnected, isConnecting, connectWallet, disconnectWallet } = useWeb3();
  const { profile, linkWallet } = useAuth();
  const [copied, setCopied] = React.useState(false);
  const [isLinking, setIsLinking] = React.useState(false);

  const handleCopy = () => {
    if (!account) return;
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkToProfile = async () => {
    if (!account || !profile) return;
    setIsLinking(true);
    try {
      await linkWallet(account);
      if (onLinked) onLinked();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLinking(false);
    }
  };

  const isCurrentWalletBound = profile?.wallet_address && 
    account && 
    profile.wallet_address.toLowerCase() === account.toLowerCase();

  if (!isConnected) {
    return (
      <Button
        variant="blockchain"
        size="sm"
        onClick={connectWallet}
        loading={isConnecting}
        icon={Wallet}
      >
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Wallet Pill */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <button
          onClick={handleCopy}
          className="font-mono hover:text-purple-600 transition flex items-center gap-1"
          title="Click to copy address"
        >
          {formatAddress(account)}
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : null}
        </button>

        {profile && !isCurrentWalletBound && (
          <button
            onClick={handleLinkToProfile}
            disabled={isLinking}
            className="ml-1 px-1.5 py-0.5 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded text-[10px] font-semibold flex items-center gap-1 transition"
            title="Bind this MetaMask address to your college profile"
          >
            <LinkIcon className="w-2.5 h-2.5" />
            {isLinking ? 'Binding...' : 'Bind to Profile'}
          </button>
        )}

        <button
          onClick={disconnectWallet}
          className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition"
          title="Disconnect wallet"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
