import { useState, useEffect } from 'react'
import Head from 'next/head'
import Web3 from 'web3'
import styles from '../styles/Home.module.css'
import LotteryContract from "../artifacts/contracts/Lottery.sol/Lottery.json";

export default function Lotto() {
  const [web3, setWeb3] = useState()
  const [address, setAddress] = useState()
  const [isOwner, setIsOwner] = useState(false);
  const [lotteryContract, setLotteryContract] = useState()
  const [lotteryPot, setLotteryPot] = useState()
  const [lotteryPlayers, setPlayers] = useState([])
  const [lotteryHistory, setLotteryHistory] = useState([])
  const [lotteryId, setLotteryId] = useState()
  const [error, setError] = useState('')
  const [contractOwner, setContractOwner] = useState()

  const initializeLotteryContract = (web3) => {
    return new web3.eth.Contract(
        LotteryContract.abi,
        "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    )
}

  useEffect(() => {
    updateState()
  }, [lotteryContract])

  const updateState = () => {
    if (lotteryContract) {
      getPot()
      getLotteryId()
      getPlayers()
      setContractOwner(lotteryContract.methods.owner().call())
    }
  }

  const getPot = async () => {
    const pot = await lotteryContract.methods.getBalance().call()
    setLotteryPot(web3.utils.fromWei(pot, 'ether'))
  }

  const getPlayers = async () => {
    const players = await lotteryContract.methods.getPlayers().call()
    setPlayers(players)
  }

  const getHistory = async (id) => {
    setLotteryHistory([])
    for (let i = parseInt(id); i > 0; i--) {
      const winnerAddress = await lotteryContract.methods.lotteryHistory(i).call()
      const historyObj = {}
      historyObj.id = i
      historyObj.address = winnerAddress
      setLotteryHistory(lotteryHistory => [...lotteryHistory, historyObj])
    }
  }

  const getLotteryId = async () => {
    const lotteryId = await lotteryContract.methods.lotteryId().call()
    setLotteryId(lotteryId)
    await getHistory(lotteryId)
  }

  const enterLotteryHandler = async () => {
    setError('')
    try {
      await lotteryContract.methods.enter().send({
        from: address,
        value: '15000000000000000',
        gas: 300000,
        gasPrice: null
      })
      updateState()
    } catch(err) {
      setError(err.message)
    }
  }

  const pickWinnerHandler = async () => {
    setError('')
    try {
      await lotteryContract.methods.pickWinner().send({
        from: address,
        gas: 300000,
        gasPrice: null
      })
      updateState()
    } catch(err) {
      setError(err.message)
    }
  }

  const connectWalletHandler = async () => {
    setError('')
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts"})
        const web3 = new Web3(window.ethereum)
        setWeb3(web3)
        const accounts = await web3.eth.getAccounts()
        setAddress(accounts[0])

        const lc = initializeLotteryContract(web3)
        setLotteryContract(lc)
        const owner = await lc.methods.owner().call()
        setIsOwner(owner == accounts[0])

        window.ethereum.on('accountsChanged', async () => {
          const accounts = await web3.eth.getAccounts()
          setAddress(accounts[0])
          setIsOwner(owner == accounts[0])
        })
      } catch(err) {
        setError(err.message)
      }
    } else {
      setError("Please install MetaMask")
    }
  }


  return (
    <div>
      <Head>
        <title>Ether Lottery</title>
        <meta name="description" content="An Ethereum Lottery dApp" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Oswald&family=Quicksand:wght@500&display=swap" rel="stylesheet" />
      </Head>

      <main className={styles.main}>
        <div className={styles.nav}>
          <button className={styles.headerButton} onClick={connectWalletHandler}>Connect Wallet</button>
        </div>
        <div className={styles.content}>
            { 
              (address) &&
                <div className={styles.container}>
                  <h1 className={styles.light}>ETHEREUM LOTTERY</h1>
                  <h2 className={styles.light}>POT</h2>
                  <h2 className={styles.light}>{lotteryPot} ETHER</h2>
                  <button className={styles.button} onClick={enterLotteryHandler}>Play now</button>
                  <p>{error}</p>
                </div>
            }
            {
                (!address) &&
                <div className={styles.container}>
                  <h1 className={styles.light}>ETHEREUM LOTTERY</h1>
                  <p>Welcome to an ethereum lottery dapp. Please connect your wallet to get started.</p>
                  <button className={styles.button} onClick={connectWalletHandler}>Connect Wallet</button>
                  <p>{error}</p>
                </div>
            }
          {isOwner &&
          <div className={styles.row}>
            <div className={styles.container}>
              <h3 className={styles.light}>Past Winners</h3>
              <button className={styles.button} onClick={pickWinnerHandler}>Pick Winner</button>
              {
                (lotteryHistory && lotteryHistory.length > 0) && lotteryHistory.map(item => {
                  if (lotteryId != item.id) {
                    return <div className="history-entry mt-3" key={item.id}>
                      <div>Lottery #{item.id} winner:</div>
                      <div>
                        <p>{item.address}</p>
                      </div>
                    </div>
                  }
                })
              }
            </div>
            <div className={styles.container}>
              <h3 className={styles.light}>Current Players in Pool</h3>
              {
                (lotteryPlayers && lotteryPlayers.length > 0) && lotteryPlayers.map((player, index) => {
                  return <li key={`${player}-${index}`}>
                    {player}
                  </li>
                })
              }
              </div>
            </div>
          }
        </div>
      </main>
    </div>
  )
}