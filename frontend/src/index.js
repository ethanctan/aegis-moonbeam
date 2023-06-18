import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DAppProvider, MoonbaseAlpha } from '@usedapp/core';
import { getDefaultProvider, Wallet } from 'ethers';

// Create a provider in order to talk to the blockchain
// useDapp method
// const config = {
//   readOnlyChainId: MoonbaseAlpha.chainId,
//   readOnlyUrls: {
//     [MoonbaseAlpha.chainId]: getDefaultProvider(
//       'https://rpc.api.moonbase.moonbeam.network'
//     ),
//   },
// };

// Ethers method
const ethers = require('ethers');

// 2. Define network configurations
// const providerRPC = {
//   moonbase: {
//     name: 'moonbase-alpha',
//     rpc: 'https://rpc.api.moonbase.moonbeam.network',
//     chainId: 1287, // 0x507 in hex,
//   },
// };
// // 3. Create ethers provider
// const provider = new ethers.providers.JsonRpcProvider(
//   providerRPC.moonbase.rpc, 
//   {
//     chainId: providerRPC.moonbase.chainId,
//     name: providerRPC.moonbase.name,
//   }
// );
if (typeof window.ethereum !== 'undefined') {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  // Continue with your application logic using the `provider` object

    // get chain id
  console.log("chain id", provider.getNetwork().then((network) => network.chainId));

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    // <React.StrictMode>
    //   <DAppProvider config={config}>
    //     <App signer={signer} />
    //   </DAppProvider>
    // </React.StrictMode>
    <React.StrictMode>
      <App provider={provider} />
    </React.StrictMode>
  );

} else {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    // <React.StrictMode>
    //   <DAppProvider config={config}>
    //     <App signer={signer} />
    //   </DAppProvider>
    // </React.StrictMode>
    <React.StrictMode>
      <h1>Please install Metamask and connect to Moonbase Alpha.</h1>
    </React.StrictMode>
  );
}



