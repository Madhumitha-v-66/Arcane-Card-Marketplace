// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {Script} from "forge-std/Script.sol";
import {GameCard} from "../contracts/GameCard.sol";
import {CardMarketplace} from "../contracts/CardMarketplace.sol";

contract Deploy is Script {
    function run() external returns (GameCard card, CardMarketplace marketplace) {
        vm.startBroadcast();
        card = new GameCard();
        marketplace = new CardMarketplace(address(card));
        vm.stopBroadcast();
    }
}
