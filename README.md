## Simple web-app dictionary
For my DSA-Project, I made a simple blockchain-based voting app.

<p align="center"><b>Preview of app</b></p>
<div style="text-align:center">
    <img src="https://github.com/SinsAries/myVotingApp/assets/76532290/ada25e4a-9bfa-4a64-8e82-3373843cafd7">
</div>

## Features

- **Select Candidate and vote**: Users can select one of 2 candidates that i imported and vote.
- **Show number of votes of each candidate**: User can see the number of votes of each candidate.

## Installation and usage

We need to install some tools and software to develop the blockchain system. 1. Visual Studio Code 2. Meta Mask 3. Ganache 4.Node.js 5. Truffle

Install Visual Studio Code press [here](https://code.visualstudio.com/download).

Install Meta mask press [here](https://metamask.io/).

Install Ganache press [here](https://www.trufflesuite.com/ganache).

Install Node.js press [here](https://nodejs.org/en/).

For installing Truffle open cmd and type this command npm install -g truffle . This will install the truffle globally.

### Step 1:
Open Visual Studio Code and Ganache. Create a folder and type truffle unbox pet shop in cmd. This will Download the box. This also takes care of installing the necessary dependencies.

### Step 2:
Now we are going to create a smart contract. So go to contracts and create a file with extension .sol. Solidity is a object oriented programming language for writing smart contract.Below is the code for solidity with explaination.
```sol
pragma solidity >= 0.5.16;

/**
 * @title Election
 * @dev A smart contract for conducting an election with multiple candidates.
 */
contract Election {
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

    /**
     * @dev Mapping to store accounts that have voted.
     * @param voters Mapping of voter addresses to boolean values indicating whether they have voted.
     */
    mapping(address => bool) public voters;

    /**
     * @dev Mapping to store and fetch candidates.
     * @param candidates Mapping of candidate ids to Candidate structs.
     */
    mapping(uint => Candidate) public candidates;

    /**
     * @dev Stores the count of candidates.
     * @param candidatesCount The total number of candidates.
     */
    uint public candidatesCount;

    /**
     * @dev Event triggered when a vote is cast.
     * @param _candidateId The id of the candidate that received the vote.
     */
    event votedEvent(uint indexed _candidateId);

    /**
     * @dev Constructor that initializes the contract with two candidates.
     */
    constructor () public {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }
    
    /**
     * @dev Function to add a new candidate.
     * @param _name The name of the candidate to add.
     */
    function addCandidate(string memory _name) public {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

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
}
```
### Step 3:
Goto migrations -> Create a file with the name 2_deploy_contacts.js.In this file, I am deploying my smart contract. In the below code ./Election.sol is the name of my smart contract make sure you replace it with your smart contract.
```js
var Election = artifacts.require("./Election.sol"); 
module.exports = function(deployer) 
{ 
 deployer.deploy(Election);
};
```

### Step 4:
Go to src/js/app.js. In App.js we are going use library web3.js for connecting ethereum to our local network.web3.js is a collection of libraries that allow you to interact with a local or remote ethereum node using HTTP, IPC or WebSocket.
```js
/**
 * App object to interact with the Election smart contract.
 * @type {Object}
 */
var App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  /**
   * Initialize the App by calling initWeb3.
   * @return {Promise} A Promise indicating the initialization status.
   */
  init: function () {
      return App.initWeb3();
  },

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

  /**
   * Render account and contract data.
   */
  render: function () {
      var electionInstance;
      var loader = $("#loader");
      var content = $("#content");
      loader.show();
      content.hide();
      // Load account data
      web3.eth.getCoinbase(function (err, account) {
          if (err === null) {
              App.account = account;
              $("#accountAddress").html("Your Account: " + account);
          }
      });
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
  },

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
};

/**
* Initialize the App when the window is fully loaded.
*/
$(function () {
  $(window).load(function () {
      App.init();
  });
});
```

### Step 5:
Creating Frontend using html 5.
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Election DApp</title>
    <link rel="stylesheet" href="css/bootstrap.min.css">
</head>
<body>
    <div class="container">
        <div class="row">
            <div class="col-lg-12 text-center">
                <h2>Election Results</h2>
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Name</th>
                            <th scope="col">Votes</th>
                        </tr>
                    </thead>
                    <tbody id="candidatesResults">
                    </tbody>
                </table>
                <form onSubmit="App.castVote(); return false;">
                  <div class="form-group">
                      <label for="candidatesSelect">Select Candidate</label>
                      <select class="form-control" id="candidatesSelect">
                      </select>
                  </div>
                  <button type="submit" class="btn btn-primary">Vote</button>
                  <hr />
                </form>
                <hr>
                <p id="accountAddress" class="text-center"></p>
            </div>
        </div>
    </div>

    

    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
    <!-- Include all compiled plugins (below), or include individual files as needed -->
    <script src="js/bootstrap.min.js"></script>
    <script src="js/web3.min.js"></script>
    <script src="js/truffle-contract.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
```

### Step 6: 
Configure Metamask .Go to metamask and click on setting then go to networks and click on Add network . Enter Network name , in New RPC URL enter http://localhost:7545 , in chain id write 1337 or 0x539.

### Step 7:
Deploy smart contract on local network using this command.Remember to replace Election with your smart contract Election.deployed().then(function(instance) { app = instance })
example: 
$ truffle console
-> Election.deployed().then(function(instance) { app = instance })

### Step 8:
Run the command npm run dev this will redirect you to http://localhost:3000.

### Step 9:
Import an account from Ganache by copying the private key and paste it on the localhost:3000 page under accounts and press submit to cast a vote.
<img width="911" alt="image" src="https://github.com/SinsAries/myVotingApp/assets/76532290/205b0953-645b-4700-8726-00ac17812f40">

<img width="506" alt="image" src="https://github.com/SinsAries/myVotingApp/assets/76532290/cf04b723-8e59-49f6-adfb-349ce8b1c4ee">

<img width="255" alt="image" src="https://github.com/SinsAries/myVotingApp/assets/76532290/54758a91-8cbb-4a64-bae9-22ff79151ebb">

<img width="233" alt="image" src="https://github.com/SinsAries/myVotingApp/assets/76532290/328fa2a1-c880-47bb-a89d-e3e619d3b8ed">


### Step 10:
If you need to do any change in contract type truffle console in cmd and press enter then type truffle — — migrate reset this will redeploy the smart contract and repeat step 7.


## Author :
**Nguyen Trong Tat Thanh - 23521455**

> **Special thanks to my teacher, Mr. Nguyen Thanh Son, for guiding me through this project.**
