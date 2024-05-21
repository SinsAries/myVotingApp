# Docstrings for myVotingApp

## Contracts

### Election

This contract enables the creation and management of an election with multiple candidates. It allows users to vote for their preferred candidate and ensures that each user can only vote once.
```js
    /**
     * @dev Struct to represent a candidate with an id, name, and vote count.
     * @param id The unique identifier for the candidate.
     * @param name The name of the candidate.
     * @param votecount The number of votes the candidate has received.
     */
    struct Candidate {
        uint id;
        string name;
        uint votecount;
    }
```

```js
    /**
     * @dev Mapping to store accounts that have voted.
     * @param voters Mapping of voter addresses to boolean values indicating whether they have voted.
     */
    mapping(address => bool) public voters;
```

```js
    /**
     * @dev Mapping to store and fetch candidates.
     * @param candidates Mapping of candidate ids to Candidate structs.
     */
    mapping(uint => Candidate) public candidates;
```

```js
    /**
     * @dev Stores the count of candidates.
     * @param candidatesCount The total number of candidates.
     */
    uint public candidatesCount;
```

```js
    /**
     * @dev Event triggered when a vote is cast.
     * @param _candidateId The id of the candidate that received the vote.
     */
    event votedEvent(uint indexed _candidateId);
```

```js
     /**
     * @dev Constructor that initializes the contract with two candidates.
     */
    constructor () public {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }
```

```js
    /**
     * @dev Function to add a new candidate.
     * @param _name The name of the candidate to add.
     */
    function addCandidate(string memory _name) public {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }
```

```js
    /**
     * @dev Function to vote for a candidate.
     * @param _candidateId The id of the candidate to vote for.
     * @notice Ensures the voter hasn't voted before and that the candidate id is valid.
     * @notice Updates the vote count for the candidate and records that the voter has voted.
     * @notice Emits the votedEvent event after a successful vote.
     */
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
```

## Components

### App.js
Main application component for voting and displaying

```js
/**
 * App object to interact with the Election smart contract.
 * @type {Object}
 */
var App = {
  ...
};
```

```js
  /**
   * Initialize the App by calling initWeb3.
   * @return {Promise} A Promise indicating the initialization status.
   */
  init: function () {
      return App.initWeb3();
  },
```

```js
  /**
   * Initialize Web3. If Web3 is not available, fallback to localhost.
   * @return {Promise} A Promise indicating the initialization status.
   */
  initWeb3: function () {
      if (typeof web3 !== 'undefined') {
          // If a web3 instance is already provided by MetaMask.
          App.web3Provider = web3.currentProvider;
          web3 = new Web3(web3.currentProvider);
      } else {
          // Specify default instance if no web3 instance provided
          App.web3Provider = new Web3.providers.HttpProvider('http://172.31.80.1:7545');
          web3 = new Web3(App.web3Provider);
      }
      return App.initContract();
  },
```

```js
  /**
   * Initialize the Election smart contract.
   * @return {Promise} A Promise indicating the initialization status.
   */
  initContract: function () {
      $.getJSON("Election.json", function (election) {
          // Instantiate a new truffle contract from the artifact
          App.contracts.Election = TruffleContract(election);
          // Connect provider to interact with contract
          App.contracts.Election.setProvider(App.web3Provider);
          App.listenForEvents();
          return App.render();
      });
  },
```

```js
  /**
   * Listen for events emitted from the contract.
   */
  listenForEvents: function () {
      App.contracts.Election.deployed().then(function (instance) {
          instance.votedEvent({}, {
              fromBlock: 0,
              toBlock: 'latest'
          }).watch(function (error, event) {
              console.log("event triggered", event);
              // Reload when a new vote is recorded
              App.empty();
              App.render();
          });
      });
  },
```

```js
  /**
   * Render account and contract data.
   */
  render: function () {
    ...
  },
```

```js
      // Load account data
      web3.eth.getCoinbase(function (err, account) {
          if (err === null) {
              App.account = account;
              $("#accountAddress").html("Your Account: " + account);
          }
      });
```

```js
      // Load contract data
      App.contracts.Election.deployed().then(function (instance) {
          electionInstance = instance;
          return electionInstance.candidatesCount();
      }).then(function (candidatesCount) {
          var candidatesResults = $("#candidatesResults");
          candidatesResults.empty();
          var candidatesSelect = $('#candidatesSelect');
          candidatesSelect.empty();
          for (var i = 1; i <= candidatesCount; i++) {
              electionInstance.candidates(i).then(function (candidate) {
                  var id = candidate[0];
                  var name = candidate[1];
                  var voteCount = candidate[2];
                  // Render candidate Result
                  var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>";
                  candidatesResults.append(candidateTemplate);
                  // Render candidate ballot option
                  var candidateOption = "<option value='" + id + "' >" + name + "</option>";
                  
                  candidatesSelect.append(candidateOption);
              });
          }
          return electionInstance.voters(App.account);
      }).then(function (hasVoted) {
          // Do not allow a user to vote
          if (hasVoted) {
              $('form').hide();
          }
          loader.hide();
          content.show();
      }).catch(function (error) {
          console.warn(error);
      });
```

```js
  /**
   * Cast a vote for a candidate.
   */
  castVote: function () {
      var candidateId = $('#candidatesSelect').val();
      App.contracts.Election.deployed().then(function (instance) {
          return instance.vote(candidateId, { from: App.account });
      }).then(function (result) {
          // Wait for votes to update
          $("#content").hide();
          $("#loader").show();
      }).catch(function (err) {
          console.error(err);
      });
  }
```

```js
/**
* Initialize the App when the window is fully loaded.
*/
$(function () {
  $(window).load(function () {
      App.init();
  });
});
```
