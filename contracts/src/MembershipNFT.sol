// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MembershipNFT is ERC721, Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Strings for uint256;

    uint256 public constant YEAR_DURATION = 365 days;
    uint256 public constant BASIS_POINTS = 10000;

    mapping(uint256 => uint256) public membershipExpiry;

    uint256 public pricePerYearZil;
    uint256 public pricePerYearToken;
    IERC20 public paymentToken;
    address public treasury;
    uint256[] public discountTiers;
    uint256 public maxYears;
    string public svgImage;

    uint256 private _nextTokenId;

    event MembershipPurchased(
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 numYears,
        uint256 expiresAt,
        bool paidWithZil,
        uint256 amountPaid
    );

    event MembershipRenewed(
        uint256 indexed tokenId,
        address indexed payer,
        uint256 numYears,
        uint256 newExpiresAt,
        bool paidWithZil,
        uint256 amountPaid
    );

    event PriceZilUpdated(uint256 oldPrice, uint256 newPrice);
    event PriceTokenUpdated(uint256 oldPrice, uint256 newPrice);
    event PaymentTokenUpdated(address oldToken, address newToken);
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    event DiscountTiersUpdated(uint256[] newTiers);
    event MaxYearsUpdated(uint256 oldMax, uint256 newMax);
    event SvgImageUpdated();

    error InvalidYears();
    error InvalidPrice();
    error InvalidTreasury();
    error InvalidPaymentToken();
    error InsufficientPayment();
    error PaymentFailed();
    error TokenDoesNotExist();
    error PriceExceedsMax();

    constructor(
        string memory name,
        string memory symbol,
        uint256 _pricePerYearZil,
        uint256 _pricePerYearToken,
        address _paymentToken,
        address _treasury,
        uint256[] memory _discountTiers,
        uint256 _maxYears,
        string memory _svgImage
    ) ERC721(name, symbol) Ownable(msg.sender) {
        if (_pricePerYearZil == 0) revert InvalidPrice();
        if (_pricePerYearToken == 0) revert InvalidPrice();
        if (_paymentToken == address(0)) revert InvalidPaymentToken();
        if (_treasury == address(0)) revert InvalidTreasury();
        if (_maxYears == 0) revert InvalidYears();

        pricePerYearZil = _pricePerYearZil;
        pricePerYearToken = _pricePerYearToken;
        paymentToken = IERC20(_paymentToken);
        treasury = _treasury;
        discountTiers = _discountTiers;
        maxYears = _maxYears;
        svgImage = _svgImage;
        _nextTokenId = 1;
    }

    function purchaseWithZil(uint256 numYears, uint256 maxPrice) external payable nonReentrant returns (uint256 tokenId) {
        if (numYears == 0 || numYears > maxYears) revert InvalidYears();

        uint256 price = calculatePriceZil(numYears);
        if (price > maxPrice) revert PriceExceedsMax();
        if (msg.value < price) revert InsufficientPayment();

        tokenId = _nextTokenId++;
        uint256 expiresAt = block.timestamp + (numYears * YEAR_DURATION);
        membershipExpiry[tokenId] = expiresAt;

        _safeMint(msg.sender, tokenId);

        (bool success,) = treasury.call{value: price}("");
        if (!success) revert PaymentFailed();

        if (msg.value > price) {
            (bool refundSuccess,) = msg.sender.call{value: msg.value - price}("");
            if (!refundSuccess) revert PaymentFailed();
        }

        emit MembershipPurchased(tokenId, msg.sender, numYears, expiresAt, true, price);
    }

    function purchaseWithToken(uint256 numYears, uint256 maxPrice) external nonReentrant returns (uint256 tokenId) {
        if (numYears == 0 || numYears > maxYears) revert InvalidYears();

        uint256 price = calculatePriceToken(numYears);
        if (price > maxPrice) revert PriceExceedsMax();

        tokenId = _nextTokenId++;
        uint256 expiresAt = block.timestamp + (numYears * YEAR_DURATION);
        membershipExpiry[tokenId] = expiresAt;

        _safeMint(msg.sender, tokenId);

        paymentToken.safeTransferFrom(msg.sender, treasury, price);

        emit MembershipPurchased(tokenId, msg.sender, numYears, expiresAt, false, price);
    }

    function renewWithZil(uint256 tokenId, uint256 numYears, uint256 maxPrice) external payable nonReentrant {
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist();
        if (numYears == 0 || numYears > maxYears) revert InvalidYears();

        uint256 price = calculatePriceZil(numYears);
        if (price > maxPrice) revert PriceExceedsMax();
        if (msg.value < price) revert InsufficientPayment();

        uint256 currentExpiry = membershipExpiry[tokenId];
        uint256 startTime = currentExpiry > block.timestamp ? currentExpiry : block.timestamp;
        uint256 newExpiresAt = startTime + (numYears * YEAR_DURATION);
        membershipExpiry[tokenId] = newExpiresAt;

        (bool success,) = treasury.call{value: price}("");
        if (!success) revert PaymentFailed();

        if (msg.value > price) {
            (bool refundSuccess,) = msg.sender.call{value: msg.value - price}("");
            if (!refundSuccess) revert PaymentFailed();
        }

        emit MembershipRenewed(tokenId, msg.sender, numYears, newExpiresAt, true, price);
    }

    function renewWithToken(uint256 tokenId, uint256 numYears, uint256 maxPrice) external nonReentrant {
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist();
        if (numYears == 0 || numYears > maxYears) revert InvalidYears();

        uint256 price = calculatePriceToken(numYears);
        if (price > maxPrice) revert PriceExceedsMax();

        uint256 currentExpiry = membershipExpiry[tokenId];
        uint256 startTime = currentExpiry > block.timestamp ? currentExpiry : block.timestamp;
        uint256 newExpiresAt = startTime + (numYears * YEAR_DURATION);
        membershipExpiry[tokenId] = newExpiresAt;

        paymentToken.safeTransferFrom(msg.sender, treasury, price);

        emit MembershipRenewed(tokenId, msg.sender, numYears, newExpiresAt, false, price);
    }

    function calculatePriceZil(uint256 numYears) public view returns (uint256) {
        return _calculatePrice(pricePerYearZil, numYears);
    }

    function calculatePriceToken(uint256 numYears) public view returns (uint256) {
        return _calculatePrice(pricePerYearToken, numYears);
    }

    function _calculatePrice(uint256 basePrice, uint256 numYears) internal view returns (uint256) {
        if (numYears == 0 || numYears > maxYears) revert InvalidYears();

        uint256 tierIndex = numYears - 1;
        uint256 discount = tierIndex < discountTiers.length ? discountTiers[tierIndex] :
            (discountTiers.length > 0 ? discountTiers[discountTiers.length - 1] : 0);

        uint256 fullPrice = basePrice * numYears;
        uint256 discountAmount = (fullPrice * discount) / BASIS_POINTS;

        return fullPrice - discountAmount;
    }

    function isMembershipActive(uint256 tokenId) external view returns (bool) {
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist();
        return membershipExpiry[tokenId] > block.timestamp;
    }

    function remainingMembership(uint256 tokenId) external view returns (uint256) {
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist();
        uint256 expiry = membershipExpiry[tokenId];
        return expiry > block.timestamp ? expiry - block.timestamp : 0;
    }

    function hasActiveMembership(address account) external view returns (bool) {
        uint256 balance = balanceOf(account);
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = _findTokenByIndex(account, i);
            if (membershipExpiry[tokenId] > block.timestamp) {
                return true;
            }
        }
        return false;
    }

    function _findTokenByIndex(address owner, uint256 index) internal view returns (uint256) {
        uint256 count = 0;
        for (uint256 tokenId = 1; tokenId < _nextTokenId; tokenId++) {
            if (_ownerOf(tokenId) == owner) {
                if (count == index) {
                    return tokenId;
                }
                count++;
            }
        }
        revert TokenDoesNotExist();
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist();

        uint256 expiry = membershipExpiry[tokenId];
        bool isActive = expiry > block.timestamp;
        string memory status = isActive ? "Active" : "Expired";

        string memory json = string(
            abi.encodePacked(
                '{"name":"ZilStream Membership #',
                tokenId.toString(),
                '","description":"ZilStream membership NFT with time-based subscription.","image":"data:image/svg+xml;base64,',
                Base64.encode(bytes(svgImage)),
                '","attributes":[{"trait_type":"Expiration","display_type":"date","value":',
                expiry.toString(),
                '},{"trait_type":"Status","value":"',
                status,
                '"}]}'
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }

    function getDiscountTiers() external view returns (uint256[] memory) {
        return discountTiers;
    }

    function setPriceZil(uint256 newPrice) external onlyOwner {
        if (newPrice == 0) revert InvalidPrice();
        emit PriceZilUpdated(pricePerYearZil, newPrice);
        pricePerYearZil = newPrice;
    }

    function setPriceToken(uint256 newPrice) external onlyOwner {
        if (newPrice == 0) revert InvalidPrice();
        emit PriceTokenUpdated(pricePerYearToken, newPrice);
        pricePerYearToken = newPrice;
    }

    function setPaymentToken(address newToken) external onlyOwner {
        if (newToken == address(0)) revert InvalidPaymentToken();
        emit PaymentTokenUpdated(address(paymentToken), newToken);
        paymentToken = IERC20(newToken);
    }

    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert InvalidTreasury();
        emit TreasuryUpdated(treasury, newTreasury);
        treasury = newTreasury;
    }

    function setDiscountTiers(uint256[] calldata newTiers) external onlyOwner {
        discountTiers = newTiers;
        emit DiscountTiersUpdated(newTiers);
    }

    function setMaxYears(uint256 newMaxYears) external onlyOwner {
        if (newMaxYears == 0) revert InvalidYears();
        emit MaxYearsUpdated(maxYears, newMaxYears);
        maxYears = newMaxYears;
    }

    function setSvgImage(string calldata newSvgImage) external onlyOwner {
        svgImage = newSvgImage;
        emit SvgImageUpdated();
    }
}
