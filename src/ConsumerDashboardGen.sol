// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "./ConsumerDashboard.sol";

contract ConsumerDashboardGen {
    mapping(address => address) public consumers;
    address[] public consumerDashboardAddress;
    uint public length;
    //owner is us for initial config
    address private owner;
    address private disputeResolutionCenter;
    address private protocolWalletGen;

    constructor(address _owner) {
        owner = _owner;
    }

    function setDisputeResolutionCenter(
        address _disputeResolutionCenter
    ) public onlyOwner {
        disputeResolutionCenter = _disputeResolutionCenter;
    }

    function setProtocolWalletGen(address _protocolWalletGen) public onlyOwner {
        protocolWalletGen = _protocolWalletGen;
    }

    function createDashboard() public {
        require(
            consumers[msg.sender] == address(0),
            "You have already created a dashboard"
        );
        require(
            disputeResolutionCenter != address(0),
            "DisputeResolutionCenter not set"
        );
        require(protocolWalletGen != address(0), "ProtocolWalletGen not set");

        ConsumerDashboard dashboard = new ConsumerDashboard(
            msg.sender,
            disputeResolutionCenter,
            protocolWalletGen
        );
        consumers[msg.sender] = address(dashboard);
        consumerDashboardAddress.push(address(dashboard));
        length = consumerDashboardAddress.length;
    }

    function getDashboardAddress() public view returns (address) {
        require(
            consumers[msg.sender] != address(0),
            "You have not created a dashboard yet"
        );
        return consumers[msg.sender];
    }

    modifier onlyOwner() {
        bool isOwner = false;
        if (msg.sender == owner) {
            isOwner = true;
        }
        require(isOwner == true, "This is not your wallet");
        _;
    }
}
