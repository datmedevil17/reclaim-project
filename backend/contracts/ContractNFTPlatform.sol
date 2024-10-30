// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ContractNFTPlatform is ERC721URIStorage, Ownable {
    struct ContractNFT {
        uint256 tokenId;
        string name;
        string description;
        string ipfsUrl; // IPFS URL for the .sol file
        uint256 totalDonations; // Total Ether donated
        address payable owner; // Owner of the NFT
    }

    uint256 public nextTokenId=0;
    mapping(uint256 => ContractNFT) public contractNFTs; // Mapping from tokenId to ContractNFT

    event ContractMinted(uint256 indexed tokenId, address indexed owner, string ipfsUrl);
    event DonationReceived(uint256 indexed tokenId, address indexed donor, uint256 amount);

    constructor() ERC721("ContractNFTPlatform", "CNT") Ownable(msg.sender){}

    // Function to mint a new contract NFT
    function mintContractNFT(string memory _name, string memory _description, string memory _ipfsUrl) public {
        uint256 tokenId = nextTokenId;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _ipfsUrl);

        contractNFTs[tokenId] = ContractNFT({
            tokenId: tokenId,
            name: _name,
            description: _description,
            ipfsUrl: _ipfsUrl,
            totalDonations: 0,
            owner: payable(msg.sender)
        });

        nextTokenId++;
        emit ContractMinted(tokenId, msg.sender, _ipfsUrl);
    }

    // Function to donate Ether to the owner and get access to the contract .sol file
    function donateAndDownload(uint256 _tokenId) public payable {
        require(_tokenId<nextTokenId, "NFT does not exist");
        require(msg.value > 0, "Donation must be greater than zero");

        ContractNFT storage contractNFT = contractNFTs[_tokenId];
        contractNFT.totalDonations += msg.value;

        // Transfer Ether to the NFT owner
        contractNFT.owner.transfer(msg.value);

        emit DonationReceived(_tokenId, msg.sender, msg.value);

        // You can return the IPFS URL here or use an off-chain system to provide access to the .sol file
    }

    // Function to get details of a specific NFT
    function getContractNFT(uint256 _tokenId) public view returns (
        uint256 tokenId,
        string memory name,
        string memory description,
        string memory ipfsUrl,
        uint256 totalDonations,
        address owner
    ) {
        require(_tokenId<nextTokenId, "NFT does not exist");

        ContractNFT storage contractNFT = contractNFTs[_tokenId];
        return (
            contractNFT.tokenId,
            contractNFT.name,
            contractNFT.description,
            contractNFT.ipfsUrl,
            contractNFT.totalDonations,
            contractNFT.owner
        );
    }
}
