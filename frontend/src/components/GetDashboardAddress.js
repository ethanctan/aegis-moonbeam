import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ConsumerDashboardJson from './../out/ConsumerDashboard.sol/ConsumerDashboard.json';

const GetDashboardAddress = ({ consumerDashboardGen, signer }) => {
  const [dashboardAddress, setDashboardAddress] = useState(null);
  const [ConsumerDashboard, setConsumerDashboard] = useState(null);
  const [refreshTransactions, setRefreshTransactions] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [refreshDisputes, setRefreshDisputes] = useState(false);
  const [disputes, setDisputes] = useState([]);
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [txHash, setTxHash] = useState('');
  const [block, setBlock] = useState('');
  const [output, setOutput] = useState('');
  const [amount, setAmount] = useState('');
  const [protocols, setProtocols] = useState([]);
  const [refreshProtocols, setRefreshProtocols] = useState(false);

  useEffect(() => {
    const getDA = async () => {
      try {
        const data = await consumerDashboardGen.connect(signer).getDashboardAddress();
        console.log(`The dashboard address is: ${data}`);
        setDashboardAddress(data);
      } catch (error) {
        console.error('Error calling contract:', error);
        setDashboardAddress(null);
      }
    };

    getDA();
  }, []);

  useEffect(() => {
    if (dashboardAddress) {
      setConsumerDashboard(new ethers.Contract(dashboardAddress, ConsumerDashboardJson.abi, signer));
    }
  }, [dashboardAddress]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        if (ConsumerDashboard) {
          const transactionList = await ConsumerDashboard.connect(signer).getTransaction();
          setTransactions(transactionList);
          console.log(transactionList);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, [ConsumerDashboard, signer, refreshTransactions]);

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        if (ConsumerDashboard) {
          const disputeList = await ConsumerDashboard.connect(signer).getDisputes();
          setDisputes(disputeList);
          console.log(disputeList);
        }
      } catch (error) {
        console.error('Error fetching disputes:', error);
      }
    };

    fetchDisputes();
  }, [ConsumerDashboard, signer, refreshDisputes]);

  useEffect(() => {
    const fetchProtocols = async () => {
      try {
        if (ConsumerDashboard) {
          const protocolList = await ConsumerDashboard.connect(signer).getProtocols();
          setProtocols(protocolList);
          console.log(protocolList);
        }
      } catch (error) {
        console.error('Error fetching protocols:', error);
      }
    };

    fetchProtocols();
  }, [ConsumerDashboard, signer, refreshProtocols]);

  const handleSubmitTransaction = async (e) => {
    e.preventDefault();

    try {
      if (ConsumerDashboard) {
        await ConsumerDashboard.addTransaction(fromAddress, toAddress, txHash, parseInt(block), { from: signer.address });
        setFromAddress('');
        setToAddress('');
        setTxHash('');
        setBlock('');
        console.log('Transaction added successfully!');
        setRefreshTransactions(true);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleSubmitDispute = async (e) => {
    e.preventDefault();

    try {
      if (ConsumerDashboard) {
        await ConsumerDashboard.fileDispute(toAddress, output, parseInt(amount), { from: signer.address });
        setToAddress('');
        setOutput('');
        setAmount('');
        console.log('Dispute filed successfully!');
        setRefreshDisputes(true);
      }
    } catch (error) {
      console.error('Error filing dispute:', error);
    }
  };

  const handleRefreshAll = () => {
    setRefreshTransactions(true);
    setRefreshDisputes(true);
    setRefreshProtocols(true);
  };

  return (
    <div className="w-2/3 mx-auto">
      {dashboardAddress ? (
        <div>
          <div className="mt-5">Dashboard Address: {dashboardAddress}</div>
  
          <form onSubmit={handleSubmitTransaction} className="mt-4">
            {/* form inputs */}
          </form>
  
          <h1 className="text-2xl mt-4">My Transactions</h1>
          <div className="overflow-x-auto">
            <table className="w-full mt-2 bg-blue-900">
              <thead>
                <tr>
                  <th className="px-4 py-2">From Address (Transaction)</th>
                  <th className="px-4 py-2">To Address (Transaction)</th>
                  <th className="px-4 py-2">Transaction Hash</th>
                  <th className="px-4 py-2">Block</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">{transaction[0]}</td>
                    <td className="px-4 py-2">{transaction[1]}</td>
                    <td className="px-4 py-2">{transaction[2]}</td>
                    <td className="px-4 py-2">{transaction[3].toNumber()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
  
          <form onSubmit={handleSubmitDispute} className="mt-4">
            {/* form inputs */}
          </form>
  
          <h1 className="text-2xl mt-4">My Disputes</h1>
          <div className="overflow-x-auto">
            <table className="w-full mt-2 bg-blue-900">
              <thead>
                <tr>
                  <th className="px-4 py-2">To Address (Dispute)</th>
                  <th className="px-4 py-2">Output</th>
                  <th className="px-4 py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((dispute, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">{dispute[0]}</td>
                    <td className="px-4 py-2">{dispute[1]}</td>
                    <td className="px-4 py-2">{dispute[2].toNumber()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
  
          <h1 className="text-2xl mt-4">My Protocols</h1>
          <div className="overflow-x-auto">
            <table className="w-full mt-2 bg-blue-900">
              <thead>
                <tr>
                  <th className="px-4 py-2">Protocol Name</th>
                  <th className="px-4 py-2">Protocol Address</th>
                </tr>
              </thead>
              <tbody>
                {protocols.map((protocol, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">{protocol[0]}</td>
                    <td className="px-4 py-2">{protocol[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
  
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded mt-4"
            onClick={handleRefreshAll}
          >
            Refresh All
          </button>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
  
};

export default GetDashboardAddress;
