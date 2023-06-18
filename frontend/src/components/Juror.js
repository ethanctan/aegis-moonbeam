import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ConsumerDashboardJson from './../out/ConsumerDashboard.sol/ConsumerDashboard.json';

const Juror = ({ disputeResolutionCenter, lottery, signer, provider }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [win, setWin] = useState(false);
  const [lose, setLose] = useState(false);
  const [cid, setCid] = useState('');
  const [firstDispute, setFirstDispute] = useState(null);
  const [disputes, setDisputes] = useState([]);

  useEffect(() => {
    const fetchJurorWalletAddress = async () => {
      try {
        setIsLoading(true);

        // Retrieve the address of the juror wallet
        const wallet = await disputeResolutionCenter.jurors('0x8066221588691155A7594291273F417fa4de3CAe');
        const jurorWalletAddress = wallet.toLowerCase();

        setIsLoading(false);
        setWalletAddress(jurorWalletAddress);
      } catch (error) {
        setIsLoading(false);
        console.error('Error retrieving juror wallet address:', error);
      }
    };

    fetchJurorWalletAddress();
  }, [disputeResolutionCenter, signer]);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setIsLoading(true);

        // Get the balance of the juror wallet
        const walletBalance = await provider.getBalance(walletAddress);

        setIsLoading(false);
        setBalance(ethers.utils.formatEther(walletBalance));
      } catch (error) {
        setIsLoading(false);
        console.error('Error retrieving juror wallet balance:', error);
      }
    };

    if (walletAddress) {
      fetchBalance();
    }
  }, [provider, walletAddress]);

  const hardcoded_dashboard = new ethers.Contract('0x6Ed6a5D8f28d6aA6155E9c4Bb5ED194e5b0145c7', ConsumerDashboardJson.abi, signer);

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        const disputeList = await hardcoded_dashboard.connect(signer).getDisputes();
        setDisputes(disputeList);
      } catch (error) {
        console.error('Error fetching disputes:', error);
      }
    };

    fetchDisputes();
  }, [hardcoded_dashboard, signer]);

  const handleCreateJurorWallet = async () => {
    try {
      setIsLoading(true);

      // Call the createJurorWallet function on the disputeResolutionCenter contract
      const tx = await disputeResolutionCenter.connect(signer).createJurorWallet();

      // Wait for the transaction to be confirmed
      await tx.wait();

      setIsLoading(false);
      console.log('Juror wallet created successfully!');
    } catch (error) {
      setIsLoading(false);
      console.error('Error creating juror wallet:', error);
    }
  };

  const handleDeposit = async () => {
    try {
      setIsLoading(true);

      // Convert the deposit amount to ethers' BigNumber format
      const depositAmountBN = ethers.utils.parseEther(depositAmount);

      // Send a transaction to deposit funds into the juror wallet address
      const tx = {
        to: walletAddress,
        value: depositAmountBN,
      };

      await signer.sendTransaction(tx);

      setIsLoading(false);
      console.log('Deposit successful!');
    } catch (error) {
      setIsLoading(false);
      console.error('Error depositing funds:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Convert cid to uint
      const cidNumber = parseInt(cid, 10);

      // Call the updateDisputeResult function on the disputeResolutionCenter contract
      const tx = await disputeResolutionCenter.updateDisputeResult(win, lose, cidNumber);

      // Wait for the transaction to be confirmed
      await tx.wait();

      setIsLoading(false);
      console.log('Dispute result updated successfully!');
    } catch (error) {
      setIsLoading(false);
      console.error('Error updating dispute result:', error);
    }
  };

  return (
    <div className="w-2/3 mx-auto text-white">
      <button
        className="px-4 py-2 bg-blue-500 rounded"
        disabled={isLoading || !walletAddress}
        onClick={handleCreateJurorWallet}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
        ) : (
          'Create Juror Wallet'
        )}
      </button>

      {walletAddress && (
        <div className="mt-4">
          <h6 className="text-xl">Juror Wallet Address</h6>
          <p>{walletAddress}</p>
        </div>
      )}

      {balance !== '' && (
        <div className="mt-4">
          <h6 className="text-xl">Juror Wallet Balance</h6>
          <p>{balance} DEV</p>
        </div>
      )}

      <input
        type="text"
        placeholder="Deposit Amount"
        value={depositAmount}
        onChange={(e) => setDepositAmount(e.target.value)}
        className="p-2 border rounded mt-4 w-full text-black"
      />

      <button
        className="px-4 py-2 bg-blue-500 rounded mt-4"
        disabled={isLoading || !walletAddress}
        onClick={handleDeposit}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
        ) : (
          'Deposit'
        )}
      </button>

      <h1 className="text-2xl mt-4">All Disputes</h1>
      <div className="overflow-x-auto">
            <table className="w-full mt-2 bg-blue-900">
              <thead>
                <tr>
                  <th className="px-4 py-2">From Address</th>
                  <th className="px-4 py-2">To Address</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Decision</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((dispute, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">{`${dispute[0].substring(0, 4)}...${dispute[0].substring(dispute[0].length - 4)}`} </td>
                    <td className="px-4 py-2">{`${dispute[1].substring(0, 4)}...${dispute[1].substring(dispute[1].length - 4)}`}</td>
                    <td className="px-4 py-2">{dispute[2].toNumber()}</td>
                    <td className="px-4 py-2">{dispute[3]}</td>
                    <td className="px-4 py-2">{dispute[5].undecided ? 'Undecided' : dispute[5].win ? 'Win' : 'Lose'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

      <h1 className="text-2xl mt-4">Update Dispute Result</h1>
      <div className="flex flex-col mt-2">
        <label className="inline-flex items-center mt-2">
          <input
            type="radio"
            className="form-radio h-5 w-5 text-blue-500"
            checked={win}
            onChange={() => {
              setWin(true);
              setLose(false);
            }}
          />
          <span className="ml-2">Win</span>
        </label>
        <label className="inline-flex items-center mt-2">
          <input
            type="radio"
            className="form-radio h-5 w-5 text-blue-500"
            checked={lose}
            onChange={() => {
              setWin(false);
              setLose(true);
            }}
          />
          <span className="ml-2">Lose</span>
        </label>
        <input
          type="number"
          placeholder="CID"
          value={cid}
          onChange={(e) => setCid(e.target.value)}
          className="p-2 border rounded mt-2 w-full text-black"
        />
        <button
          className="px-4 py-2 bg-blue-500 rounded mt-2"
          disabled={isLoading || !win === !lose || cid === ''}
          onClick={handleSubmit}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
          ) : (
            'Submit'
          )}
        </button>
      </div>
    </div>
  );
};

export default Juror;
