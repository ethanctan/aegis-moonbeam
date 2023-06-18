import './App.css';
import { useEthers, useContractFunction, useTokenBalance, useCall, useEtherBalance } from '@usedapp/core';
import { Button, Grid, Card } from '@mui/material';
import { Box } from '@mui/system';
import { Contract } from 'ethers';

import ConsumerDashboardGen from './out/ConsumerDashboardGen.sol/ConsumerDashboardGen.json';
import ProtocolWalletGen from './out/ProtocolWalletGen.sol/ProtocolWalletGen.json';
import DisputeResolutionCenter from './out/DisputeResolutionCenter.sol/DisputeResolutionCenter.json';

import React, { useState } from 'react';

// Consumer components
import CreateDashboard from './components/CreateDashboard';

// Juror components
import Juror from './components/Juror';

// Protocol components
import Protocol from './components/Protocol';
import GetDashboardAddress from './components/GetDashboardAddress';


const styles = {
  box: { minHeight: '100vh', backgroundColor: '#1b3864' },
  vh100: { minHeight: '100vh' },
  card: { borderRadius: 4, padding: 4, maxWidth: '550px', width: '100%' },
  alignCenter: { textAlign: 'center' },
};

// Contract addresses
// const addresses = {
//   owner: '0x8066221588691155A7594291273F417fa4de3CAe', // my address, remove if not needed
//   consumerDashboardGen: '0x3CE44692496B80ceE36965EEf8ce08bFB8834f7D',
//   protocolWalletGen: '0x5ef703f49fB6D646bF36131Bed6390E5514A875A',
//   disputeResolutionCenter: '0x3D62277e091Ec688F8Ba1E4bc2a84fD7EeE47139',
//   lottery: '0x3EC0549914d56e8b97859cb6FDBABc667809841A'
// }

// New addresses with public functions instead of external
const addresses = {
  owner: '0x8066221588691155A7594291273F417fa4de3CAe', // my address, remove if not needed
  consumerDashboardGen: '0xf7670f2ba1aD7c86E4A073222BBb60890a663D79',
  protocolWalletGen: '0xe032154b66c31B3aFC224F4280CD9a5BC6C888c0',
  disputeResolutionCenter: '0xf89F7995BDe8350978eB1df7C7C58BC56Cd8eD14',
  lottery: '0xD2A10434c44121F26385b1Cd944Ddc96B037Df63'
}

function App() {

  // Contract objects
  const consumerDashboardGen = new Contract(addresses.consumerDashboardGen, ConsumerDashboardGen.abi);
  const protocolWalletGen = new Contract(addresses.protocolWalletGen, ProtocolWalletGen.abi);
  const disputeResolutionCenter = new Contract(addresses.disputeResolutionCenter, DisputeResolutionCenter.abi);

  // Connect metamask wallet
  const { activateBrowserWallet, deactivate, account } = useEthers();
  const handleWalletConnection = () => { // Handle the wallet toggle
    if (account) deactivate();
    else activateBrowserWallet();
  };

  // Functions to interact with smart contracts
  // Use the useContractFunction() in useDApp (as opposed to the Moonbeam tutorial which has useCall -> this is only for reading info (gasless))
  

  // Selector variables: Conditionally render Consumer.js, Juror.js or Protocol.js based on which selector button is clicked
  const [showJuror, setShowJuror] = useState(false);
  const [showConsumer, setShowConsumer] = useState(false);
  const [showProtocol, setShowProtocol] = useState(false);

  // const { chainId, library, active } = useEthers();
  // const etherBalance = useEtherBalance(account)
  // const totalSupply = useCall({ consumerDashboardGen, method: 'totalSupply', args: [] });
  // console.log(etherBalance)
  
  return (
    <Box sx={styles.box}>

      {/* Connect wallet button */}

      <Grid
        container
        direction='column'
        alignItems='center'
        justifyContent='center'
      >
        <Box position='absolute' top={8} right={16}>
          <Button variant='contained' onClick={handleWalletConnection}>
            {account
              ? `Disconnect ${account.substring(0, 5)}...`
              : 'Connect Wallet'}
          </Button>
        </Box>
      </Grid>

      {/* Selector buttons: Are you a juror, consumer, or protocol? Only appears if user has not selected an option. */}
      { !showJuror && !showConsumer && !showProtocol &&
      <Grid
        container
        direction='column'
        alignItems='center'
        justifyContent='center'
      >
        <Card sx={styles.card}>
          <Grid
            container
            direction='column'
            alignItems='center'
            justifyContent='center'
          >
            <h1 style={styles.alignCenter}>I am a...</h1>
            <Grid
              container
              direction='row'
              alignItems='center'
              justifyContent='center'
              spacing={2}
            >
              <Grid item>
                <Button variant='contained' className = "consumer" onClick={() => {setShowConsumer(true)}}>
                  User
                </Button>
              </Grid>
              <Grid item>
                <Button variant='contained' className = "protocol" onClick={() => {setShowProtocol(true)}}>
                  Protocol
                </Button>
              </Grid>
              <Grid item>
                <Button variant='contained' className = "juror" onClick={() => {setShowJuror(true)}}>
                  Juror
                </Button>
              </Grid>

            </Grid>
          </Grid>
        </Card>
      </Grid>
      }

      {/* Conditional rendering of components */}
      {showJuror && <Juror />}
      {showConsumer && 
       <CreateDashboard consumerDashboardGen={consumerDashboardGen} />      
      }
      {showConsumer && 
       <GetDashboardAddress consumerDashboardGen={consumerDashboardGen} />      
      }
      {showProtocol && <Protocol />}

      {/* Back button to go back to selection screen */}
      {(showJuror || showConsumer || showProtocol) && 
      <Grid
        container
        direction='column'
        alignItems='center'
        justifyContent='center'
      >
        <Card sx={styles.card}>
          <Grid
            container
            direction='column'
            alignItems='center'
            justifyContent='center'
          >
            <Button variant='contained' onClick={() => {setShowJuror(false); setShowConsumer(false); setShowProtocol(false)}}>
              Back
            </Button>
          </Grid>
        </Card>
      </Grid>
      }

      {/* sandbox - delete later */}
      {/* Test if tailwind css is working */}
      <div className="bg-red-500 text-white">
        <p>If my background is red and text is white, Tailwind is working</p>
        {/* show metamask account */}
        <p>Connected: {account}</p>
      </div>
      {/* clear local storage */}
      <button onClick={() => {localStorage.clear(); window.location.reload();}}>Clear local storage</button>

    </Box>
  );
};

export default App;
