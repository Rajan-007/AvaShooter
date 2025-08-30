// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract StackingGame {
    struct Match {
        uint256 entryFee;
        uint256 maxPlayers;
        address[] players;
        bool started;
        bool finished;
        address winner;
        uint256 prizePool; // total wei collected
        bool exists;       // tracks if this roomId has been created
    }

    address public platform;
    uint256 public platformBps = 1000; // 10.00% in basis points (10000 = 100%)

    mapping(bytes32 => Match) private matchesById;
    mapping(address => uint256) public pendingWithdrawals; // pull payments

    event MatchCreated(bytes32 indexed roomId, uint256 entryFee, uint256 maxPlayers);
    event Joined(bytes32 indexed roomId, address indexed player);
    event Started(bytes32 indexed roomId);
    event Finished(bytes32 indexed roomId, address indexed winner, uint256 winnerPayout, uint256 platformFee);
    event Withdrawn(address indexed payee, uint256 amount);

    constructor(address _platform) {
        require(_platform != address(0), "Platform required");
        platform = _platform;
    }

    // -------- CREATE (permissionless) ----------
    /// @notice Anyone can register a match keyed by an off-chain managed roomId.
    function createMatch(bytes32 roomId, uint256 entryFee, uint256 maxPlayers) external {
        require(roomId != bytes32(0), "roomId required");
        require(entryFee > 0, "Entry fee > 0");
        require(maxPlayers >= 2, "At least 2 players");

        Match storage m = matchesById[roomId];
        require(!m.exists, "Room already exists");

        m.entryFee = entryFee;
        m.maxPlayers = maxPlayers;
        m.exists = true;

        emit MatchCreated(roomId, entryFee, maxPlayers);
    }

    // -------- JOIN ----------
    /// @notice Player joins a specific room by its roomId. Send exact entryFee.
    function join(bytes32 roomId) public payable {
        Match storage m = matchesById[roomId];
        require(m.exists, "Unknown room");
        require(!m.started && !m.finished, "Match locked");
        require(msg.value == m.entryFee, "Incorrect entry fee");
        require(m.players.length < m.maxPlayers, "Match full");

        m.players.push(msg.sender);
        m.prizePool += msg.value;

        emit Joined(roomId, msg.sender);
    }

    // -------- START / FINISH (platform-controlled) ----------
    function start(bytes32 roomId) external  {
        Match storage m = matchesById[roomId];
        require(m.exists, "Unknown room");
        require(!m.started && !m.finished, "Bad state");
        require(m.players.length >= 1, "Need at least 1 player"); // <-- changed from >=2
        m.started = true;
        emit Started(roomId);
    }

    /// @notice Finalize and declare a winner for the given roomId.
    /// Can be called even if start() wasn’t called yet; it will auto-start.
    function finish(bytes32 roomId, address winner) external  {
        Match storage m = matchesById[roomId];
        require(m.exists, "Unknown room");
        require(!m.finished, "Already finished");           // <-- no longer requires m.started
        require(_isPlayer(m, winner), "Winner not in match");

        // If not started yet, start it now so state is consistent
        if (!m.started) {
            m.started = true;
            emit Started(roomId);
        }

        m.finished = true;
        m.winner = winner;

        uint256 pool = m.prizePool;                         // total collected
        uint256 platformFee = (pool * platformBps) / 10000; // e.g., 10%
        uint256 winnerPayout = pool - platformFee;          // remainder

        // Pull payments (no external calls here)
        pendingWithdrawals[winner] += winnerPayout;
        pendingWithdrawals[platform] += platformFee;

        emit Finished(roomId, winner, winnerPayout, platformFee);
    }

    // -------- ADMIN ----------
    function setPlatform(address newPlatform) external  {
        require(newPlatform != address(0), "Zero addr");
        platform = newPlatform;
    }

    function setPlatformFeeBps(uint256 newBps) external  {
        require(newBps <= 2000, "Max 20% for safety");
        platformBps = newBps;
    }

    // -------- PAYOUTS ----------
    function withdraw() external {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "Nothing to withdraw");
        pendingWithdrawals[msg.sender] = 0;
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "Transfer failed");
        emit Withdrawn(msg.sender, amount);
    }

    // -------- VIEWS ----------
    function getPlayers(bytes32 roomId) external view returns (address[] memory) {
        return matchesById[roomId].players;
    }

    function getMatch(bytes32 roomId)
        external
        view
        returns (
            uint256 entryFee,
            uint256 maxPlayers,
            bool started,
            bool finished,
            address winner,
            uint256 prizePool,
            uint256 playerCount,
            bool exists
        )
    {
        Match storage m = matchesById[roomId];
        return (m.entryFee, m.maxPlayers, m.started, m.finished, m.winner, m.prizePool, m.players.length, m.exists);
    }

    // -------- INTERNAL ----------
    function _isPlayer(Match storage m, address p) internal view returns (bool) {
        for (uint256 i = 0; i < m.players.length; i++) {
            if (m.players[i] == p) return true;
        }
        return false;
    }
}
