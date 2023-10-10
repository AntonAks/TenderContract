// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract TenderContract {
    struct Bid {
        bytes32 commitment;
        uint256 revealedBid;
        bool revealed;
    }

    address public owner;
    uint256 public revealEndTime;
    mapping(address => Bid) public bids;
    address[] public bidders;

    /**
     * @dev Constructor to initialize the TenderContract contract.
     * @param _revealEndTime The timestamp when the reveal phase ends.
     */
    constructor(uint256 _revealEndTime) {
        owner = msg.sender;
        revealEndTime = _revealEndTime;
    }

    /**
     * @dev Modifier to restrict access to the owner (Mayor).
     */    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the Mayor can perform this action");
        _;
    }


    /**
     * @dev Commit a bid to the tender.
     * @param commitment The hash commitment of the bid.
     */
    function commitBid(bytes32 commitment) public {
        require(block.timestamp < revealEndTime, "Commit phase has ended");
        bids[msg.sender] = Bid(commitment, 0, false);
        
        if (bids[msg.sender].commitment != 0) {
            bidders.push(msg.sender);
        }
    }


    /**
     * @dev Reveal a bid with the actual bid value and salt.
     * @param bid The actual bid value.
     * @param salt The salt value used for commitment.
     */
    function revealBid(uint256 bid, bytes32 salt) public {
        require(block.timestamp >= revealEndTime, "Reveal phase has not started yet");
        Bid storage bidder = bids[msg.sender];
        require(!bidder.revealed, "Bidder has already revealed");

        bytes32 expectedCommitment = keccak256(abi.encodePacked(bid, salt));
        require(expectedCommitment == bidder.commitment, "Invalid commitment");

        bidder.revealedBid = bid;
        bidder.revealed = true;
    }

    /**
     * @dev Get bid information for a specific bidder.
     * @param bidder The address of the bidder.
     * @return commitment The hash commitment of the bidder's bid.
     * @return revealedBid The revealed bid value.
     * @return revealed A boolean indicating if the bid has been revealed.
     */
    function getBidInfo(address bidder) public view returns (bytes32, uint256, bool) {
        Bid storage bid = bids[bidder];
        return (bid.commitment, bid.revealedBid, bid.revealed);
    }

    /**
     * @dev Select the winner(s) based on the smallest revealed bid(s).
     * @return smallestBids An array of Bid structs representing the smallest revealed bids.
     */
    function selectWinner() public view onlyOwner returns (Bid[] memory) {
        require(block.timestamp >= revealEndTime, "Reveal phase has not ended yet");
    
        uint256 smallestBid = bids[bidders[0]].revealedBid;
        uint256 count = 0;

        // First, find the smallest bid value
        for (uint256 i = 0; i < bidders.length; i++) {
            if (bids[bidders[i]].revealedBid < smallestBid) {
                smallestBid = bids[bidders[i]].revealedBid;
                count = 1; // Reset count for new smallest bid
            } else if (bids[bidders[i]].revealedBid == smallestBid) {
                count++;
            }
        }

        // Then, create an array to store the smallest bids
        Bid[] memory smallestBids = new Bid[](count);
        count = 0;

        // Populate the smallestBids array with structs having the smallest revealedBid
        for (uint256 i = 0; i < bidders.length; i++) {
            if (bids[bidders[i]].revealedBid == smallestBid) {
                smallestBids[count] = bids[bidders[i]];
                count++;
            }
        }

        return smallestBids;
        
    }
}
