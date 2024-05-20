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
          App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
          web3 = new Web3(App.web3Provider);
      }
      return App.initContract();
  },

  /**
   * Initialize the Election smart contract.
   * @return {Promise} A Promise indicating the initialization status.
   */
  initContract: function () {
      return new Promise(function (resolve, reject) {
          $.getJSON("Election.json", function (election) {
              // Instantiate a new truffle contract from the artifact
              App.contracts.Election = TruffleContract(election);
              // Connect provider to interact with contract
              App.contracts.Election.setProvider(App.web3Provider);
              App.listenForEvents();
              resolve();
          }).fail(function () {
              reject(new Error('Failed to load contract'));
          });
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
              (function (i) {
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
              })(i);
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
  },

  /**
   * Empty the candidates results section.
   */
  empty: function () {
      $("#candidatesResults").empty();
  }
};

// Initialize the App when the window is fully loaded
$(function () {
  $(window).load(function () {
      App.init();
  });
});
