import React, { useState, useEffect } from 'react';
import { Button, CircularProgress, Typography } from '@mui/material';

const Juror = ({ disputeResolutionCenter, lottery, provider, signer }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

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

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        disabled={isLoading}
        onClick={handleCreateJurorWallet}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Create Juror Wallet'}
      </Button>
      {walletAddress && (
        <Typography variant="body1" style={{ marginTop: '1rem' }}>
          Juror Wallet Address: {walletAddress}
        </Typography>
      )}
    </div>
  );
};

export default Juror;
