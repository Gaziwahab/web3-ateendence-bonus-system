import AttendanceRewardABI from '../contracts/AttendanceRewardABI.json';

export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_HEX_CHAIN_ID = '0xaa36a7';

export const SEPOLIA_CONFIG = {
  chainId: SEPOLIA_HEX_CHAIN_ID,
  chainName: 'Sepolia Testnet',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.sepolia.org', 'https://sepolia.drpc.org'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

export const REWARD_SLABS = [
  {
    min: 0,
    max: 74.99,
    points: 0,
    label: 'Below 75%',
    badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
    description: 'Ineligible for attendance incentive',
  },
  {
    min: 75,
    max: 89.99,
    points: 20,
    label: '75% to 89%',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    description: 'Silver Tier: 20 Incentive Points',
  },
  {
    min: 90,
    max: 100,
    points: 50,
    label: '90% to 100%',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    description: 'Gold Tier: 50 Incentive Points',
  },
];

export const CONTRACT_ABI = AttendanceRewardABI;

export const DEFAULT_CONTRACT_ADDRESS = 
  import.meta.env.VITE_CONTRACT_ADDRESS || '0xd4108EE3a55a2F7e0E97A4dF507235A5E04A7aA1';

export const ETHERSCAN_BASE_URL = 
  import.meta.env.VITE_EXPLORER_URL || 'https://sepolia.etherscan.io';
