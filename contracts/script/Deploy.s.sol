// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MembershipNFT.sol";

contract DeployMembershipNFT is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        address paymentToken = vm.envAddress("PAYMENT_TOKEN");
        address treasury = vm.envAddress("TREASURY");
        uint256 pricePerYearZil = vm.envUint("PRICE_ZIL");
        uint256 pricePerYearToken = vm.envUint("PRICE_TOKEN");

        uint256[] memory discountTiers = new uint256[](5);
        discountTiers[0] = 0;
        discountTiers[1] = 1000;
        discountTiers[2] = 1500;
        discountTiers[3] = 2000;
        discountTiers[4] = 2500;

        string memory svgImage = vm.envOr(
            "SVG_IMAGE",
            string('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#1a1a2e"/><text x="50" y="55" text-anchor="middle" fill="#fff" font-size="12">ZilStream</text></svg>')
        );

        vm.startBroadcast(deployerPrivateKey);

        MembershipNFT nft = new MembershipNFT(
            "ZilStream Membership",
            "ZILM",
            pricePerYearZil,
            pricePerYearToken,
            paymentToken,
            treasury,
            discountTiers,
            5,
            svgImage
        );

        vm.stopBroadcast();

        console.log("MembershipNFT deployed at:", address(nft));
    }
}
