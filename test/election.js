var Election = artifacts.require("./Election.sol");

contract("Election", function(accounts) {
    var electionInstance;

    it("initializes with two candidates", function() {
        return Election.deployed().then(function(instance) {
            return instance.candidatesCount();
        }).then(function(count) {
            assert.equal(count, 2);
        });
    });

    it("it initializes the candidates with the correct values", function() {
        return Election.deployed().then(function(instance) {
            electionInstance = instance;
            return Promise.all([
                electionInstance.candidates(1),
                electionInstance.candidates(2)
            ]);
        }).then(function([candidate1, candidate2]) {
            assert.equal(candidate1[0], 1, "contains the correct id");
            assert.equal(candidate1[1], "Candidate 1", "contains the correct name");
            assert.equal(candidate1[2], 0, "contains the correct votes count");

            assert.equal(candidate2[0], 2, "contains the correct id");
            assert.equal(candidate2[1], "Candidate 2", "contains the correct name");
            assert.equal(candidate2[2], 0, "contains the correct votes count");
        });
    });

    it("allows a voter to cast a vote", function() {
        return Election.deployed().then(function(instance) {
            electionInstance = instance;
            var candidateId = 1; // Choose candidateId as per your contract
            return electionInstance.vote(candidateId, { from: accounts[0] });
        }).then(function(receipt) {
            return electionInstance.voters(accounts[0]);
        }).then(function(voted) {
            var candidateId = 1; // Choose candidateId as per your contract
            assert(voted, "the voter was marked as voted");
            return electionInstance.candidates(candidateId);
        }).then(function(candidate) {
            var voteCount = candidate[2];
            assert.equal(voteCount, 1, "increments the candidate's vote count");
        });
    });

    // it("throws an exception for invalid candidates", function() {
    //     return Election.deployed().then(function(instance) {
    //         electionInstance = instance;
    //         return electionInstance.vote(99, { from: accounts[1] })
    //     }).then(assert.fail).catch(function(error) {
    //         assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
    //         return Promise.all([
    //             electionInstance.candidates(1),
    //             electionInstance.candidates(2)
    //         ]);
    //     }).then(function([candidate1, candidate2]) {
    //         assert.equal(candidate1[2], 0, "candidate 1 did not receive any votes");
    //         assert.equal(candidate2[2], 0, "candidate 2 did not receive any votes");
    //     });
    // });

    // it("throws an exception for double voting", function() {
    //     return Election.deployed().then(function(instance) {
    //         electionInstance = instance;
    //         var candidateId = 2; // Choose candidateId as per your contract
    //         return electionInstance.vote(candidateId, { from: accounts[1] });
    //     }).then(function() {
    //         return electionInstance.vote(candidateId, { from: accounts[1] });
    //     }).then(assert.fail).catch(function(error) {
    //         assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
    //         return Promise.all([
    //             electionInstance.candidates(1),
    //             electionInstance.candidates(2)
    //         ]);
    //     }).then(function([candidate1, candidate2]) {
    //         assert.equal(candidate1[2], 0, "candidate 1 did not receive any votes");
    //         assert.equal(candidate2[2], 1, "candidate 2 received 1 vote");
    //     });
    // });
});
