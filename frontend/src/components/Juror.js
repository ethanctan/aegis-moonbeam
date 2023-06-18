import React, { useState, useEffect } from 'react';
import { Button, CircularProgress, Typography, TextField } from '@mui/material';
import { ethers } from 'ethers';

const Juror = ({ disputeResolutionCenter, lottery, signer, provider }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [firstDispute, setFirstDispute] = useState(null);

  useEffect(() => {
    const fetchJurorWalletAddress = async () => {
      try {
        setIsLoading(true);

        // Retrieve the address of the juror wallet
        const wallet = await disputeResolutionCenter.jurors(signer.getAddress());
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

  useEffect(() => {
    const handleGetFirstDispute = async () => {
      try {
        setIsLoading(true);
  
        // Call the disputes function to retrieve the array of disputes
        const allDisputes = await disputeResolutionCenter.connect(signer).disputes();
  
        // Check if there are any disputes
        if (allDisputes.length === 0) {
          console.log('No disputes found');
          return;
        }
  
        // Get the first dispute from the array
        const dispute = allDisputes[0];
  
        // Display the dispute values
        setFirstDispute(dispute);
  
        setIsLoading(false);
        console.log('First dispute retrieved successfully!');
      } catch (error) {
        setIsLoading(false);
        console.error('Error retrieving first dispute:', error);
      }
    };

    handleGetFirstDispute();
  }, [disputeResolutionCenter]);

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

  return (
    <div className="w-2/3 mx-auto">
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded"
        disabled={isLoading || walletAddress !== ''}
        onClick={handleCreateJurorWallet}
      >
        {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div> : 'Create Juror Wallet'}
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
        className="px-4 py-2 bg-blue-500 text-white rounded mt-4"
        disabled={isLoading || !walletAddress}
        onClick={handleDeposit}
      >
        {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div> : 'Deposit'}
      </button>
  
      {firstDispute && (
        <div className="mt-4">
          <h6 className="text-xl">First Dispute</h6>
          <p>SC: {firstDispute.sc}</p>
          <p>Owner: {firstDispute.owner}</p>
          <p>To: {firstDispute.to}</p>
          <p>Amount: {firstDispute.amount}</p>
          <p>Output: {firstDispute.output}</p>
          <p>ID: {firstDispute.id}</p>
          <p>CID: {firstDispute.cid}</p>
          <p>Decision: {firstDispute.decision}</p>
          <p>Jurors: {firstDispute.jurors.join(', ')}</p>
        </div>
      )}
    </div>
  );
  };
  
  export default Juror;
  