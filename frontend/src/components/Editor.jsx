import React, { useState, useEffect } from 'react';
import MonacoEditor, { useMonaco } from '@monaco-editor/react';
import { ethers } from 'ethers';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Editor({ state, account }) {
  const [sourceCode, setSourceCode] = useState(`// Solidity code here`);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [ipfsUrl, setIpfUrl] = useState(null);
  const monaco = useMonaco();
  const { contract } = state;

  useEffect(() => {
    if (monaco) {
      monaco.languages.register({ id: 'solidity' });
      monaco.languages.setMonarchTokensProvider('solidity', {
        keywords: [
          'pragma', 'solidity', 'contract', 'function', 'returns', 'mapping', 'struct', 'address',
          'bool', 'int', 'uint', 'string', 'public', 'private', 'pure', 'view', 'payable', 'return'
        ],
        operators: ['=', '>', '<', '!', '==', '!=', '&&', '||', '+', '-', '*', '/', '&', '|', '^', '%'],
        symbols: /[=><!~?:&|+\-*/^%]+/,
        tokenizer: {
          root: [
            [/[a-zA-Z_$][\w$]*/, {
              cases: {
                '@keywords': 'keyword',
                '@default': 'identifier'
              }
            }],
            { include: '@whitespace' },
            [/[{}()\[\]]/, '@brackets'],
            [/@symbols/, {
              cases: {
                '@operators': 'operator',
                '@default': ''
              }
            }],
            [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
            [/\d+/, 'number'],
            [/[;,.]/, 'delimiter'],
            [/".*"/, 'string'],
          ],
          whitespace: [
            [/[ \t\r\n]+/, ''],
            [/\/\*\*(?!\/)/, 'comment.doc', '@doccomment'],
            [/\/\*/, 'comment', '@comment'],
            [/\/\/.*$/, 'comment'],
          ],
          comment: [
            [/[^\/*]+/, 'comment'],
            [/\*\//, 'comment', '@pop'],
            [/[\/*]/, 'comment']
          ],
          doccomment: [
            [/[^\/*]+/, 'comment.doc'],
            [/\*\//, 'comment.doc', '@pop'],
            [/[\/*]/, 'comment.doc']
          ]
        }
      });
    }
  }, [monaco]);

  const downloadContract = () => {
    const blob = new Blob([sourceCode], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'contract.sol';
    link.click();
  };

  const uploadToIPFS = async () => {
    const formData = new FormData();
    formData.append('file', new Blob([sourceCode], { type: 'text/plain' }));

    try {
      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'pinata_api_key': '35cb1bf7be19d2a8fa0d',
          'pinata_secret_api_key': '2c2e9e43bca7a619154cb48e8b060c5643ea6220d0b7c9deb565fa491b3b3a50'
        }
      });

      // Get the IPFS hash from the response
      const ipfsHash = response.data.IpfsHash;

      // Construct the full IPFS URL
      const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`;

      return ipfsUrl; // Return the proper IPFS URL
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error('Failed to upload to IPFS');
    }
  };

  const handleMintContract = async () => {
    downloadContract();
    const ipfsUrl = await uploadToIPFS();
    setIpfUrl(ipfsUrl);

    // Log success message for file upload
    console.log('File uploaded successfully to IPFS!', ipfsUrl);

    // Show form for entering name and description
    setIsFormVisible(true);
  };

  const handleSubmit = async () => {
    if (!name || !description) {
      console.error('Enter a name and description for the contract.');
      return; // No need to show toast
    }

    try {
      const { contract } = state;
      if (!contract) throw new Error("Contract not connected");
      console.log('Contract Instance:', contract);

      const tx = await contract.mintContractNFT(name, description, ipfsUrl);
      await tx.wait();
      setConsoleOutput(`NFT minted with IPFS URL: ${ipfsUrl}`);

      // Log success message for minting
      console.log('NFT minted successfully!', ipfsUrl);

      // Clear form fields
      setName('');
      setDescription('');
      setIsFormVisible(false);
    } catch (error) {
      setConsoleOutput(`Minting error: ${error.message}`);
      console.error(`Minting error: ${error.message}`);
    }
  };

  const compileContract = () => {
    setConsoleOutput('Compilation process started...');
    console.log('Compilation process started...');
  };

  return (
    <div style={styles.container}>
      <ToastContainer />
      <h1>Solidity Editor</h1>
      <MonacoEditor
        height="400px"
        language="solidity"
        theme="vs-dark"
        value={sourceCode}
        onChange={(value) => setSourceCode(value)}
      />
      <div style={styles.controls}>
        <button onClick={compileContract} style={styles.button}>Compile</button>
        <button onClick={handleMintContract} style={styles.button}>Mint Contract</button>
      </div>
      {isFormVisible && (
        <div style={styles.formContainer}>
          <input
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleSubmit} style={styles.button}>Submit</button>
        </div>
      )}
      <pre style={styles.console}>{consoleOutput}</pre>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick draggable pauseOnHover />
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  controls: { marginTop: '10px', display: 'flex', gap: '10px' },
  button: { padding: '8px 12px', fontSize: '14px', cursor: 'pointer' },
  console: {
    marginTop: '10px',
    width: '80%',
    backgroundColor: 'white',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    whiteSpace: 'pre-wrap',
    overflow: 'auto'
  },
  formContainer: { display: 'flex', flexDirection: 'column', marginTop: '10px' },
  input: {
    padding: '8px',
    margin: '5px 0',
    width: '80%',
    borderRadius: '4px',
    border: '1px solid #ccc'
  }
};

export default Editor;
