import { React, useState, useEffect } from 'react';
import { Button, CircularProgress, TextField, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { utils, ethers } from 'ethers';
import ProtocolWalletJson from './../out/ProtocolWallet.sol/ProtocolWallet.json';

const Protocol = ({ protocolWalletGen, signer, provider }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [protocolAddress, setProtocolAddress] = useState('');
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [walletContract, setWalletContract] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [chargebacks, setChargebacks] = useState([]);

  const handleCreateWallet = async () => {
    try {
      setIsLoading(true);

      // Prepare your transaction with gas
      const tx = await protocolWalletGen
        .connect(signer)
        .createProtocolWallet(protocolAddress, name, {
          gasLimit: utils.hexlify(250000),
        });

      // Wait for the transaction to be confirmed
      await tx.wait();

      setIsLoading(false);
      console.log('Wallet created successfully!');
    } catch (error) {
      setIsLoading(false);
      console.error('Error creating wallet:', error);
    }
  };

  const handleGetBalance = async () => {
    try {
      setIsLoading(true);

      // Call the getWalletAddress function to retrieve the wallet address
      const walletAddress = await protocolWalletGen.getWalletAddress(protocolAddress);

      // Use the obtained wallet address to get the balance
      setWalletContract(new ethers.Contract(walletAddress, ProtocolWalletJson.abi, signer));
      const walletBalance = await provider.getBalance(walletAddress);

      const balanceInEth = ethers.utils.formatEther(walletBalance); // Convert balance to ETH

      setBalance(balanceInEth);
      setWalletAddress(walletAddress);

      setIsLoading(false);
      console.log('Balance retrieved successfully!');
    } catch (error) {
      setIsLoading(false);
      console.error('Error retrieving balance:', error);
    }
  };

  const handleDeposit = async () => {
    try {
      setIsLoading(true);

      // Convert the deposit amount to ethers' BigNumber format
      const depositAmountBN = ethers.utils.parseEther(depositAmount);

      // Call the receive function on the wallet contract to deposit funds
      let tx = {
        to: walletAddress,
        value: depositAmountBN
      };
      await signer.sendTransaction(tx);

      setIsLoading(false);
      console.log('Deposit successful!');
    } catch (error) {
      setIsLoading(false);
      console.error('Error depositing funds:', error);
    }
  };

  const handleWithdraw = async () => {
    try {
      setIsLoading(true);

      // Convert the withdraw amount to ethers' BigNumber format
      const withdrawAmountBN = ethers.utils.parseEther(withdrawAmount);

      // Call the withdraw function on the wallet contract to withdraw funds
      await walletContract.connect(signer).withdraw(withdrawAmountBN);

      setIsLoading(false);
      console.log('Withdrawal successful!');
    } catch (error) {
      setIsLoading(false);
      console.error('Error withdrawing funds:', error);
    }
  };

  const handleGetChargebacks = async () => {
    try {
      setIsLoading(true);

      // Call the getChargebacks function on the wallet contract to retrieve chargebacks
      const chargebacksArray = await walletContract.getChargebacks();

      setChargebacks(chargebacksArray);

      setIsLoading(false);
      console.log('Chargebacks retrieved successfully!');
    } catch (error) {
      setIsLoading(false);
      console.error('Error retrieving chargebacks:', error);
    }
  };

  const WalletAddress = () => (
    <Grid item xs={12}>
      <div>Wallet Address: {walletAddress}</div>
    </Grid>
  );

  useEffect(() => {
    if (walletContract) {
      handleGetChargebacks();
    }
  }, [walletContract]);

  return (
    <div className="w-2/3 mx-auto">
      <div className="grid grid-cols-1 gap-2">
        <div>
          <input
            type="text"
            placeholder="Protocol Address"
            value={protocolAddress}
            onChange={(e) => setProtocolAddress(e.target.value)}
            className="p-2 border rounded w-full text-black"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 border rounded w-full text-black"
          />
        </div>
        <div>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            disabled={isLoading}
            onClick={handleCreateWallet}
          >
            {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div> : 'Create Wallet'}
          </button>
        </div>
        <div>
          <input
            type="text"
            placeholder="Protocol Address (for balance retrieval)"
            value={protocolAddress}
            onChange={(e) => setProtocolAddress(e.target.value)}
            className="p-2 border rounded w-full text-black"
          />
        </div>
        <div>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            disabled={isLoading}
            onClick={handleGetBalance}
          >
            {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div> : 'Get Balance'}
          </button>
        </div>
        {walletAddress && <WalletAddress />}
        {balance && (
          <div>
            <div>Balance: {balance} ETH</div>
          </div>
        )}
        <div>
          <input
            type="text"
            placeholder="Deposit Amount"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="p-2 border rounded w-full text-black"
          />
        </div>
        <div>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            disabled={isLoading || !walletAddress}
            onClick={handleDeposit}
          >
            {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div> : 'Deposit'}
          </button>
        </div>
        <div>
          <input
            type="text"
            placeholder="Withdraw Amount"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="p-2 border rounded w-full text-black"
          />
        </div>
        <div>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            disabled={isLoading || !walletAddress}
            onClick={handleWithdraw}
          >
            {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div> : 'Withdraw'}
          </button>
        </div>
        <div>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            disabled={isLoading || !walletAddress}
            onClick={handleGetChargebacks}
          >
            {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div> : 'Get Chargebacks'}
          </button>
        </div>
        <div>
          {chargebacks.length > 0 ? (
            <div className="w-full">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">To</th>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {chargebacks.map((chargeback) => (
                    <tr key={chargeback.id}>
                      <td className="px-4 py-2">{chargeback.amount}</td>
                      <td className="px-4 py-2">{chargeback.to}</td>
                      <td className="px-4 py-2">{chargeback.id}</td>
                      <td className="px-4 py-2">{chargeback.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div>No chargebacks yet. Yay!</div>
          )}
        </div>
      </div>
    </div>
  );
  };
  
  export default Protocol;
  
