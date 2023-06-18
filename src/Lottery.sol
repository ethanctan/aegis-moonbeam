// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "./Randomness.sol";
import {RandomnessConsumer} from "./RandomnessConsumer.sol";
import "./DisputeResolutionCenter.sol";

contract Lottery is RandomnessConsumer {
    // Randomness Precompile interface
    Randomness public randomness =
        Randomness(0x0000000000000000000000000000000000000809);

    // The number of winners. Ie. the number of people to be eliminated
    uint8 public NUM_WINNERS;

    // The number of blocks before the request can be fulfilled (for Local VRF
    // randomness). The MIN_VRF_BLOCKS_DELAY (from the Randomness Precompile)
    // provides a minimum number that is safe enough for games with low economical
    // value at stake. Increasing the delay slightly reduces the probability
    // (already very low) of a collator being able to predict the pseudo-random number
    uint32 public VRF_BLOCKS_DELAY = MIN_VRF_BLOCKS_DELAY;

    // The minimum number of participants to start the lottery
    uint256 public MIN_PARTICIPANTS = 1;

    // The maximum number of participants allowed to participate. It is important
    // to limit the total jackpot (by limiting the number of participants) to
    // guarantee the economic incentive of a collator to avoid trying to influence
    // the pseudo-random. (See Randomness.sol for more details)
    uint256 public MAX_PARTICIPANTS = 1000;

    // The gas limit allowed to be used for the fulfillment, which depends on the
    // code that is executed and the number of words requested. Test and adjust
    // this limit based on the size of the request and the processing of the
    // callback request in the fulfillRandomWords() function
    uint64 public FULFILLMENT_GAS_LIMIT = 100000;

    // The minimum fee needed to start the lottery. This does not guarantee that
    // there will be enough fee to pay for the gas used by the fulfillment.
    // Ideally it should be over-estimated considering possible fluctuation of
    // the gas price. Additional fee will be refunded to the caller
    uint256 public MIN_FEE = FULFILLMENT_GAS_LIMIT * 1 gwei;

    // A string used to allow having different salt than other contracts
    bytes32 public SALT_PREFIX = "my_demo_salt_change_me";

    // Stores the global number of requests submitted. This number is used as a
    // salt to make each request unique
    uint256 public globalRequestCount;

    // The current request id
    uint256 public requestId;

    // The list of current participants
    address[] public participants;

    // The list of winners to be returned
    uint256[] public votes;

    // Outcome (1 for win, 2 for lose)
    uint decision;

    // The current amount of token at stake in the lottery
    uint256 public jackpot;

    // the owner of the contract
    address owner;
    address disputeResolutionCenter;
    uint cid;

    // Which randomness source to use. This correlates to the values in the
    // RandomnessSource enum in the Randomness Precompile
    Randomness.RandomnessSource randomnessSource;

    constructor(
        Randomness.RandomnessSource source,
        address _disputeResolutionCenter
    ) payable RandomnessConsumer() {
        // Because this contract can only perform one randomness request at a time,
        // we only need to have one required deposit
        uint256 requiredDeposit = randomness.requiredDeposit();
        if (msg.value < requiredDeposit) {
            revert("Deposit too Low");
        }
        // Update parameters
        randomnessSource = source;
        owner = msg.sender;
        globalRequestCount = 0;
        jackpot = 0;
        // Set the requestId to the maximum allowed value by the precompile (64 bits)
        requestId = 2 ** 64 - 1;
        // Manually Change - currently solves the 2nd dispute in the dispute resolution center
        cid = 0;
        disputeResolutionCenter = _disputeResolutionCenter;
    }

    function participate() public payable {
        // We check that the lottery hasn't started yet
        if (
            randomness.getRequestStatus(requestId) !=
            Randomness.RequestStatus.DoesNotExist
        ) {
            revert("Request already initiated");
        }

        // Each player must submit a fee to participate, which is added to
        // the jackpot
        if (msg.value != 0 || msg.value != 1) {
            revert("Invalid participation fee");
        }
        participants.push(msg.sender);
        votes.push(msg.value);
        NUM_WINNERS++;
        jackpot += msg.value;
    }

    function startLottery() public payable onlyOwner {
        require(
            disputeResolutionCenter != address(0),
            "DisputeResolutionCenter not set"
        );
        // Check we haven't started the randomness request yet
        if (
            randomness.getRequestStatus(requestId) !=
            Randomness.RequestStatus.DoesNotExist
        ) {
            revert("Request already initiated");
        }
        // Check that the number of participants is acceptable
        if (participants.length < MIN_PARTICIPANTS) {
            revert("Not enough participants");
        }
        if (participants.length >= MAX_PARTICIPANTS) {
            revert("Too many participants");
        }
        // Check the fulfillment fee is enough
        uint256 fee = msg.value;
        if (fee < MIN_FEE) {
            revert("Not enough fee");
        }
        // Check there is enough balance on the contract to pay for the deposit.
        // This would fail only if the deposit amount required is changed in the
        // Randomness Precompile.
        uint256 requiredDeposit = randomness.requiredDeposit();
        if (address(this).balance < jackpot + requiredDeposit) {
            revert("Deposit too low");
        }

        if (randomnessSource == Randomness.RandomnessSource.LocalVRF) {
            // Request random words using local VRF randomness
            requestId = randomness.requestLocalVRFRandomWords(
                msg.sender,
                fee,
                FULFILLMENT_GAS_LIMIT,
                SALT_PREFIX ^ bytes32(globalRequestCount++),
                NUM_WINNERS,
                VRF_BLOCKS_DELAY
            );
        } else {
            // Requesting random words using BABE Epoch randomness
            requestId = randomness.requestRelayBabeEpochRandomWords(
                msg.sender,
                fee,
                FULFILLMENT_GAS_LIMIT,
                SALT_PREFIX ^ bytes32(globalRequestCount++),
                NUM_WINNERS
            );
        }
    }

    //keep calling this function until the request is fulfilled
    function fulfillRequest() public {
        randomness.fulfillRequest(requestId);
    }

    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] memory randomWords
    ) internal override {
        pickWinners(randomWords);
    }

    // This function is called only by the fulfillment callback
    function pickWinners(uint256[] memory randomWords) internal {
        require(
            disputeResolutionCenter != address(0),
            "DisputeResolutionCenter not set"
        );

        // Get the total number of winners to select
        uint256 totalWinners = (NUM_WINNERS * 1) / 5;

        for (uint32 i = 0; i < totalWinners; i++) {
            // This is safe to index randomWords with i because we requested
            // NUM_WINNERS random words
            uint256 randomWord = randomWords[i];

            // Using modulo is not totally fair, but fair enough for this demo
            uint256 index = randomWord % participants.length;
            delete participants[index];
            jackpot -= votes[index];
        }

        if (jackpot >= 1) {
            decision = 1;
        } else {
            decision = 2;
        }
        require(decision != 0, "Decision Not Updated");

        DisputeResolutionCenter center = DisputeResolutionCenter(
            disputeResolutionCenter
        );
        if (decision == 1) {
            center.updateDisputeResult(true, false, cid);
        } else {
            center.updateDisputeResult(false, true, cid);
        }
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
}
