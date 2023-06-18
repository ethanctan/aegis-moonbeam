// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "./ProtocolWallet.sol";
import "./DisputeResolutionCenter.sol";

contract ConsumerDashboard {
    address public owner;
    address private disputeResolutionCenter;
    address private protocolWalletGen;
    struct Transaction {
        address from;
        address to;
        bytes32 txhash;
        uint block;
        uint id;
    }
    Transaction[] private transactions;
    struct Decision {
        bool win;
        bool lose;
        bool undecided;
    }
    struct Dispute {
        address from;
        address to;
        uint amount;
        string output;
        uint id;
        Decision decision;
    }
    Dispute[] private disputes;
    struct Protocol {
        address wallet;
        string name;
        uint collateral;
        uint Id;
        bool listed;
    }
    Protocol[] public protocols;

    constructor(
        address _owner,
        address _disputeResolutionCenter,
        address _protocolWalletGen
    ) {
        owner = _owner;
        disputeResolutionCenter = _disputeResolutionCenter;
        protocolWalletGen = _protocolWalletGen;
    }

    // this function is only triggered after verifying that the transaction valid on etherscan, and then function checks that this valid transaction originates from the user
    function addTransaction(
        address _from,
        address _to,
        bytes32 _txhash,
        uint _block
    ) public onlyOwner {
        require(_from == msg.sender, "This is not your transaction");
        transactions.push(
            Transaction(_from, _to, _txhash, _block, transactions.length)
        );
    }

    // always triggered
    function getTransaction() public view returns (Transaction[] memory) {
        return transactions;
    }

    // this function is triggered after a user fills in an public form, from which the output will be parsed into a string and stored on-chain
    // to here is the address of the dapp, NOT the account that created its wallet, nor the wallet address
    function fileDispute(
        address _to,
        string memory _output,
        uint _amount
    ) public onlyOwner {
        DisputeResolutionCenter center = DisputeResolutionCenter(
            disputeResolutionCenter
        );
        uint centerDisputeLength = center.disputesLength();
        center.addDisputeToCenter(
            address(this),
            owner,
            _to,
            _amount,
            _output,
            disputes.length,
            centerDisputeLength,
            false,
            false,
            true
        );

        disputes.push(
            Dispute(
                owner,
                _to,
                _amount,
                _output,
                disputes.length,
                Decision(false, false, true)
            )
        );
    }

    // this function is called another smart contract
    function resolveDispute(
        uint Id,
        bool _win,
        bool _lose,
        bool _undecided
    ) public onlyDisputeResolutionCenter {
        require(
            disputes[Id].decision.undecided == true,
            "Dispute already resolved"
        );
        require(Id <= disputes.length, "Invalid Id");

        disputes[Id].decision.undecided = _undecided;
        disputes[Id].decision.win = _win;
        disputes[Id].decision.lose = _lose;
    }

    function getDisputes() public view returns (Dispute[] memory) {
        return disputes;
    }

    //this function called by protocol wallet gen when a protocol creates a colllateral wallet and makes an initial deposit
    function addProtocol(
        address payable _protocolWalletAddress
    ) public onlyProtocolWalletGen {
        ProtocolWallet wallet = ProtocolWallet(_protocolWalletAddress);
        string memory _name = wallet.name();
        // uint _amount = address(_protocolWalletAddress).balance;

        // if(_amount >= 100) {
        //   protocols.push(Protocol(_protocolWalletAddress, _name, _amount, protocols.length, true));
        // }
        // else {
        protocols.push(
            Protocol(
                _protocolWalletAddress,
                _name,
                100,
                protocols.length,
                false
            )
        );
        //}
    }

    function updateProtocolBalances() public onlyOwner {
        for (uint i = 0; i < protocols.length; i++) {
            uint _amount = address(protocols[i].wallet).balance;
            if (_amount >= 100) {
                protocols[i].collateral = _amount;
                protocols[i].listed = true;
            } else {
                protocols[i].collateral = _amount;
                protocols[i].listed = false;
            }
        }
    }

    function getProtocols() public view returns (Protocol[] memory) {
        uint count = 0;
        for (uint i = 0; i < protocols.length; i++) {
            if (protocols[i].listed == true) {
                count++;
            }
        }
        Protocol[] memory temp = new Protocol[](count);
        uint j = 0;
        for (uint i = 0; i < protocols.length; i++) {
            if (protocols[i].listed == true) {
                temp[j] = protocols[i];
                j++;
            }
        }
        return temp;
    }

    modifier onlyOwner() {
        bool isOwner = false;
        if (msg.sender == owner) {
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

    modifier onlyProtocolWalletGen() {
        bool isProtocolWalletGen = false;
        if (msg.sender == protocolWalletGen) {
            isProtocolWalletGen = true;
        }
        require(isProtocolWalletGen == true, "Unauthorized");
        _;
    }
}
