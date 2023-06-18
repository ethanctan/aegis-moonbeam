// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "./Lottery.sol";

contract JurorWallet {
    address public owner;
    address private lottery;

    constructor(address _owner, address _lottery) {
        owner = _owner;
        lottery = _lottery;
    }

    function castVote(uint256 vote) public {
        // Check that the function is called by the owner
        require(msg.sender == owner, "Only the owner can cast a vote");

        // Check that the vote is either 0 or 1
        require(vote == 0 || vote == 1, "Vote must be either 0 or 1");

        // Convert vote to gwei
        uint256 amount = vote * 1 gwei;

        // Make sure the contract has enough ether to cover the vote
        require(
            address(this).balance >= amount,
            "Not enough balance to cast vote"
        );

        // Call the participate function in the Lottery contract
        // This will fail if the contract doesn't have enough ether
        Lottery lotto = Lottery(lottery);
        lotto.participate{value: amount}();
    }

    // Fallback function to allow the contract to receive ether
    receive() external payable {}
}
