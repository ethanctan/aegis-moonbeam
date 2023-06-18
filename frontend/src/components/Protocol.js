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
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Protocol Address"
            fullWidth
            value={protocolAddress}
            onChange={(e) => setProtocolAddress(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            disabled={isLoading}
            onClick={handleCreateWallet}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Create Wallet'}
          </Button>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Protocol Address (for balance retrieval)"
            fullWidth
            value={protocolAddress}
            onChange={(e) => setProtocolAddress(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            disabled={isLoading}
            onClick={handleGetBalance}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Get Balance'}
          </Button>
        </Grid>
        {walletAddress && <WalletAddress />}
        {balance && (
          <Grid item xs={12}>
            <div>Balance: {balance} ETH</div>
          </Grid>
        )}
        <Grid item xs={12}>
          <TextField
            label="Deposit Amount"
            fullWidth
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            disabled={isLoading || !walletAddress}
            onClick={handleDeposit}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Deposit'}
          </Button>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Withdraw Amount"
            fullWidth
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            disabled={isLoading || !walletAddress}
            onClick={handleWithdraw}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Withdraw'}
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            disabled={isLoading || !walletAddress}
            onClick={handleGetChargebacks}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Get Chargebacks'}
          </Button>
        </Grid>
        <Grid item xs={12}>
          {chargebacks.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Amount</TableCell>
                    <TableCell>To</TableCell>
                    <TableCell>ID</TableCell>
                    <TableCell>Reason</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chargebacks.map((chargeback) => (
                    <TableRow key={chargeback.id}>
                      <TableCell>{chargeback.amount}</TableCell>
                      <TableCell>{chargeback.to}</TableCell>
                      <TableCell>{chargeback.id}</TableCell>
                      <TableCell>{chargeback.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <div>No chargebacks yet. Yay!</div>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default Protocol;
