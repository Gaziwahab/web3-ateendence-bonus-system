# 🎓 Attendance-Linked Incentive Program
### *A Blockchain-Based Web Application for College Attendance Management & Automated Token Rewards*

[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase%20PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![Solidity](https://img.shields.io/badge/Smart%20Contract-Solidity%20%5E0.8.20-363636?logo=solidity)](https://soliditylang.org/)
[![Ethers.js](https://img.shields.io/badge/Web3-Ethers.js%20v6-2535A0)](https://docs.ethers.org/)
[![Network](https://img.shields.io/badge/Network-Ethereum%20Sepolia%20Testnet-8A2BE2)](https://sepolia.etherscan.io/)

---

## 📌 1. Project Overview

The **Attendance-Linked Incentive Program** is a decentralized application designed for colleges and universities to modernize attendance management. Traditional systems suffer from low student motivation and lack transparency. This project pairs a relational database (Supabase) with an immutable smart contract (Solidity on Ethereum Sepolia) to create an auditable, incentive-driven academic ecosystem.

### Key Pillars:
1. **Privacy-Preserving Architecture:** Student identities and daily lecture records remain off-chain in Supabase with Row Level Security (RLS), avoiding unnecessary gas costs and public exposure of private student data.
2. **Automated Incentive Calculation:** System evaluates student attendance percentage and automatically calculates incentive eligibility according to academic slabs.
3. **Immutable Smart Contract Distribution:** Eligible students receive reward points directly to their MetaMask wallets through an access-controlled smart contract on the Sepolia testnet.
4. **Duplicate Prevention:** Cryptographic and database constraints prevent duplicate attendance submissions and duplicate semester rewards.

---

## 🏗️ 2. System Architecture

```mermaid
flowchart TD
    subgraph Frontend["React.js + Tailwind CSS Frontend"]
        AdminUI["Admin Dashboard"]
        FacultyUI["Faculty Dashboard"]
        StudentUI["Student Dashboard"]
    end

    subgraph Supabase["Supabase Cloud / Database"]
        Auth["Supabase Auth (JWT)"]
        DBProfiles["profiles table"]
        DBAttendance["attendance table (Unique constraint)"]
        DBSubjects["subjects table"]
        DBRewards["rewards table (Tx Hash audit)"]
    end

    subgraph Blockchain["Ethereum Sepolia Testnet"]
        MetaMask["MetaMask Extension"]
        SmartContract["AttendanceReward.sol"]
        Etherscan["Sepolia Etherscan Explorer"]
    end

    FacultyUI -->|Mark Daily Attendance| DBAttendance
    AdminUI -->|Calculate Attendance %| DBAttendance
    AdminUI -->|Sign distributeReward()| MetaMask
    MetaMask -->|Execute Transaction| SmartContract
    SmartContract -->|Emit RewardDistributed| Etherscan
    SmartContract -->|Return Tx Hash| AdminUI
    AdminUI -->|Record Tx Hash| DBRewards
    StudentUI -->|Query Reward Balance| SmartContract
    StudentUI -->|View Attendance & Tx History| DBRewards
```

---

## 👥 3. User Roles & Capabilities

| Role | Core Functions |
|---|---|
| **College Admin** | View overall stats, manage students & faculty, assign courses, evaluate semester attendance %, connect MetaMask admin wallet, execute on-chain reward distribution, audit transaction hashes. |
| **Faculty Member** | View assigned courses, select class date, toggle student presence (Present/Absent), bulk-mark shortcuts, submit daily attendance with duplicate prevention, review history. |
| **Enrolled Student** | View overall & subject-wise attendance %, check reward tier eligibility, view smart contract point balance live from Sepolia, review blockchain receipts with clickable Etherscan links, bind MetaMask wallet. |

---

## 🏆 4. Attendance Reward Slabs

| Attendance Percentage | Tier | Reward Points | Blockchain Eligibility |
|---|---|---|---|
| **Below 75.00%** | Ineligible | **0 Points** | Restricted (reverts if called) |
| **75.00% to 89.99%** | Silver Tier | **20 Points** | 1 payout per student per semester |
| **90.00% to 100.00%** | Gold Tier | **50 Points** | 1 payout per student per semester |

$$\text{Attendance Percentage} = \left(\frac{\text{Total Present Lectures}}{\text{Total Conducted Lectures}}\right) \times 100$$

---

## 📜 5. Smart Contract Specifications

Contract File: `contracts/AttendanceReward.sol`  
Solidity Version: `^0.8.20`

### Functions:
- `distributeReward(address student, uint256 points, uint256 semesterId)`: Callable strictly by the `owner` (College Admin). Transcripts balance to student and flags semester payout to prevent duplicate claims.
- `distributeRewardBatch(address[] calldata students, uint256[] calldata points, uint256 semesterId)`: Gas-optimized batch distribution for whole batches.
- `getRewardBalance(address student)`: Public view function returning cumulative on-chain point balance of a student.
- `hasReceivedReward(address student, uint256 semesterId)`: Public view function verifying if student was already rewarded for a semester.
- `event RewardDistributed(address indexed student, uint256 points, uint256 indexed semesterId, uint256 timestamp)`: Indexed event logged on Sepolia for instant indexing and explorer lookup.

---

## 🚀 6. Quick Start & Setup Guide

### Prerequisites:
- **Node.js** (v18 or higher)
- **MetaMask** browser extension with Sepolia Testnet enabled
- Free Sepolia ETH from Google Cloud Web3 Faucet or Sepolia PoW Faucet (0.01 Sepolia ETH is more than enough for testing)

### Step 1: Clone & Install Dependencies
```bash
# Navigate to project folder
cd attendence

# Install dependencies
npm install
```

### Step 2: Start Frontend Development Server
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

> [!NOTE]
> **Zero-Config Viva Ready:** The application opens in **Demo / Viva Mode** by default with pre-seeded students, subjects, attendance percentages, and test accounts. You can instantly switch between Admin, Faculty, and Student personas from the top header!

---

## 🗄️ 7. Connecting Live Supabase Database (Optional / Production)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase Dashboard, go to the **SQL Editor**.
3. Open `supabase/schema.sql` from this repository, paste its contents into the SQL Editor, and click **Run**.
4. In Supabase, go to **Project Settings -> API** and copy your:
   - **Project URL**
   - **anon / public key**
5. Paste them into your `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
6. Restart Vite (`npm run dev`). The app will now communicate directly with your live Supabase cloud database!

---

## ⛓️ 8. Deploying Smart Contract via Remix IDE

1. Go to [remix.ethereum.org](https://remix.ethereum.org).
2. Create a file named `AttendanceReward.sol` under the `contracts/` directory in Remix.
3. Copy the code from `contracts/AttendanceReward.sol` and paste it into Remix.
4. Go to **Solidity Compiler** (left tab), select compiler version `0.8.20`, and click **Compile AttendanceReward.sol**.
5. Go to **Deploy & Run Transactions**:
   - Environment: Select **Injected Provider - MetaMask**.
   - Make sure your MetaMask is connected to **Sepolia Testnet**.
   - Click **Deploy** and confirm the transaction in MetaMask.
6. Once deployed, copy the contract address from the bottom left of Remix.
7. Open the application, click the **Settings (⚙️)** icon in the top header, paste the deployed contract address, and click **Save Address**.

---

## 🎓 9. College Viva / Exam Defense Preparation (Q&A)

### Q1: Why use a hybrid approach (Supabase + Blockchain) instead of storing everything on-chain?
> **Answer:** Storing every single lecture attendance mark on Ethereum would result in prohibitive gas costs, slow transaction confirmation times, and privacy violations (FERPA/GDPR compliance). In our architecture, high-frequency attendance data and student identities stay in private, fast Supabase PostgreSQL tables. Only final, semester-level token rewards are minted on the blockchain, providing tamper-proof credentialing with minimal gas footprint.

### Q2: How does the system prevent duplicate rewards?
> **Answer:** Duplicate prevention is implemented at two independent layers:
> 1. **Database Layer:** A unique constraint on `rewards(student_id, semester_id)` in PostgreSQL prevents multiple entries.
> 2. **Smart Contract Layer:** A nested mapping `mapping(address => mapping(uint256 => bool)) private _hasReceivedReward` checks `require(!_hasReceivedReward[student][semesterId], "Reward already distributed")`. If an admin attempts a duplicate payout, the EVM transaction reverts.

### Q3: How is faculty attendance submission secured against duplicate entries?
> **Answer:** In Supabase, the table has `CONSTRAINT unique_student_subject_date UNIQUE (student_id, subject_id, attendance_date)`. If faculty re-marks attendance for the same day, the system performs an upsert/update rather than inserting duplicate records.

### Q4: What happens if an unauthorized wallet attempts to distribute rewards?
> **Answer:** The smart contract incorporates the `onlyOwner` modifier on `distributeReward`. Any transaction originating from an address other than the deploying college administrator wallet immediately reverts with the error: *"Only authorized college admin can call this function"*.

---

## 📁 10. Folder Structure

```
attendence/
├── contracts/
│   └── AttendanceReward.sol        # Solidity smart contract
├── supabase/
│   ├── schema.sql                  # PostgreSQL tables, RLS policies, triggers
│   └── seed.sql                    # SQL seed script
├── src/
│   ├── components/
│   │   ├── common/                 # Reusable Card, Button, Badge, Modal, Toast
│   │   ├── layout/                 # Header, Sidebar, DashboardLayout
│   │   └── web3/                   # WalletButton, NetworkBadge, ContractSetupModal
│   ├── context/
│   │   ├── AuthContext.jsx         # Supabase Auth + Demo Role Switcher
│   │   └── Web3Context.jsx         # Ethers.js v6 + MetaMask + Sepolia logic
│   ├── contracts/
│   │   └── AttendanceRewardABI.json # Compiled smart contract ABI
│   ├── pages/
│   │   ├── LandingPage.jsx         # Project overview & demo launchers
│   │   ├── LoginPage.jsx           # Sign in page
│   │   ├── RegisterPage.jsx        # Registration with role & wallet binding
│   │   ├── admin/                  # Admin dashboard & management pages
│   │   ├── faculty/                # Faculty dashboard & attendance marking
│   │   └── student/                # Student dashboard & reward claim status
│   ├── services/
│   │   ├── attendanceService.js    # Data repository (Supabase + local fallback)
│   │   ├── mockData.js             # Seed records for viva demonstration
│   │   └── supabase.js             # Supabase client initialization
│   ├── utils/
│   │   ├── attendanceCalculator.js # Attendance % & reward slabs math
│   │   ├── constants.js            # Slabs, Sepolia Chain IDs, RPCs
│   │   └── web3.js                 # Network switching & Ethers contract helpers
│   ├── App.jsx                     # Route definitions
│   └── main.jsx
├── .env.example                    # Environment variable template
├── tailwind.config.js              # Theme customization
└── package.json
```
