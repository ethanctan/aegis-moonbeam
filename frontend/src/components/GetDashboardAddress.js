import React, { useState, useEffect } from 'react';
import { Button, TextField, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { Contract } from 'ethers';
import ConsumerDashboardJson from './../out/ConsumerDashboard.sol/ConsumerDashboard.json';

const GetDashboardAddress = ({ consumerDashboardGen, signer }) => {
  const [dashboardAddress, setDashboardAddress] = useState(null);
  const [ConsumerDashboard, setConsumerDashboard] = useState(null);
  const [refreshTransactions, setRefreshTransactions] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [refreshDisputes, setRefreshDisputes] = useState(false);
  const [disputes, setDisputes] = useState([]);

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
      setConsumerDashboard(new Contract(dashboardAddress, ConsumerDashboardJson.abi, signer));
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

  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [txHash, setTxHash] = useState('');
  const [block, setBlock] = useState('');
  const [output, setOutput] = useState('');
  const [amount, setAmount] = useState('');

  const [protocols, setProtocols] = useState([]);
  const [refreshProtocols, setRefreshProtocols] = useState(false);

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


  const handleRefreshAll = () => {
    setRefreshTransactions(true);
    setRefreshDisputes(true);
    setRefreshProtocols(true);
  };

  return (
    <div>
      {dashboardAddress ? (
        <div>
          Dashboard Address: {dashboardAddress}

          <form onSubmit={handleSubmitTransaction}>
            <TextField
              label="From Address (Transaction)"
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
              required
            />
            <TextField
              label="To Address (Transaction)"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              required
            />
            <TextField
              label="Transaction Hash"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              required
            />
            <TextField
              label="Block"
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              type="number"
              required
            />
            <Button type="submit">Add Transaction</Button>
          </form>

        <h1>My Transactions</h1>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>From Address (Transaction)</TableCell>
                <TableCell>To Address (Transaction)</TableCell>
                <TableCell>Transaction Hash</TableCell>
                <TableCell>Block</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell>{transaction[0]}</TableCell>
                  <TableCell>{transaction[1]}</TableCell>
                  <TableCell>{transaction[2]}</TableCell>
                  <TableCell>{transaction[3].toNumber()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <form onSubmit={handleSubmitDispute}>
            <TextField
              label="To Address (Dispute)"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              required
            />
            <TextField
              label="Output"
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              required
            />
            <TextField
              label="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              required
            />
            <Button type="submit">File Dispute</Button>
          </form>

        <h1>My Disputes</h1>
          <Table>
            <TableHead>
                <TableRow>
                <TableCell>From Address (Dispute)</TableCell>
                <TableCell>To Address (Dispute)</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Output</TableCell>
                <TableCell>Decision</TableCell> {/* New column */}
                </TableRow>
            </TableHead>
            <TableBody>
                {disputes.map((dispute, index) => (
                <TableRow key={index}>
                    <TableCell>{dispute[0]}</TableCell>
                    <TableCell>{dispute[1]}</TableCell>
                    <TableCell>{dispute[2].toNumber()}</TableCell>
                    <TableCell>{dispute[3]}</TableCell>
                    <TableCell>{dispute[5].undecided ? 'Undecided' : dispute[5].win ? 'Win' : 'Lose'}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>

          {/* Table for Protocols */}
          <h1>Protocols</h1>
            <Table>
            <TableHead>
              <TableRow>
                <TableCell>Wallet</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Collateral</TableCell>
                <TableCell>Id</TableCell>
                <TableCell>Listed</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {protocols.map((protocol, index) => (
                <TableRow key={index}>
                  <TableCell>{protocol.wallet}</TableCell>
                  <TableCell>{protocol.name}</TableCell>
                  <TableCell>{protocol.collateral}</TableCell>
                  <TableCell>{protocol.Id}</TableCell>
                  <TableCell>{protocol.listed ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button onClick={handleRefreshAll}>Refresh All</Button>
        </div>
      ) : (
        <div>No Dashboard Created</div>
      )}
    </div>
  );
};

export default GetDashboardAddress;
