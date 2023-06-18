import { React, useState } from 'react';
import { useContractFunction, useEthers, useCall, useEtherBalance, useTokenBalance } from '@usedapp/core';
import { Button, CircularProgress, TextField, Grid } from '@mui/material';
import 'ethers';

const GetDashboardAddress = ({ consumerDashboardGen }) => {

    const { account } = useEthers();
    console.log(useEtherBalance(account));

    const { value, error } = useCall({
        contract: consumerDashboardGen, 
        method: 'getDashboardAddress',
        args: [] 
    }) ?? {};

    // detect 'undefined' or 'null' result
    if (value == null) {
        console.log("value is null");
        return undefined
    }

    if (value == undefined) {
        console.log("value is undefined");
        return undefined
    }

    if(error) {
        console.error(error.message);
        return undefined
    }
    console.log("value", value);


    return (
        <div>
            { account == null ? 'Connect Wallet First' : account }
            {value ? 'No Dashboard Created' : 'Dashboard Address: ' + value}
        </div>
      );

};

export default GetDashboardAddress;