## Host

api-v2.zilstream.com

## /tokens

```
{
"data": [
{
"address": "0x2274005778063684fbb1bfa96a2b725dc37d75f9",
"symbol": "zUSDT",
"name": "Zilliqa-bridged USDT token",
"decimals": 6,
"price_usd": "1.000000000000000000",
"total_volume_usd": "0.000000000000000000"
},
{
"address": "0xc6f3dede529af9d98a11c5b32dbf03bf34272ed5",
"symbol": "GARY",
"name": "The GARY Token",
"decimals": 4,
"total_volume_usd": "0.000000000000000000"
},
{
"address": "0x94e18ae7dd5ee57b55f30c4b63e2760c09efb192",
"symbol": "WZIL",
"name": "Wrapped ZIL",
"decimals": 18,
"total_volume_usd": "0.000000000000000000"
},
{
"address": "0x7d2ff48c6b59229d448473d267a714d29f078d3e",
"symbol": "STREAM",
"name": "ZilStream",
"decimals": 8,
"total_volume_usd": "0.000000000000000000"
},
{
"address": "0xe9d47623bb2b3c497668b34fcf61e101a7ea4058",
"symbol": "Lunr",
"name": "Lunr",
"decimals": 4,
"total_volume_usd": "0.000000000000000000"
},
{
"address": "0xccf3ea256d42aeef0ee0e39bfc94baa9fa14b0ba",
"symbol": "XCAD",
"name": "XCAD Network Token",
"decimals": 18,
"total_volume_usd": "0.000000000000000000"
},
{
"address": "0x097c26f8a93009fd9d98561384b5014d64ae17c2",
"symbol": "stZIL",
"name": "StZIL",
"decimals": 12,
"total_volume_usd": "0.000000000000000000"
},
{
"address": "0x01035e423c40a9ad4f6be2e6cc014eb5617c8bd6",
"symbol": "ZOGE",
"name": "Zoge Coin",
"decimals": 18,
"total_volume_usd": "0.000000000000000000"
}
],
"pagination": {
"page": 1,
"per_page": 25,
"has_next": false
}
}
```

## /pairs

```
{
"data": [
{
"protocol": "uniswap_v2",
"address": "0xca36279d8fda7f75ee4dc62de301181824373e2c",
"token0": "0x2274005778063684fbb1bfa96a2b725dc37d75f9",
"token1": "0xc6f3dede529af9d98a11c5b32dbf03bf34272ed5",
"token0_symbol": "zUSDT",
"token0_name": "Zilliqa-bridged USDT token",
"token1_symbol": "GARY",
"token1_name": "The GARY Token",
"reserve0": "60343398",
"reserve1": "3613",
"liquidity_usd": "120.686796000000000000",
"volume_usd": "3.282766023809523676",
"txn_count": 4
},
{
"protocol": "uniswap_v2",
"address": "0x91158b7b1bb9355371c0c72e4dfd1ce98d36b29c",
"token0": "0x2274005778063684fbb1bfa96a2b725dc37d75f9",
"token1": "0x94e18ae7dd5ee57b55f30c4b63e2760c09efb192",
"token0_symbol": "zUSDT",
"token0_name": "Zilliqa-bridged USDT token",
"token1_symbol": "WZIL",
"token1_name": "Wrapped ZIL",
"reserve0": "26438018923",
"reserve1": "1124212300613433836857975",
"liquidity_usd": "52876.037846000000000000",
"volume_usd": "11265.120589971426781384",
"txn_count": 184
}
],
"pagination": {
"page": 1,
"per_page": 25,
"has_next": false
}
}
```

## /pairs/{pairAddress}/events

