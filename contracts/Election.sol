pragma solidity >= 0.5.16;

contract Election {
    // Candidate structure
    struct Candidate {
        uint id;
        string name;
        uint votecount;
    }

    // Mapping to store accounts that have voted
    mapping(address => bool) public voters;

    // Mapping to store and fetch candidates
    mapping(uint => Candidate) public candidates;

    // Store the candidate count
    uint public candidatesCount;

    // Event triggered when a vote is cast
    event votedEvent(uint indexed _candidateId);

    constructor () public {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }
    
    // Function to add a candidate (public)
    function addCandidate(string memory _name) public {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    // Function to vote for a candidate
    function vote(uint _candidateId) public {
        // Ensure the voter hasn't voted before
        require(!voters[msg.sender], "You have already voted.");

        // Ensure a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID.");

        // Record that the voter has voted
        voters[msg.sender] = true;

        // Update candidate vote count
        candidates[_candidateId].votecount++;

        // Trigger voted event
        emit votedEvent(_candidateId);
    }
}
