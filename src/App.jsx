import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/wavePortal.json'

export default function App() {
  const [currentAccount, setCurrentAccount] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setLoading] = useState(false)

  const contactAddress = "0xCeDb72cC15E6F1696be2dE8248fbd2C6cd8C3895";

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
        alert("Get Metamask!!!");
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
        const wavePortalContract = new ethers.Contract(contactAddress, abi.abi, signer);

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
        const wavePortalContract = new ethers.Contract(contactAddress, abi.abi, signer);

        let count = await wavePortalContract.getTotalAmountOfWaves();
        setTotalCount(count)
        console.log("retrieved total wave count <<<<===", count.toNumber());


        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave();
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

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  useEffect(() => {
    getTotalWavers();
  }, [totalCount])




  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          👋 Hey there!
        </div>

        <div className="bio">
          I am narth and I worked on self-driving cars so that's pretty cool right? Connect your Ethereum wallet and wave at me!
        </div>
        <center>Number of waves:{isLoading ? ' Minning please wait ' : +totalCount +" waves"}</center>
        <div style={{ marginTop: '2rem' }}>
          Account: {currentAccount ? currentAccount : <span style={{ color: 'red' }}>{"add an account"}</span>}
        </div>
        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}
