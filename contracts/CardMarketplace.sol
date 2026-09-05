// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CardMarketplace is ReentrancyGuard {
    struct Listing {
        address seller;
        uint256 price;
    }

    IERC721 public immutable card;
    mapping(uint256 => Listing) public listings;

    event Listed(address indexed seller, uint256 indexed tokenId, uint256 price);
    event SaleCancelled(address indexed seller, uint256 indexed tokenId);
    event Purchased(address indexed buyer, address indexed seller, uint256 indexed tokenId, uint256 price);

    constructor(address cardAddress) {
        card = IERC721(cardAddress);
    }

    function list(uint256 tokenId, uint256 price) external nonReentrant {
        require(price > 0, "price must be > 0");
        require(card.ownerOf(tokenId) == msg.sender, "not token owner");
        require(listings[tokenId].seller == address(0), "already listed");

        card.transferFrom(msg.sender, address(this), tokenId);
        listings[tokenId] = Listing({seller: msg.sender, price: price});
        emit Listed(msg.sender, tokenId, price);
    }

    function cancel(uint256 tokenId) external nonReentrant {
        Listing memory listing = listings[tokenId];
        require(listing.seller == msg.sender, "not seller");

        delete listings[tokenId];
        card.transferFrom(address(this), msg.sender, tokenId);
        emit SaleCancelled(msg.sender, tokenId);
    }

    function buy(uint256 tokenId) external payable nonReentrant {
        Listing memory listing = listings[tokenId];
        require(listing.seller != address(0), "not listed");
        require(msg.sender != listing.seller, "seller cannot buy");
        require(msg.value == listing.price, "incorrect price");

        delete listings[tokenId];
        card.transferFrom(address(this), msg.sender, tokenId);

        (bool paid,) = payable(listing.seller).call{value: msg.value}("");
        require(paid, "payment failed");
        emit Purchased(msg.sender, listing.seller, tokenId, msg.value);
    }
}