```
{
"data": [
{
"protocol": "uniswap_v2",
"event_type": "mint",
"id": "0x24b4b1d71dd426c610af7032dec21ef50e42a04c5deb21c275a3c07f898723fb-3",
"transaction_hash": "0x24b4b1d71dd426c610af7032dec21ef50e42a04c5deb21c275a3c07f898723fb",
"log_index": 3,
"block_number": 3338874,
"timestamp": 1699919284,
"address": "0xca36279d8fda7f75ee4dc62de301181824373e2c",
"sender": "0x0000000000000000000000000000000000000000",
"to_address": "0x7b81481c116fd3d0f8172eece0cb383c00a82732",
"amount0_in": "0",
"amount1_in": "0",
"amount0_out": "0",
"amount1_out": "0",
"liquidity": "373447"
},
{
"protocol": "uniswap_v2",
"event_type": "mint",
"id": "0x24b4b1d71dd426c610af7032dec21ef50e42a04c5deb21c275a3c07f898723fb-2",
"transaction_hash": "0x24b4b1d71dd426c610af7032dec21ef50e42a04c5deb21c275a3c07f898723fb",
"log_index": 2,
"block_number": 3338874,
"timestamp": 1699919284,
"address": "0xca36279d8fda7f75ee4dc62de301181824373e2c",
"sender": "0x33c6a20d2a605da9fd1f506dded449355f0564fe",
"to_address": "0xb4e8e3ba3ae55622e83bf2fedf179bdbda6ac576",
"amount0_in": "48288017",
"amount1_in": "2891",
"amount0_out": "0",
"amount1_out": "0",
"liquidity": "22",
"amount_usd": "96.559632610803333819"
},
{
"protocol": "uniswap_v2",
"event_type": "swap",
"id": "0xf4b7bfd4c28ee36ed5a4d248f6c8c52c3266dc229dc0f664eabd96ab3e5b7dda-7",
"transaction_hash": "0xf4b7bfd4c28ee36ed5a4d248f6c8c52c3266dc229dc0f664eabd96ab3e5b7dda",
"log_index": 7,
"block_number": 3283111,
"timestamp": 1698069317,
"address": "0xca36279d8fda7f75ee4dc62de301181824373e2c",
"sender": "0x33c6a20d2a605da9fd1f506dded449355f0564fe",
"recipient": "0x63ef61df68918229f8ea444ef99715fd7fcf0777",
"amount0_in": "1704431",
"amount1_in": "0",
"amount0_out": "0",
"amount1_out": "118",
"amount_usd": "3.158493023809523681"
},
{
"protocol": "uniswap_v2",
"event_type": "swap",
"id": "0x84ede558df50e0c9762020b05080f92a3e43e47f60577203c5fecec616a5f288-3",
"transaction_hash": "0x84ede558df50e0c9762020b05080f92a3e43e47f60577203c5fecec616a5f288",
"log_index": 3,
"block_number": 3251584,
"timestamp": 1697036839,
"address": "0xca36279d8fda7f75ee4dc62de301181824373e2c",
"sender": "0x33c6a20d2a605da9fd1f506dded449355f0564fe",
"recipient": "0x7b81481c116fd3d0f8172eece0cb383c00a82732",
"amount0_in": "0",
"amount1_in": "10",
"amount0_out": "124273",
"amount1_out": "0",
"amount_usd": "0.124272999999999995"
},
{
"protocol": "uniswap_v2",
"event_type": "mint",
"id": "0xf60e0fe0dd5b2824e8d07c09dc7b0682d2478e93f0bb1cb3077f0590a087b397-4",
"transaction_hash": "0xf60e0fe0dd5b2824e8d07c09dc7b0682d2478e93f0bb1cb3077f0590a087b397",
"log_index": 4,
"block_number": 3251552,
"timestamp": 1697035881,
"address": "0xca36279d8fda7f75ee4dc62de301181824373e2c",
"sender": "0x33c6a20d2a605da9fd1f506dded449355f0564fe",
"to_address": "0x7b81481c116fd3d0f8172eece0cb383c00a82732",
"amount0_in": "10475223",
"amount1_in": "830",
"amount0_out": "0",
"amount1_out": "0",
"liquidity": "92243",
"amount_usd": "10.475222999999999729"
}
],
"pagination": {
"page": 1,
"per_page": 25,
"has_next": false
}
}
```
