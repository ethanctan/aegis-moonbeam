import { React, useState } from 'react';
import { useContractFunction, useEthers, useCall, useEtherBalance } from '@usedapp/core';
import { Button, CircularProgress, TextField, Grid } from '@mui/material';
import { utils } from 'ethers';

const CreateDashboard = ({ consumerDashboardGen }) => {

  const { account } = useEthers();
  const { state, send } = useContractFunction(consumerDashboardGen, 'createDashboard');

  const handleTransaction = async () => { 
    // if (chainId !== MoonbaseAlpha.chainId) {
    //   await switchNetwork(MoonbaseAlpha.chainId);
    // } // how to get chainid and switchnetwork?
    send();
    console.log(state);
  };

  // Checks if transaction is still validating
  const isMining = state?.status === 'Mining';
  


  return (
    <div>
        { account == null ? 'Connect Wallet First' : account }
        <Button
        variant='contained' color='primary' fullWidth
        onClick={handleTransaction}
        disabled={state.status === 'Mining' || account == null}
        >
            {isMining? <CircularProgress size={24} /> : 'Create Dashboard'}
        </Button>
    </div>
  );
};

export default CreateDashboard;