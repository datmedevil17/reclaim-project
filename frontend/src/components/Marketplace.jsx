import React, { useState, useEffect } from 'react';
import { FaFileAlt } from 'react-icons/fa';
import {ethers} from  'ethers'

function Marketplace({ state, account }) {
  const [nfts, setNfts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { contract } = state;

  const fetchNfts = async () => {
    try {
      const count = await contract.nextTokenId();
      const nftData = [];
      for (let index = 1; index <= count; index++) {
        const nft = await contract.getContractNFT(index - 1);
        const ipfsUrl = nft.ipfsUrl.startsWith('ipfs://')
          ? `https://ipfs.io/ipfs/${nft.ipfsUrl.slice(7)}`
          : nft.ipfsUrl;

        nftData.push({
          tokenId: nft.tokenId,
          name: nft.name,
          description: nft.description,
          ipfsUrl,
          totalDonations: nft.totalDonations,
          owner: nft.owner,
        });
      }
      setNfts(nftData);
      console.log("Fetched NFTs:", nftData);
    } catch (error) {
      console.error("Failed to fetch NFTs:", error);
    }
  };

  useEffect(() => {
    if (contract) fetchNfts();
  }, [contract]);

  const handleDonateAndDownload = async (nft) => {
    try {
      const donationAmount = ethers.parseEther('0.0001');
      const tx = await contract.donateAndDownload(nft.tokenId, { value: donationAmount });
      await tx.wait();

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = nft.ipfsUrl; // Set the file URL
      link.target = '_blank'; // Open in new tab
      link.download = ''; // This will trigger the download

      // Append to body, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };


  const filteredNfts = nfts.filter(nft =>
    nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nft.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-6">Marketplace</h1>
      <p className="text-center text-lg mb-8">
        {account ? "Explore the marketplace and make transactions." : "Please connect your wallet to view the marketplace."}
      </p>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search NFTs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-lg p-2 w-full"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredNfts.length > 0 ? (
          filteredNfts.map((nft) => (
            <div key={nft.tokenId} className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-t-lg">
                <FaFileAlt className="text-gray-500 text-6xl" />
              </div>
              <div className="px-6 py-4">
                <h2 className="font-bold text-xl text-black mb-2">{nft.name}</h2>
                <p className="text-black text-sm mb-4">{nft.description}</p>
                <p className="text-black text-xs font-bold">{nft.owner.slice(0, 6) + '...' + nft.owner.slice(-4)}</p>
              </div>
              <div className="px-6 pb-4 flex justify-between items-center">
                <p className="text-black text-xs">Token ID: {Number(nft.tokenId) + 1}</p>
                <p className="text-black text-xs">Donations: {ethers.formatEther(nft.totalDonations)} ETH</p>
              </div>
              <div className="px-6 pb-4 text-center">
                <button
                  onClick={() => handleDonateAndDownload(nft)}
                  className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-full hover:bg-blue-600 transition duration-300"
                >
                  Download File
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-black col-span-full">No NFTs found in the marketplace.</p>
        )}
      </div>
    </div>
  );
}

export default Marketplace;
