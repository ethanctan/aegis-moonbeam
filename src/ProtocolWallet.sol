// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

contract ProtocolWallet {
    address public protocol;
    address public protocolOwner;
    address public disputeResolutionCenter;
    string public name;
    struct Chargeback {
        uint amount;
        address payable to;
        uint id;
        string reason;
    }
    Chargeback[] public chargebacks;
    struct Deposit {
        uint amount;
        address payable from;
        uint id;
    }
    Deposit[] public deposits;
    struct Withdrawal {
        uint amount;
        address payable to;
        uint id;
    }
    Withdrawal[] public withdrawals;

    constructor(
        address _protocol,
        address _protocolOwner,
        string memory _name,
        address _disputeResolutionCenter
    ) {
        protocol = _protocol;
        protocolOwner = _protocolOwner;
        disputeResolutionCenter = _disputeResolutionCenter;
        name = _name;
    }

    receive() external payable {
        deposits.push(Deposit(msg.value, payable(msg.sender), deposits.length));
    }

    function getDeposits() public view returns (Deposit[] memory) {
        return deposits;
    }

    function withdraw(uint _amount) public onlyOwner {
        require(
            msg.sender == protocol,
            "Only the protocol can withdraw collateral"
        );
        withdrawals.push(
            Withdrawal(_amount, payable(protocolOwner), withdrawals.length)
        );

        address payable to = payable(protocolOwner);
        uint amount = _amount;
        require(address(this).balance >= amount, "You have insufficient funds");
        to.transfer(amount);
    }

    function getWithdrawals() public view returns (Withdrawal[] memory) {
        return withdrawals;
    }

    function receiveChargeback(
        uint _amount,
        address payable _to,
        string memory _reason
    ) public onlyDisputeResolutionCenter {
        chargebacks.push(Chargeback(_amount, _to, chargebacks.length, _reason));
        address payable to = _to;
        uint amount = _amount;
        require(
            address(this).balance >= _amount,
            "Insufficient balance for chargeback"
        );
        to.transfer(amount);
    }

    function getChargebacks() public view returns (Chargeback[] memory) {
        return chargebacks;
    }

    modifier onlyOwner() {
        bool isOwner = false;
        if (msg.sender == protocolOwner) {
            isOwner = true;
        }
        require(isOwner == true, "This is not your wallet");
        _;
    }

    modifier onlyDisputeResolutionCenter() {
        bool isDisputeResolutionCenter = false;
        if (msg.sender == disputeResolutionCenter) {
            isDisputeResolutionCenter = true;
        }
        require(isDisputeResolutionCenter == true, "Unauthorized");
        _;
    }
}
