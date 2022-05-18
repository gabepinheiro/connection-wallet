import { useEffect, useRef, useState } from 'react'
import { ethers, providers } from 'ethers'
import './App.css'

type Wallet = {
  address: string
  balance: string
}

interface Web3 extends ethers.providers.Web3Provider {}

function createWeb3Instance (): Web3 {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('window.ethereum is not set for MetaMask/web3.js')
  }

  return new providers.Web3Provider(window.ethereum)
}

async function getAddress(web3Instace: Web3) {
  const [address] = await web3Instace.send('eth_accounts', [])
  return address
}

function getBalance(address: string) {
  return async (web3Instace: Web3) => await web3Instace.getBalance(address)
}

function App() {
  const web3 = useRef<Web3>()
  const [wallet, setWallet] = useState<Wallet | null>(null)

  useEffect(() => {
    try {
      web3.current = createWeb3Instance()
    } catch (error) {
      if(error instanceof Error) {
        console.log(error.message)
      }
    }

    async function getWalletMetaMask(){
      if(typeof web3.current === 'undefined') return;

      const address = await getAddress(web3.current)
   
      if(wallet?.address !== address) {
        const balance = await getBalance(address)(web3.current)

        setWallet({
          address,
          balance: ethers.utils.formatUnits(balance)
        })
      }
    }
    
    getWalletMetaMask()
    
    function handleChangeAccount () {
      getWalletMetaMask()
    }
    
    function removeHandleChangeAccount () {
      window.ethereum.removeListener('accountsChanged', handleChangeAccount)
    }
    
    window.ethereum.on('accountsChanged', handleChangeAccount)
    return () => removeHandleChangeAccount()
  }, [wallet])

  useEffect(() => {
    function handleChangeNetwork () {
      web3.current = createWeb3Instance()
    }

    window.ethereum.on('chainChanged', handleChangeNetwork)

    return () => window.ethereum.removeListener('chainChanged', handleChangeNetwork)
  }, [])

  return (
    <div className="App">
      {wallet && (
        <>
          <h2>Address: {wallet.address}</h2>
          <h3>Balance: {wallet.balance}</h3>
        </>
      )}
    </div>
  )
}

export default App
