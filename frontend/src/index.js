import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { getDefaultProvider, Wallet } from 'ethers';

const ethers = require('ethers');

const handleConnectMetamask = async () => {
  try {
    // Request access to the user's MetaMask accounts
    await window.ethereum.enable();

    // Create a Web3Provider using MetaMask's provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // Continue with your application logic using the `provider` object

    // Get chain id
    const network = await provider.getNetwork();
    const chainId = network.chainId;
    console.log('chain id', chainId);

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <App provider={provider} />
      </React.StrictMode>
    );
  } catch (error) {
    console.log('Error connecting to Metamask:', error);
  }
};

if (typeof window.ethereum !== 'undefined') {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  // Continue with your application logic using the `provider` object

  // Get chain id
  console.log('chain id', provider.getNetwork().then((network) => network.chainId));

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App provider={provider} />
      <button onClick={handleConnectMetamask}>Connect Metamask</button>
    </React.StrictMode>
  );
} else {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <h1>Please install Metamask and connect to Moonbase Alpha.</h1>
      <button onClick={handleConnectMetamask}>Connect Metamask</button>
    </React.StrictMode>
  );
}
