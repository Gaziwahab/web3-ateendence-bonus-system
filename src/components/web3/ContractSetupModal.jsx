import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useWeb3 } from '../../context/Web3Context';
import { Copy, Check, ExternalLink, ShieldCheck, Terminal } from 'lucide-react';
import { ETHERSCAN_BASE_URL } from '../../utils/constants';

export const ContractSetupModal = ({ isOpen, onClose }) => {
  const { contractAddress, updateContractAddress } = useWeb3();
  const [inputAddress, setInputAddress] = useState(contractAddress || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (updateContractAddress(inputAddress.trim())) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } else {
      alert('Please enter a valid 42-character Ethereum hex address (0x...).');
    }
  };

  const copyContractCode = () => {
    // Read the contract string or copy snippet
    const codeSnippet = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AttendanceReward {
    address public owner;
    uint256 public totalPointsDistributed;
    uint256 public totalTransactionsCount;

    mapping(address => uint256) private _rewardBalances;
    mapping(address => mapping(uint256 => bool)) private _hasReceivedReward;

    event RewardDistributed(address indexed student, uint256 points, uint256 indexed semesterId, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only authorized college admin can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function distributeReward(address student, uint256 points, uint256 semesterId) external onlyOwner {
        require(student != address(0), "Invalid student wallet address");
        require(points > 0, "Reward points must be greater than zero");
        require(semesterId > 0, "Invalid semester ID");
        require(!_hasReceivedReward[student][semesterId], "Reward already distributed for this semester");

        _hasReceivedReward[student][semesterId] = true;
        _rewardBalances[student] += points;
        totalPointsDistributed += points;
        totalTransactionsCount += 1;

        emit RewardDistributed(student, points, semesterId, block.timestamp);
    }

    function getRewardBalance(address student) external view returns (uint256) {
        return _rewardBalances[student];
    }

    function hasReceivedReward(address student, uint256 semesterId) external view returns (bool) {
        return _hasReceivedReward[student][semesterId];
    }
}`;
    navigator.clipboard.writeText(codeSnippet);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Blockchain & Smart Contract Configuration" maxWidth="max-w-2xl">
      <div className="space-y-5 text-sm text-slate-600">
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-purple-900">Ethereum Sepolia Testnet Contract</h4>
            <p className="text-xs text-purple-700 mt-1">
              Reward distribution transactions are signed and recorded on the Sepolia testnet via MetaMask. No real money or ETH is spent.
            </p>
          </div>
        </div>

        {/* Current Contract Address Form */}
        <form onSubmit={handleSave} className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Active Smart Contract Address
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 font-mono text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
            />
            <Button type="submit" variant="primary" size="md">
              Save Address
            </Button>
          </div>
          {savedSuccess && (
            <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Contract address updated successfully!
            </p>
          )}
          {contractAddress && (
            <div className="flex items-center gap-2 text-xs">
              <a
                href={`${ETHERSCAN_BASE_URL}/address/${contractAddress}`}
                target="_blank"
                rel="noreferrer"
                className="text-purple-600 hover:text-purple-700 hover:underline flex items-center gap-1 font-medium"
              >
                View on Sepolia Etherscan <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </form>

        {/* Remix IDE Deployment Quick Guide */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-600" />
              How to Deploy via Remix IDE (For College Viva Demo)
            </span>
            <Button variant="secondary" size="sm" onClick={copyContractCode} icon={copiedContract ? Check : Copy}>
              {copiedContract ? 'Copied Code' : 'Copy Solidity'}
            </Button>
          </div>

          <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 pl-1">
            <li>
              Open <a href="https://remix.ethereum.org" target="_blank" rel="noreferrer" className="text-purple-600 underline font-medium">Remix IDE (remix.ethereum.org)</a> in your browser.
            </li>
            <li>Create a new file called <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">AttendanceReward.sol</code> and paste the copied code.</li>
            <li>In Remix left bar, open the <strong>Solidity Compiler</strong> tab and click <strong>Compile AttendanceReward.sol</strong>.</li>
            <li>Go to the <strong>Deploy & Run Transactions</strong> tab. Change Environment to <strong>"Injected Provider - MetaMask"</strong>.</li>
            <li>Ensure MetaMask is connected to <strong>Sepolia Testnet</strong>, click <strong>Deploy</strong>, and confirm the transaction in MetaMask.</li>
            <li>Copy the deployed contract address from Remix and paste it into the field above!</li>
          </ol>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
