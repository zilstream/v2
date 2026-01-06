# ZilStream Membership NFT Contracts

Smart contracts for ZilStream membership NFTs on Zilliqa 2.0 (EVM).

## Overview

The `MembershipNFT` contract is an ERC-721 NFT that represents time-based memberships. Users can purchase memberships for 1-5 years with progressive discounts, paying in either native ZIL or a configured ERC20 token.

### Features

- **Time-based memberships**: Each NFT has an expiration timestamp
- **Dual payment options**: Pay with native ZIL or ERC20 (independent pricing)
- **Progressive discounts**: Longer subscriptions get better rates
- **Renewals**: Extend existing memberships (stacks on current expiry)
- **Fully transferable**: Standard ERC-721 transfers
- **On-chain metadata**: JSON + SVG stored entirely on-chain
- **Direct treasury payments**: Funds sent directly to treasury on purchase

### Discount Tiers (Default)

| Years | Discount |
|-------|----------|
| 1     | 0%       |
| 2     | 10%      |
| 3     | 15%      |
| 4     | 20%      |
| 5     | 25%      |

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- A funded wallet on Zilliqa 2.0

## Installation

```bash
# Install dependencies
forge install
```

## Build

```bash
forge build
```

## Test

```bash
# Run all tests
forge test

# Run with verbosity
forge test -vvv

# Run specific test
forge test --match-test test_PurchaseWithZil
```

## Deployment

### 1. Set Environment Variables

```bash
export PRIVATE_KEY=<your_private_key>
export PAYMENT_TOKEN=<erc20_token_address>
export TREASURY=<treasury_address>
export PRICE_ZIL=<price_per_year_in_wei>
export PRICE_TOKEN=<price_per_year_in_token_units>

# Optional: Custom SVG image
export SVG_IMAGE='<svg>...</svg>'
```

**Example pricing:**
- 1000 ZIL per year: `PRICE_ZIL=1000000000000000000000` (1000 * 10^18)
- 100 STREAM per year (18 decimals): `PRICE_TOKEN=100000000000000000000` (100 * 10^18)

### 2. Deploy to Testnet

```bash
forge script script/Deploy.s.sol \
  --rpc-url https://dev-api.zilliqa.com \
  --broadcast \
  --legacy
```

### 3. Deploy to Mainnet

```bash
forge script script/Deploy.s.sol \
  --rpc-url https://api.zilliqa.com \
  --broadcast \
  --legacy
```

## Verification (Sourcify)

Zilliqa uses Sourcify for contract verification. After deployment:

```bash
forge verify-contract <DEPLOYED_ADDRESS> src/MembershipNFT.sol:MembershipNFT \
  --chain-id 32769 \
  --verifier sourcify \
  --constructor-args $(cast abi-encode "constructor(string,string,uint256,uint256,address,address,uint256[],uint256,string)" \
    "ZilStream Membership" \
    "ZILM" \
    $PRICE_ZIL \
    $PRICE_TOKEN \
    $PAYMENT_TOKEN \
    $TREASURY \
    "[0,1000,1500,2000,2500]" \
    5 \
    "$SVG_IMAGE")
```

**Chain IDs:**
- Zilliqa Mainnet: `32769`
- Zilliqa Testnet: `33101`

## Contract Interface

### Purchase Functions

```solidity
// Purchase with native ZIL
function purchaseWithZil(uint256 numYears, uint256 maxPrice) external payable returns (uint256 tokenId);

// Purchase with ERC20 token (requires approval first)
function purchaseWithToken(uint256 numYears, uint256 maxPrice) external returns (uint256 tokenId);
```

### Renewal Functions

```solidity
// Renew with native ZIL (anyone can renew any NFT)
function renewWithZil(uint256 tokenId, uint256 numYears, uint256 maxPrice) external payable;

// Renew with ERC20 token
function renewWithToken(uint256 tokenId, uint256 numYears, uint256 maxPrice) external;
```

### View Functions

```solidity
// Check if membership is currently active
function isMembershipActive(uint256 tokenId) external view returns (bool);

// Get remaining time in seconds
function remainingMembership(uint256 tokenId) external view returns (uint256);

// Check if address has any active membership
function hasActiveMembership(address account) external view returns (bool);

// Get price for N years
function calculatePriceZil(uint256 numYears) public view returns (uint256);
function calculatePriceToken(uint256 numYears) public view returns (uint256);
```

### Admin Functions

```solidity
function setPriceZil(uint256 newPrice) external onlyOwner;
function setPriceToken(uint256 newPrice) external onlyOwner;
function setPaymentToken(address newToken) external onlyOwner;
function setTreasury(address newTreasury) external onlyOwner;
function setDiscountTiers(uint256[] calldata newTiers) external onlyOwner;
function setMaxYears(uint256 newMaxYears) external onlyOwner;
function setSvgImage(string calldata newSvgImage) external onlyOwner;
```

## Frontend Integration

Example using wagmi/viem:

```typescript
import { useWriteContract, useReadContract } from 'wagmi';
import { parseEther } from 'viem';

const MEMBERSHIP_NFT_ADDRESS = '0x...';
const MEMBERSHIP_NFT_ABI = [...]; // Import from out/MembershipNFT.sol/MembershipNFT.json

// Read price
const { data: price } = useReadContract({
  address: MEMBERSHIP_NFT_ADDRESS,
  abi: MEMBERSHIP_NFT_ABI,
  functionName: 'calculatePriceZil',
  args: [1n], // 1 year
});

// Purchase membership
const { writeContract } = useWriteContract();

const purchase = () => {
  writeContract({
    address: MEMBERSHIP_NFT_ADDRESS,
    abi: MEMBERSHIP_NFT_ABI,
    functionName: 'purchaseWithZil',
    args: [1n, price], // 1 year, maxPrice
    value: price,
  });
};

// Check membership status
const { data: isActive } = useReadContract({
  address: MEMBERSHIP_NFT_ADDRESS,
  abi: MEMBERSHIP_NFT_ABI,
  functionName: 'hasActiveMembership',
  args: [userAddress],
});
```

## Security

- **ReentrancyGuard**: All payment functions protected
- **SafeERC20**: Safe token transfers
- **Ownable2Step**: Two-step ownership transfer
- **Front-running protection**: `maxPrice` parameter on all purchases
- **No funds held**: Payments sent directly to treasury

## License

MIT
