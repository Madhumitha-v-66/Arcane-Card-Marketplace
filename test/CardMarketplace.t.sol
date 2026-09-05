// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {Test} from "forge-std/Test.sol";
import {GameCard} from "../contracts/GameCard.sol";
import {CardMarketplace} from "../contracts/CardMarketplace.sol";

contract CardMarketplaceTest is Test {
    GameCard card;
    CardMarketplace market;
    address seller = address(0xBEEF);
    address buyer = address(0xCAFE);

    function setUp() public {
        card = new GameCard();
        market = new CardMarketplace(address(card));
        vm.prank(seller);
        card.mint("ipfs://card");
    }

    function testListEscrowsToken() public {
        vm.startPrank(seller);
        card.approve(address(market), 1);
        market.list(1, 1 ether);
        vm.stopPrank();
        assertEq(card.ownerOf(1), address(market));
        (address listedSeller, uint256 price) = market.listings(1);
        assertEq(listedSeller, seller);
        assertEq(price, 1 ether);
    }

    function testBuyTransfersCardAndPayment() public {
        vm.startPrank(seller);
        card.approve(address(market), 1);
        market.list(1, 1 ether);
        vm.stopPrank();
        vm.deal(buyer, 2 ether);
        uint256 beforeBalance = seller.balance;
        vm.prank(buyer);
        market.buy{value: 1 ether}(1);
        assertEq(card.ownerOf(1), buyer);
        assertEq(seller.balance, beforeBalance + 1 ether);
        (address listedSeller,) = market.listings(1);
        assertEq(listedSeller, address(0));
    }

    function testOnlySellerCanCancel() public {
        vm.startPrank(seller);
        card.approve(address(market), 1);
        market.list(1, 1 ether);
        vm.stopPrank();
        vm.expectRevert("not seller");
        vm.prank(buyer);
        market.cancel(1);
    }
}
