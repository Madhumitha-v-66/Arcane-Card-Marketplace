// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract GameCard is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId = 1;

    event CardMinted(address indexed owner, uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("Arcane Game Cards", "ARC") Ownable(msg.sender) {}

    function mint(string calldata metadataURI) external returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);
        emit CardMinted(msg.sender, tokenId, metadataURI);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721URIStorage) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId)
        public view override(ERC721URIStorage) returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
