import React, { useState, useEffect } from 'react';
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
import QRCode from 'react-qr-code';
import { ethers } from 'ethers';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Editor from './components/Editor';
import Marketplace from './components/Marketplace';
import Home from './components/Home';
import Discussion from './components/Discussion';
import abi from '../../backend/artifacts/contracts/ContractNFTPlatform.sol/ContractNFTPlatform.json';
import disAbi from  '../../backend/artifacts/contracts/Discussion.sol/Discussion.json'

function App() {
  const [reclaimProofRequest, setReclaimProofRequest] = useState(null);
  const [requestUrl, setRequestUrl] = useState('');
  const [state, setState] = useState({ provider: null, signer: null, contract: null, address: null });
  const [account, setAccount] = useState(null);
  const [isVerified, setIsVerified] = useState(false); // Track Reclaim verification status
  const [discussionContract,setDiscussionContract] = useState(null)

  useEffect(() => {
    async function initializeReclaim() {
      const APP_ID = "0xd02Be0fE85513A8Cb71Ac1e33F63Ba977c5c29D2"; // Your App ID
      const PROVIDER_ID = "6d3f6753-7ee6-49ee-a545-62f1b1822ae5"; // Your Provider ID
      const APP_SECRET = "0x818276ac95a7df7f78cbabfdd596caadd399b03fb88f7feba650f16d39d788c0"; // Your App Secret

      const proofRequest = await ReclaimProofRequest.init(APP_ID, APP_SECRET, PROVIDER_ID);
      setReclaimProofRequest(proofRequest);
    }

    initializeReclaim();
  }, []);

  const handleCreateClaim = async () => {
    if (!reclaimProofRequest) {
      alert('Reclaim Proof Request not initialized');
      return;
    }

    const url = await reclaimProofRequest.getRequestUrl();
    setRequestUrl(url);

    reclaimProofRequest.startSession({
      onSuccess: (proofs) => {
        setIsVerified(true); // Set verified status to true
        setRequestUrl(''); // Clear the request URL after verification
      },
      onFailure: (error) => {
        console.error('Verification failed:', error);
      },
    });
  };

  const connectWallet = async () => {
    const contractAddress = "0x9881D78E2373daCF76F3F6274034909E9f71141C";
    const discussionAddress = "0x9881D78E2373daCF76F3F6274034909E9f71141C";
    const contractABI = abi.abi;
    const discussionABI = disAbi.abi;


    if (!window.ethereum) {
      alert("Please install MetaMask to use this feature.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);

      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const discussionContract = new ethers.Contract(discussionAddress,discussionABI,signer)
      setDiscussionContract(discussionContract)
      setState({ provider, signer, contract, address });
      console.log("Connected to contract:", contract);
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      alert("Failed to connect wallet. Please check the console for details.");
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => window.location.reload());
      window.ethereum.on("accountsChanged", () => window.location.reload());
    }
  }, []);

  return (
    <Router>
      <Navbar connectWallet={connectWallet} state={state} account={account} />
      <div className="App">
        {/* <h1>Reclaim Protocol Demo</h1> */}
        {!isVerified ? (
          <div>
            {requestUrl &&           <div>  <h2>Scan this QR code to start the verification process:</h2>
                <QRCode value={requestUrl} /></div>}
            <button onClick={handleCreateClaim} disabled={requestUrl}>
              Verify GitHub Identity
            </button>
          </div>
        ) : (
          <>

            <Routes>
              <Route path="/" element={<Home state={state} account={account} />} />
              <Route path="/editor" element={<Editor state={state} account={account} />} />
              <Route path="/marketplace" element={<Marketplace state={state} account={account} />} />
              <Route path="/discussion" element={<Discussion discussionContract={discussionContract} account={account} />} />
            </Routes>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
