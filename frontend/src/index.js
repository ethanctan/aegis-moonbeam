import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { getDefaultProvider, Wallet } from 'ethers';

const ethers = require('ethers');


if (typeof window.ethereum !== 'undefined') {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  // Continue with your application logic using the `provider` object

    // get chain id
  console.log("chain id", provider.getNetwork().then((network) => network.chainId));

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App provider={provider} />
    </React.StrictMode>
  );

} else {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <h1>Please install Metamask and connect to Moonbase Alpha.</h1>
    </React.StrictMode>
  );
}
