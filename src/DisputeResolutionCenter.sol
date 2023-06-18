// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "./ConsumerDashboard.sol";
import "./ProtocolWallet.sol";
import "./ProtocolWalletGen.sol";
import "./JurorWallet.sol";

//Changes: Added Lottery into constructor, passed lottery into jurorwallet constructor, set update dispute to lottery only
contract DisputeResolutionCenter {
    address private consumerDashboardGen;
    address private protocolWalletGen;
    address public owner;
    address private lottery;

    struct Decision {
        bool win;
        bool lose;
        bool undecided;
    }

    struct Dispute {
        address sc;
        address owner;
        address to;
        uint amount;
        string output;
        uint id;
        uint cid;
        Decision decision;
        address[] jurors;
    }

    mapping(address => address) public jurors;

    Dispute[] public disputes;
    uint public disputesLength;

    constructor(
        address _owner,
        address _consumerDashboardGen,
        address _protocolWalletGen
    ) {
        consumerDashboardGen = _consumerDashboardGen;
        protocolWalletGen = _protocolWalletGen;
        owner = _owner;
    }

    //to be called by any consumer dashboard
    function addDisputeToCenter(
        address _sc,
        address _owner,
        address _to,
        uint _amount,
        string memory _output,
        uint _id,
        uint _cid,
        bool _win,
        bool _lose,
        bool _undecided
    ) public {
        disputesLength++;
        disputes.push(
            Dispute(
                _sc,
                _owner,
                _to,
                _amount,
                _output,
                _id,
                _cid,
                Decision(_win, _lose, _undecided),
                new address[](0)
            )
        );
    }

    function updateDisputeResult(
        bool _win,
        bool _lose,
        uint _cid
    ) public onlyLottery {
        require(
            disputes[_cid].decision.undecided == true,
            "dispute already resolved"
        );

        disputes[_cid].decision.win = _win;
        disputes[_cid].decision.lose = _lose;
        disputes[_cid].decision.undecided = false;

        ConsumerDashboard dashboard = ConsumerDashboard(disputes[_cid].sc);
        dashboard.resolveDispute(disputes[_cid].id, _win, _lose, false);

        if (_win == true && _lose == false) {
            ProtocolWalletGen gen = ProtocolWalletGen(protocolWalletGen);
            //auto getter function for protocolWallets mapping
            address chargebackAddress = gen.protocolWallets(disputes[_cid].to);

            ProtocolWallet wallet = ProtocolWallet(payable(chargebackAddress));
            wallet.receiveChargeback(
                disputes[_cid].amount,
                payable(disputes[_cid].owner),
                disputes[_cid].output
            );
        }
    }

    function setDisputeResolutionCenter(address _lottery) public onlyOwner {
        lottery = _lottery;
    }

    function createJurorWallet() public {
        require(
            jurors[msg.sender] == address(0),
            "You have already created a staking wallet"
        );
        require(lottery != address(0), "Lottery not set");

        JurorWallet wallet = new JurorWallet(msg.sender, lottery);
        jurors[msg.sender] = address(wallet);
    }

    modifier onlyOwner() {
        bool isOwner = false;
        if (msg.sender == owner) {
            isOwner = true;
        }
        require(isOwner == true, "This is not your wallet");
        _;
    }

    //Disable this if precompile fails
    modifier onlyLottery() {
        bool isLottery = false;
        if (msg.sender == lottery) {
            isLottery = true;
        }
        require(isLottery == true, "This is not your wallet");
        _;
    }
}
