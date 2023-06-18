import { React, useState } from 'react';
import { Button, CircularProgress, TextField, Grid } from '@mui/material';
import { utils } from 'ethers';

const CreateDashboard = ({ consumerDashboardGen, signer }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateDashboard = async () => {
    try {
      setIsLoading(true);

      // Prepare your transaction with gas
      const tx = await consumerDashboardGen.connect(signer).createDashboard({
        gasLimit: utils.hexlify(250000),
        });

      // Wait for the transaction to be confirmed
      await tx.wait();

      setIsLoading(false);
      console.log('Dashboard created successfully!');
    } catch (error) {
      setIsLoading(false);
      console.error('Error creating dashboard:', error);
    }
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        disabled={isLoading}
        onClick={handleCreateDashboard}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Create Dashboard'}
      </Button>
    </div>
  );
};

export default CreateDashboard;
