import { ethers } from 'ethers';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';
import api from '../Transactions.json';

const contractABI = api.abi;
const contractAddress = '0xCFB8815D7a016dc55cF17C384e71b280A09DA146'; // `npx hardhat run scripts/deploy.js --network ropsten` のときのやつ

const createEthereumContract = async () => {
  if (typeof window === 'undefined') return;
  const { ethereum } = window as any;
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer,
  );

  console.log({ provider, signer, transactionContract });
  // transactionContract に.solで指定した関数たちが入っている

  return transactionContract;
};

const Home: NextPage = () => {
  const [currentAccount, setCurrentAccount] = useState();
  const [formInput, setFormInput] = useState({
    addressTo: '',
    amount: '',
    message: '',
    keyword: '',
  });
  const [transactionCount, setTransactionCount] = useState();

  /* Walletに接続 */
  const connectWallet = async () => {
    try {
      if (typeof window === 'undefined') return;
      const { ethereum } = window as any;
      if (!ethereum) return alert('Please install MetaMask');

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('connectWallet', accounts);

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
      throw new Error('No ethereum object.');
    }
  };

  useEffect(() => {
    /* Walletとの接続状態をチェック */
    const checkIfWalletIsConnected = async () => {
      try {
        if (typeof window === 'undefined') return;
        const { ethereum } = window as any;

        const accounts = await ethereum.request({ method: 'eth_accounts' });

        console.log('checkIfWalletIsConnected', accounts);

        if (accounts.length) {
          setCurrentAccount(accounts[0]);
          // getAllTransactions();
        } else {
          console.log('no accounts');
        }
      } catch (error) {
        console.error(error);
        throw new Error('No ethereum object.');
      }
    };
    checkIfWalletIsConnected();
  }, []);

  /* 送信 */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormInput({ ...formInput, [name]: value });
  };

  const sendTransaction = async () => {
    try {
      if (typeof window === 'undefined') return;
      const { ethereum } = window as any;
      if (!ethereum) return alert('Please install MetaMask');

      const { addressTo, amount, message, keyword } = formInput;

      const transactionContract = await createEthereumContract();
      if (!transactionContract) throw new Error('No transactionContract');
      const parseAmount = ethers.utils.parseEther(amount);

      await ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: '0x5208', // 21000
            value: parseAmount._hex, // 0.00001
          },
        ],
      });

      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        parseAmount,
        message,
        keyword,
      );

      console.log(`Loading - ${transactionHash.hash}`);
      await transactionHash.wait();
      console.log(`Success - ${transactionHash.hash}`);

      const transactionsCount = await transactionContract.getTransactionCount();
      setTransactionCount(transactionsCount.toNumber());
      window.location.reload();
    } catch (error) {
      console.error(error);
      throw new Error('No ethereum object.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { addressTo, amount, message, keyword } = formInput;
    if (!addressTo || !amount || !message || !keyword) return;

    sendTransaction();
  };

  return (
    <div className={styles.container}>
      <h1>Lesson Web3 Blockchain App</h1>
      {currentAccount && (
        <button onClick={connectWallet}>connect to wallet</button>
      )}
      <br />
      <form onSubmit={handleSubmit}>
        <input
          name='addressTo'
          type='text'
          placeholder='addressTo'
          value={formInput.addressTo}
          onChange={handleChange}
        />
        <br />
        <input
          name='amount'
          type='text'
          placeholder='amount'
          value={formInput.amount}
          onChange={handleChange}
        />
        <br />
        <input
          name='message'
          type='text'
          placeholder='message'
          value={formInput.message}
          onChange={handleChange}
        />
        <br />
        <input
          name='keyword'
          type='text'
          placeholder='keyword'
          value={formInput.keyword}
          onChange={handleChange}
        />
        <br />
        <button type='submit'>send transaction</button>
      </form>
    </div>
  );
};

export default Home;
