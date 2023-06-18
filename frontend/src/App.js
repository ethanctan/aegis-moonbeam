import './App.css';
import { useEthers, useContractFunction, useTokenBalance, useCall, useEtherBalance } from '@usedapp/core';
import { Button, Grid, Card } from '@mui/material';
import { Box } from '@mui/system';
import { Contract, Wallet } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';


import ConsumerDashboardGen from './out/ConsumerDashboardGen.sol/ConsumerDashboardGen.json';
import ProtocolWalletGen from './out/ProtocolWalletGen.sol/ProtocolWalletGen.json';
import DisputeResolutionCenter from './out/DisputeResolutionCenter.sol/DisputeResolutionCenter.json';

import React, { useState, useEffect } from 'react';

// Consumer components
import CreateDashboard from './components/CreateDashboard';

// Juror components
import Juror from './components/Juror';

// Protocol components
import Protocol from './components/Protocol';
import GetDashboardAddress from './components/GetDashboardAddress';

const addresses = {
  owner: '0x8066221588691155A7594291273F417fa4de3CAe', // my address, remove if not needed
  consumerDashboardGen: '0xf7670f2ba1aD7c86E4A073222BBb60890a663D79',
  protocolWalletGen: '0xe032154b66c31B3aFC224F4280CD9a5BC6C888c0',
  disputeResolutionCenter: '0xf89F7995BDe8350978eB1df7C7C58BC56Cd8eD14',
  lottery: '0xD2A10434c44121F26385b1Cd944Ddc96B037Df63'
}

function App({ provider }) {

  const [showJuror, setShowJuror] = useState(false);
  const [showConsumer, setShowConsumer] = useState(false);
  const [showProtocol, setShowProtocol] = useState(false);

  const signer = provider.getSigner();

  const consumerDashboardGen = new Contract(addresses.consumerDashboardGen, ConsumerDashboardGen.abi, signer);
  const protocolWalletGen = new Contract(addresses.protocolWalletGen, ProtocolWalletGen.abi, signer);
  const disputeResolutionCenter = new Contract(addresses.disputeResolutionCenter, DisputeResolutionCenter.abi, signer);
  const lottery = new Contract(addresses.lottery, DisputeResolutionCenter.abi, signer);

  return (
    <Box className="min-h-screen bg-gray-900 text-white">

    {/* Gradient Text */}
      <div className="text-center py-8">
      <h2 className="font-bold text-4xl text-gradient">
        Aegis Protocol
      </h2>
    </div>

      {/* Header */}
      <img src="https://uploads-ssl.webflow.com/647d37d4d622353242807240/647d9338720ca40f9f6e78a6_LogoJust.png" alt="Logo" className="h-24 mx-auto mb-8 mt-1" />


      {/* Connect wallet button */}
      <Grid
        container
        direction='column'
        alignItems='center'
        justifyContent='center'
      >
        <Box className="absolute top-8 right-16">
          {/* <Button variant='contained' onClick={handleConnectWallet}>
            {userAddress
              ? `Disconnect ${userAddress.substring(0, 5)}...`
              : 'Connect Wallet'}
          </Button> */}
        </Box>
      </Grid>

      {/* Selector buttons */}
      {!showJuror && !showConsumer && !showProtocol &&
      <Grid
        container
        direction='column'
        alignItems='center'
        justifyContent='center'
      >
        <Card className="rounded-lg p-4 max-w-550px w-full box">
          <Grid
            container
            direction='column'
            alignItems='center'
            justifyContent='center'
          >
            <h1 className="text-center text-white pb-4">I am a...</h1>
            <Grid
              container
              direction='row'
              alignItems='center'
              justifyContent='center'
              spacing={2}
            >
              <Grid item>
                <Button variant='contained' className="bg-sky-blue hover:bg-blue-400 text-black" onClick={() => { setShowConsumer(true) }}>
                  User
                </Button>
              </Grid>
              <Grid item>
                <Button variant='contained' className="bg-violet hover:bg-purple-400 text-black" onClick={() => { setShowProtocol(true) }}>
                  Protocol
                </Button>
              </Grid>
              <Grid item>
                <Button variant='contained' className="bg-violet hover:bg-purple-400 text-black" onClick={() => { setShowJuror(true) }}>
                  Juror
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      </Grid>
      }

      {/* Conditional rendering of components */}
      {showJuror && <Juror disputeResolutionCenter={disputeResolutionCenter} lottery={lottery} signer={signer} provider={provider} />}
      {showConsumer &&
        <>
          <CreateDashboard consumerDashboardGen={consumerDashboardGen} signer={signer} />
          <GetDashboardAddress consumerDashboardGen={consumerDashboardGen} signer={signer} />
        </>
      }
      {showProtocol && <Protocol protocolWalletGen={protocolWalletGen} signer={signer} provider={provider} />}

      {/* Back button to go back to selection screen */}
      {(showJuror || showConsumer || showProtocol) &&
        <Grid
          container
          direction='column'
          alignItems='center'
          justifyContent='center'
        >
          <Card className="rounded-lg p-4 box">
            <Grid
              container
              direction='column'
              alignItems='center'
              justifyContent='center'
            >
              <Button variant='contained' onClick={() => { setShowJuror(false); setShowConsumer(false); setShowProtocol(false) }}>
                Back
              </Button>
            </Grid>
          </Card>
        </Grid>
      }
    </Box>
  );
}

export default App;
