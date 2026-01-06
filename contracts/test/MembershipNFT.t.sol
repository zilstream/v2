// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MembershipNFT.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MOCK") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract MembershipNFTTest is Test {
    MembershipNFT public nft;
    MockERC20 public token;

    address public owner = address(this);
    address public treasury = address(0x1234);
    address public user1 = address(0x5678);
    address public user2 = address(0x9ABC);

    uint256 public priceZil = 1000 ether;
    uint256 public priceToken = 100 * 1e18;
    uint256[] public discountTiers;
    string public svgImage = '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="blue"/></svg>';

    function setUp() public {
        token = new MockERC20();

        discountTiers = new uint256[](5);
        discountTiers[0] = 0;
        discountTiers[1] = 1000;
        discountTiers[2] = 1500;
        discountTiers[3] = 2000;
        discountTiers[4] = 2500;

        nft = new MembershipNFT(
            "ZilStream Membership",
            "ZILM",
            priceZil,
            priceToken,
            address(token),
            treasury,
            discountTiers,
            5,
            svgImage
        );

        vm.deal(user1, 100000 ether);
        vm.deal(user2, 100000 ether);
        token.mint(user1, 10000 * 1e18);
        token.mint(user2, 10000 * 1e18);
    }

    function test_Constructor() public view {
        assertEq(nft.name(), "ZilStream Membership");
        assertEq(nft.symbol(), "ZILM");
        assertEq(nft.pricePerYearZil(), priceZil);
        assertEq(nft.pricePerYearToken(), priceToken);
        assertEq(address(nft.paymentToken()), address(token));
        assertEq(nft.treasury(), treasury);
        assertEq(nft.maxYears(), 5);
        assertEq(nft.svgImage(), svgImage);
    }

    function test_CalculatePriceZil_NoDiscount() public view {
        uint256 price = nft.calculatePriceZil(1);
        assertEq(price, priceZil);
    }

    function test_CalculatePriceZil_WithDiscount() public view {
        uint256 price2yr = nft.calculatePriceZil(2);
        assertEq(price2yr, 2 * priceZil * 9000 / 10000);

        uint256 price3yr = nft.calculatePriceZil(3);
        assertEq(price3yr, 3 * priceZil * 8500 / 10000);

        uint256 price5yr = nft.calculatePriceZil(5);
        assertEq(price5yr, 5 * priceZil * 7500 / 10000);
    }

    function test_PurchaseWithZil() public {
        uint256 treasuryBalanceBefore = treasury.balance;
        uint256 price = nft.calculatePriceZil(1);

        vm.prank(user1);
        uint256 tokenId = nft.purchaseWithZil{value: price}(1, price);

        assertEq(tokenId, 1);
        assertEq(nft.ownerOf(1), user1);
        assertEq(nft.membershipExpiry(1), block.timestamp + 365 days);
        assertEq(treasury.balance, treasuryBalanceBefore + price);
    }

    function test_PurchaseWithZil_MultiYear() public {
        uint256 price = nft.calculatePriceZil(3);

        vm.prank(user1);
        uint256 tokenId = nft.purchaseWithZil{value: price}(3, price);

        assertEq(tokenId, 1);
        assertEq(nft.membershipExpiry(1), block.timestamp + 3 * 365 days);
    }

    function test_PurchaseWithZil_RefundsExcess() public {
        uint256 price = nft.calculatePriceZil(1);
        uint256 excess = 100 ether;
        uint256 user1BalanceBefore = user1.balance;

        vm.prank(user1);
        nft.purchaseWithZil{value: price + excess}(1, price + excess);

        assertEq(user1.balance, user1BalanceBefore - price);
    }

    function test_PurchaseWithZil_RevertInsufficientPayment() public {
        uint256 price = nft.calculatePriceZil(1);

        vm.prank(user1);
        vm.expectRevert(MembershipNFT.InsufficientPayment.selector);
        nft.purchaseWithZil{value: price - 1}(1, price);
    }

    function test_PurchaseWithZil_RevertPriceExceedsMax() public {
        uint256 price = nft.calculatePriceZil(1);

        vm.prank(user1);
        vm.expectRevert(MembershipNFT.PriceExceedsMax.selector);
        nft.purchaseWithZil{value: price}(1, price - 1);
    }

    function test_PurchaseWithZil_RevertInvalidYears() public {
        vm.prank(user1);
        vm.expectRevert(MembershipNFT.InvalidYears.selector);
        nft.purchaseWithZil{value: 10000 ether}(0, 10000 ether);

        vm.prank(user1);
        vm.expectRevert(MembershipNFT.InvalidYears.selector);
        nft.purchaseWithZil{value: 10000 ether}(6, 10000 ether);
    }

    function test_PurchaseWithToken() public {
        uint256 price = nft.calculatePriceToken(1);

        vm.startPrank(user1);
        token.approve(address(nft), price);
        uint256 tokenId = nft.purchaseWithToken(1, price);
        vm.stopPrank();

        assertEq(tokenId, 1);
        assertEq(nft.ownerOf(1), user1);
        assertEq(nft.membershipExpiry(1), block.timestamp + 365 days);
        assertEq(token.balanceOf(treasury), price);
    }

    function test_RenewWithZil_ActiveMembership() public {
        uint256 price1yr = nft.calculatePriceZil(1);

        vm.prank(user1);
        uint256 tokenId = nft.purchaseWithZil{value: price1yr}(1, price1yr);

        uint256 initialExpiry = nft.membershipExpiry(tokenId);

        vm.prank(user2);
        nft.renewWithZil{value: price1yr}(tokenId, 1, price1yr);

        assertEq(nft.membershipExpiry(tokenId), initialExpiry + 365 days);
    }

    function test_RenewWithZil_ExpiredMembership() public {
        uint256 price1yr = nft.calculatePriceZil(1);

        vm.prank(user1);
        uint256 tokenId = nft.purchaseWithZil{value: price1yr}(1, price1yr);

        vm.warp(block.timestamp + 400 days);

        vm.prank(user2);
        nft.renewWithZil{value: price1yr}(tokenId, 1, price1yr);

        assertEq(nft.membershipExpiry(tokenId), block.timestamp + 365 days);
    }

    function test_RenewWithToken() public {
        uint256 priceZilAmount = nft.calculatePriceZil(1);
        uint256 priceTokenAmount = nft.calculatePriceToken(1);

        vm.prank(user1);
        uint256 tokenId = nft.purchaseWithZil{value: priceZilAmount}(1, priceZilAmount);

        uint256 initialExpiry = nft.membershipExpiry(tokenId);

        vm.startPrank(user2);
        token.approve(address(nft), priceTokenAmount);
        nft.renewWithToken(tokenId, 1, priceTokenAmount);
        vm.stopPrank();

        assertEq(nft.membershipExpiry(tokenId), initialExpiry + 365 days);
    }

    function test_IsMembershipActive() public {
        uint256 price = nft.calculatePriceZil(1);

        vm.prank(user1);
        uint256 tokenId = nft.purchaseWithZil{value: price}(1, price);

        assertTrue(nft.isMembershipActive(tokenId));

        vm.warp(block.timestamp + 366 days);

        assertFalse(nft.isMembershipActive(tokenId));
    }

    function test_RemainingMembership() public {
        uint256 price = nft.calculatePriceZil(1);

        vm.prank(user1);
        uint256 tokenId = nft.purchaseWithZil{value: price}(1, price);

        assertEq(nft.remainingMembership(tokenId), 365 days);

        vm.warp(block.timestamp + 100 days);

        assertEq(nft.remainingMembership(tokenId), 265 days);

        vm.warp(block.timestamp + 300 days);

        assertEq(nft.remainingMembership(tokenId), 0);
    }

    function test_HasActiveMembership() public {
        assertFalse(nft.hasActiveMembership(user1));

        uint256 price = nft.calculatePriceZil(1);
        vm.prank(user1);
        nft.purchaseWithZil{value: price}(1, price);

        assertTrue(nft.hasActiveMembership(user1));

        vm.warp(block.timestamp + 366 days);

        assertFalse(nft.hasActiveMembership(user1));
    }

    function test_TokenURI() public {
        uint256 price = nft.calculatePriceZil(1);

        vm.prank(user1);
        uint256 tokenId = nft.purchaseWithZil{value: price}(1, price);

        string memory uri = nft.tokenURI(tokenId);
        assertTrue(bytes(uri).length > 0);
        assertTrue(_startsWith(uri, "data:application/json;base64,"));
    }

    function test_Transfer() public {
        uint256 price = nft.calculatePriceZil(1);

        vm.prank(user1);
        uint256 tokenId = nft.purchaseWithZil{value: price}(1, price);

        vm.prank(user1);
        nft.transferFrom(user1, user2, tokenId);

        assertEq(nft.ownerOf(tokenId), user2);
        assertTrue(nft.hasActiveMembership(user2));
        assertFalse(nft.hasActiveMembership(user1));
    }

    function test_SetPriceZil() public {
        uint256 newPrice = 2000 ether;
        nft.setPriceZil(newPrice);
        assertEq(nft.pricePerYearZil(), newPrice);
    }

    function test_SetPriceToken() public {
        uint256 newPrice = 200 * 1e18;
        nft.setPriceToken(newPrice);
        assertEq(nft.pricePerYearToken(), newPrice);
    }

    function test_SetPaymentToken() public {
        MockERC20 newToken = new MockERC20();
        nft.setPaymentToken(address(newToken));
        assertEq(address(nft.paymentToken()), address(newToken));
    }

    function test_SetTreasury() public {
        address newTreasury = address(0xDEAD);
        nft.setTreasury(newTreasury);
        assertEq(nft.treasury(), newTreasury);
    }

    function test_SetDiscountTiers() public {
        uint256[] memory newTiers = new uint256[](3);
        newTiers[0] = 0;
        newTiers[1] = 500;
        newTiers[2] = 1000;

        nft.setDiscountTiers(newTiers);

        uint256[] memory tiers = nft.getDiscountTiers();
        assertEq(tiers.length, 3);
        assertEq(tiers[1], 500);
    }

    function test_SetMaxYears() public {
        nft.setMaxYears(10);
        assertEq(nft.maxYears(), 10);
    }

    function test_SetSvgImage() public {
        string memory newSvg = '<svg><circle/></svg>';
        nft.setSvgImage(newSvg);
        assertEq(nft.svgImage(), newSvg);
    }

    function test_OnlyOwnerCanSetPrice() public {
        vm.prank(user1);
        vm.expectRevert();
        nft.setPriceZil(2000 ether);
    }

    function test_OnlyOwnerCanSetTreasury() public {
        vm.prank(user1);
        vm.expectRevert();
        nft.setTreasury(address(0xDEAD));
    }

    function _startsWith(string memory str, string memory prefix) internal pure returns (bool) {
        bytes memory strBytes = bytes(str);
        bytes memory prefixBytes = bytes(prefix);

        if (strBytes.length < prefixBytes.length) {
            return false;
        }

        for (uint256 i = 0; i < prefixBytes.length; i++) {
            if (strBytes[i] != prefixBytes[i]) {
                return false;
            }
        }

        return true;
    }
}
