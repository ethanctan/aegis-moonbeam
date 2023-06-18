// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "./ProtocolWallet.sol";
import "./ConsumerDashboardGen.sol";
import "./ConsumerDashboard.sol";

contract ProtocolWalletGen {
    mapping(address => address) public protocolOwners;
    mapping(address => address) public protocolWallets;

    //owner is us for initial config
    address public owner;
    address private disputeResolutionCenter;
    address private consumerDashboardGen;

    constructor(address _owner, address _consumerDashboardGen) {
        owner = _owner;
        consumerDashboardGen = _consumerDashboardGen;
    }

    //only called by us to initialize
    function setDisputeResolutionCenter(
        address _disputeResolutionCenter
    ) public onlyOwner {
        disputeResolutionCenter = _disputeResolutionCenter;
    }

    //might need some check on whether protocol address is valid
    function createProtocolWallet(
        address protocolAddress,
        string calldata _name
    ) public {
        require(
            disputeResolutionCenter != address(0),
            "DisputeResolutionCenter not set"
        );
        require(
            protocolOwners[msg.sender] == address(0),
            "You have already created a wallet for a protocol"
        );
        require(
            protocolWallets[protocolAddress] == address(0),
            "A wallet for this protocol has already been created"
        );

        ProtocolWallet wallet;
        try
            new ProtocolWallet(
                protocolAddress,
                msg.sender,
                _name,
                disputeResolutionCenter
            )
        returns (ProtocolWallet _wallet) {
            wallet = _wallet;
        } catch {
            revert("ProtocolWallet creation failed");
        }

        protocolOwners[msg.sender] = protocolAddress;
        protocolWallets[protocolAddress] = address(wallet);

        ConsumerDashboardGen gen = ConsumerDashboardGen(consumerDashboardGen);
        for (uint i = 0; i < gen.length(); i++) {
            address consumerDashboardAddress = gen.consumerDashboardAddress(i);
            ConsumerDashboard consumerDashboard = ConsumerDashboard(
                consumerDashboardAddress
            );
            try
                consumerDashboard.addProtocol(
                    payable(protocolWallets[protocolAddress])
                )
            {
                // Success
            } catch {
                revert("Failed to add protocol to Consumer Dashboards");
            }
        }
    }

    function getWalletAddress(
        address _protocolAddress
    ) public view returns (address) {
        return protocolWallets[_protocolAddress];
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
