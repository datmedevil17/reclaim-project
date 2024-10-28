import React, { useState, useEffect } from 'react';
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
import QRCode from 'react-qr-code';
import { ethers } from 'ethers';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
// import abi from './path_to_abi.json'; // Import your contract ABI here

function App() {
  const [reclaimProofRequest, setReclaimProofRequest] = useState(null);
  const [requestUrl, setRequestUrl] = useState('');
  const [statusUrl, setStatusUrl] = useState('');
  const [proofs, setProofs] = useState(null);
  const [state, setState] = useState({
    provider: null,
    signer: null,
    address: null,
    contract: null,
  });

  const navigate = useNavigate();

  useEffect(() => {
    async function initializeReclaim() {
      const APP_ID = "0x9325902812cf0afF6F430CFD783cd4F08A0A5F62";
      const PROVIDER_ID = "6d3f6753-7ee6-49ee-a545-62f1b1822ae5";
      const APP_SECRET = '0xc93226a6f7d1c531c0121c1b93f748986eb8077b2ff525a0a64fbf838ff42808';

      const proofRequest = await ReclaimProofRequest.init(
        APP_ID,
        APP_SECRET,
        PROVIDER_ID
      );
      setReclaimProofRequest(proofRequest);
    }

    initializeReclaim();
  }, []);

  const connectWallet = async () => {
    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });
    window.ethereum.on("accountsChanged", () => {
      window.location.reload();
    });

    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("MetaMask is not installed");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      if (accounts.length === 0) {
        console.log("No account found");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const contract = null;

      setState({ provider, signer, contract, address });
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  };

  const handleCreateClaim = async () => {
    if (!reclaimProofRequest) {
      console.error('Reclaim Proof Request not initialized');
      return;
    }

    const url = await reclaimProofRequest.getRequestUrl();
    setRequestUrl(url);

    const status = reclaimProofRequest.getStatusUrl();
    setStatusUrl(status);
    console.log('Status URL:', status);

    await reclaimProofRequest.startSession({
      onSuccess: (proofs) => {
        if (proofs && typeof proofs !== 'string') {
          console.log('Proof received:', proofs?.claimData.context);
          setProofs(proofs.claimData.context); // Storing relevant proof data
          navigate('/terminal'); // Redirect to Terminal page
        }
      },
      onFailure: (error) => {
        console.error('Verification failed', error);
      },
    });
  };

  return (
    <div className="App">
      <h1>Reclaim Protocol Demo</h1>
      {!state.address ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <p>Wallet Connected: {state.address}</p>
          {!proofs ? (
            <>
              <button onClick={handleCreateClaim}>Verify GitHub Identity</button>
              {requestUrl && (
                <div>
                  <h2>Scan this QR code to start the verification process:</h2>
                  <QRCode value={requestUrl} />
                </div>
              )}
            </>
          ) : (
            <div>
              <h2>Verification Successful!</h2>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Terminal({ proofs }) {
  return (
    <div>
      <h2>Welcome to the Terminal Page</h2>
      {proofs ? (
        <div className="profile-card">
          <h3>GitHub Profile Details</h3>
          <p><strong>Username:</strong> {proofs.username}</p>
          <p><strong>Total Repositories:</strong> {proofs.repositories?.length}</p>
          <h4>Top Repository</h4>
          <p><strong>Repository Name:</strong> {proofs.repositories?.[0]?.name}</p>
          <p><strong>Stars:</strong> {proofs.repositories?.[0]?.stars}</p>
          <p><strong>Forks:</strong> {proofs.repositories?.[0]?.forks}</p>
        </div>
      ) : (
        <p>No proof data found. Please go back and verify.</p>
      )}
    </div>
  );
}

function Main() {
  const [proofs, setProofs] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<App setProofs={setProofs} />} />
        <Route path="/terminal" element={<Terminal proofs={proofs} />} />
      </Routes>
    </Router>
  );
}

export default Main;
