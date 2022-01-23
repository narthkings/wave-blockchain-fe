import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/wavePortal.json'

export default function App() {
  const [currentAccount, setCurrentAccount] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setLoading] = useState(false)
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState('');

  const contractAddress = "0x20BFd1254264B272aBE28944D0e97514D669E707";

  const checkIfWalletIsConnected = async () => {
    try {
 
      /*
      * First make sure we have access to window.ethereum
      */
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
      * Check if we're authorized to access the user's wallet
      */

      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        const account = accounts[0]
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (err) {
      console.log(err)
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get a Metamask Account!!!");
        return;
      }

      const accounts = ethereum.request({ method: "eth_requestAccounts" })
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err)
    }
  }

  const getTotalWavers = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, abi.abi, signer);

        let count = await wavePortalContract.getTotalAmountOfWaves();
        setTotalCount(count)
        console.log("retrieved total wave count <<<<===", count.toNumber());
      }
    } catch (err) {
      throw new Error(err)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, abi.abi, signer);

        let count = await wavePortalContract.getTotalAmountOfWaves();
        setTotalCount(count)
        console.log("retrieved total wave count <<<<===", count.toNumber());


        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave(message, {
          gasLimit: 300000
        });
        setLoading(true)
        alert('Transaction Minning please wait', waveTxn.hash)

        console.log('Minning >>>>', waveTxn.hash);


        await waveTxn.wait();
        setLoading(false)

        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalAmountOfWaves();
        setTotalCount(count)
        console.log("total waves retrieved after minning <<<>>>", count.toNumber())

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (err) {
      throw new Error(err)
    }
  }

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, abi.abi, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */

        const waves = await wavePortalContract.getAllWaves();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        const wavesCleaned = waves.map(wave => {
        return {
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message,
        };
      });
        /*
          * Store our data in React State
          */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }

    } catch (e) {
      throw new Error(e)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  useEffect(() => {
    getTotalWavers();
  }, [totalCount])

 useEffect(() => {
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, abi.abi, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };
}, []);



  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          👋 Hey there!
        </div>

        <div className="bio">
          I am narth an aspiring fullstack solidity developer. Connect your Ethereum wallet and send me a freaking wave (you just might be lucky to get a small token of ether from me 😇)
        </div>
        <center>Number of waves:{isLoading ? ' Minning please wait ' : +totalCount + " waves"}</center>
        <div style={{ marginTop: '2rem' }}>
          Account: {currentAccount ? currentAccount : <span style={{ color: 'red' }}>{"add an account"}</span>}
        </div>
        <input type="text" placeholder='Attach a Message' onChange={(e) => setMessage(e.target.value)} />
        <button disabled={!message} className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        {currentAccount &&
          <button className="waveButton" onClick={getAllWaves}>
            Get All Waves 👋
        </button>}

        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}
