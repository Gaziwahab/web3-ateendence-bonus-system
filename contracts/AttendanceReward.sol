// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AttendanceReward
 * @dev Attendance-Linked Incentive Smart Contract for College Attendance Management.
 * Implements access-controlled incentive points distribution based on attendance percentages.
 * Deployable on Sepolia Testnet or any EVM-compatible chain via Remix IDE.
 */
contract AttendanceReward {
    // Contract owner (College Admin)
    address public owner;

    // Total reward points distributed across all students
    uint256 public totalPointsDistributed;

    // Total distribution transactions count
    uint256 public totalTransactionsCount;

    // Mapping: student address => cumulative reward points balance
    mapping(address => uint256) private _rewardBalances;

    // Mapping: student address => semesterId => boolean (has student received reward for this semester)
    mapping(address => mapping(uint256 => bool)) private _hasReceivedReward;

    // Reward distribution record
    struct RewardRecord {
        address student;
        uint256 points;
        uint256 semesterId;
        uint256 timestamp;
    }

    // Array of all reward records for on-chain auditability
    RewardRecord[] public rewardHistory;

    // Events
    event RewardDistributed(
        address indexed student,
        uint256 points,
        uint256 indexed semesterId,
        uint256 timestamp
    );

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    // Modifier to restrict access to only the college administrator
    modifier onlyOwner() {
        require(msg.sender == owner, "Only authorized college admin can call this function");
        _;
    }

    /**
     * @dev Contract constructor sets deploying wallet as owner/admin.
     */
    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /**
     * @notice Distribute incentive points to an eligible student for a given semester
     * @param student The MetaMask/Ethereum wallet address of the student
     * @param points Incentive points earned (e.g., 20 or 50)
     * @param semesterId Semester identifier (e.g., 6)
     */
    function distributeReward(
        address student,
        uint256 points,
        uint256 semesterId
    ) external onlyOwner {
        require(student != address(0), "Invalid student wallet address");
        require(points > 0, "Reward points must be greater than zero");
        require(semesterId > 0, "Invalid semester ID");
        require(
            !_hasReceivedReward[student][semesterId],
            "Reward already distributed to this student for this semester"
        );

        // Mark as distributed for this semester to prevent duplicate payouts
        _hasReceivedReward[student][semesterId] = true;

        // Credit student's reward balance
        _rewardBalances[student] += points;
        totalPointsDistributed += points;
        totalTransactionsCount += 1;

        // Append to audit trail
        rewardHistory.push(
            RewardRecord({
                student: student,
                points: points,
                semesterId: semesterId,
                timestamp: block.timestamp
            })
        );

        emit RewardDistributed(student, points, semesterId, block.timestamp);
    }

    /**
     * @notice Batch distribute rewards to multiple students in a single transaction (gas efficient)
     * @param students Array of student wallet addresses
     * @param points Array of corresponding points
     * @param semesterId Semester identifier
     */
    function distributeRewardBatch(
        address[] calldata students,
        uint256[] calldata points,
        uint256 semesterId
    ) external onlyOwner {
        require(students.length == points.length, "Arrays length mismatch");
        require(students.length > 0, "Empty students array");
        require(semesterId > 0, "Invalid semester ID");

        for (uint256 i = 0; i < students.length; i++) {
            address student = students[i];
            uint256 pts = points[i];

            if (student != address(0) && pts > 0 && !_hasReceivedReward[student][semesterId]) {
                _hasReceivedReward[student][semesterId] = true;
                _rewardBalances[student] += pts;
                totalPointsDistributed += pts;
                totalTransactionsCount += 1;

                rewardHistory.push(
                    RewardRecord({
                        student: student,
                        points: pts,
                        semesterId: semesterId,
                        timestamp: block.timestamp
                    })
                );

                emit RewardDistributed(student, pts, semesterId, block.timestamp);
            }
        }
    }

    /**
     * @notice Get current reward balance of a student
     * @param student The student wallet address
     * @return Reward points balance
     */
    function getRewardBalance(address student) external view returns (uint256) {
        return _rewardBalances[student];
    }

    /**
     * @notice Check if a student has already received rewards for a semester
     * @param student The student wallet address
     * @param semesterId The semester identifier
     * @return True if reward already distributed, false otherwise
     */
    function hasReceivedReward(address student, uint256 semesterId) external view returns (bool) {
        return _hasReceivedReward[student][semesterId];
    }

    /**
     * @notice Get total number of reward transactions recorded
     */
    function getRewardHistoryCount() external view returns (uint256) {
        return rewardHistory.length;
    }

    /**
     * @notice Transfer contract ownership to a new admin wallet
     * @param newOwner Address of new college administrator
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner is zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
