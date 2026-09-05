// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {Test} from "forge-std/Test.sol";
import {GameCard} from "../contracts/GameCard.sol";

contract GameCardTest is Test {
    GameCard card;
    address alice = address(0xA11CE);

    function setUp() public { card = new GameCard(); }

    function testMintCreatesUniqueSequentialIds() public {
        vm.startPrank(alice);
        uint256 id1 = card.mint("ipfs://one");
        uint256 id2 = card.mint("ipfs://two");
        vm.stopPrank();
        assertEq(id1, 1);
        assertEq(id2, 2);
        assertEq(card.ownerOf(1), alice);
        assertEq(card.tokenURI(2), "ipfs://two");
    }
}
