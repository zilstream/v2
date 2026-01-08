import type { Address } from "viem";

export interface LiquidValidator {
  name: string;
  address: Address;
  lstAddress: Address;
  lstSymbol: string;
  iconUrl: string;
}

export interface NonLiquidValidator {
  name: string;
  address: Address;
  iconUrl: string;
}

export const LIQUID_VALIDATORS: LiquidValidator[] = [
  {
    name: "PlunderSwap",
    address: "0x691682FCa60Fa6B702a0a69F60d045c08f404220",
    lstAddress: "0xc85b0db68467dede96A7087F4d4C47731555cA7A",
    lstSymbol: "pZIL",
    iconUrl: "/static/logo_Plunderswap.webp",
  },
  {
    name: "Encapsulate",
    address: "0x1311059DD836D7000Dc673eA4Cc834fe04e9933C",
    lstAddress: "0x8E3073b22F670d3A09C66D0Abb863f9E358402d2",
    lstSymbol: "encapZIL",
    iconUrl: "/static/logo_encapsulate.webp",
  },
  {
    name: "TorchWallet",
    address: "0xBB2Cb8B573Ec1ec4f77953128df7F1d08D9c34DF",
    lstAddress: "0x9e4E0F7A06E50DA13c78cF8C83E907f792DE54fd",
    lstSymbol: "tZIL",
    iconUrl: "/static/logo_torchwallet.webp",
  },
  {
    name: "Lithium Digital",
    address: "0xBD6ca237f30A86eea8CF9bF869677F3a0496a990",
    lstAddress: "0x3B78f66651E2eCAbf13977817848F82927a17DcF",
    lstSymbol: "litZil",
    iconUrl: "/static/logo_lithiumdigital.webp",
  },
  {
    name: "Amazing Pool",
    address: "0x1f0e86Bc299Cc66df2e5512a7786C3F528C0b5b6",
    lstAddress: "0x8a2afD8Fe79F8C694210eB71f4d726Fc8cAFdB31",
    lstSymbol: "aZIL",
    iconUrl: "/static/logo_amazing_pool.svg",
  },
  {
    name: "StakeShark",
    address: "0xF7F4049e7472fC32805Aae5bcCE909419a34D254",
    lstAddress: "0x737EBf814D2C14fb21E00Fd2990AFc364C2AF506",
    lstSymbol: "shZIL",
    iconUrl: "/static/logo_shark.svg",
  },
];

export const NON_LIQUID_VALIDATORS: NonLiquidValidator[] = [
  {
    name: "CEX.IO",
    address: "0x18925cE668b2bBC26dfE6F630F5C285D46b937AE",
    iconUrl: "/static/logo_cex.webp",
  },
  {
    name: "DTEAM",
    address: "0x8776F1135b3583DbaE79C8f7268a7e0d4C16462c",
    iconUrl: "/static/logo_Dteam.webp",
  },
  {
    name: "Luganodes",
    address: "0x63CE81C023Bb9F8A6FFA08fcF48ba885C21FcFBC",
    iconUrl: "/static/logo_Luganodes.webp",
  },
  {
    name: "Stakefish",
    address: "0x715F94264057df97e772ebDFE2c94A356244F142",
    iconUrl: "/static/logo_stakefish.webp",
  },
  {
    name: "Moonlet",
    address: "0xF35E17333Bd4AD7b11e18f750AFbccE14e4101b7",
    iconUrl: "/static/logo_moonlet.webp",
  },
  {
    name: "BlackNodes",
    address: "0x87297b0B63A0b93D3f7cAFA9E0f4C849e92642EB",
    iconUrl: "/static/logo_blacknodes.png",
  },
  {
    name: "AlphaZIL",
    address: "0x068C599686d2511AD709B8b4C578549A65D19491",
    iconUrl: "/static/logo_ezil.svg",
  },
  {
    name: "Shardpool",
    address: "0xE5e8158883A37449Ae07fe70B69E658766B317fc",
    iconUrl: "/static/logo_shardpool.svg",
  },
  {
    name: "Zillet",
    address: "0x7E3A0AEbBF8EC2F12a8a885CD663EE4a490F923f",
    iconUrl: "/static/logo_zillet.svg",
  },
  {
    name: "2ZilMoon",
    address: "0xCDb0B23Db1439b28689844FD093C478d73C0786A",
    iconUrl: "/static/logo_ziltomoon.webp",
  },
  {
    name: "Citadel.one",
    address: "0xD12340c2D5A26e7f5C469B57ee81EE82c8CB7686",
    iconUrl: "/static/logo_citadel.png",
  },
  {
    name: "PathrockNetwork",
    address: "0xe67e119DCdC1168EC8089F4647702A72A0fCBc7f",
    iconUrl: "/static/logo_pathrocknetwork.webp",
  },
  {
    name: "Cryptech-Hacken",
    address: "0x26322705FcBF5d3065707C408B6594912dAa3488",
    iconUrl: "/static/logo_cryptec.jpg",
  },
  {
    name: "RockX",
    address: "0x60571E6c6d55109e6705d17956201a0Cf39f1198",
    iconUrl: "/static/logo_rockx.jpg",
  },
  {
    name: "Stakin",
    address: "0xba669Cc6B49218624E84920dc8136a05411B1Ec8",
    iconUrl: "/static/logo_stakin.jpg",
  },
  {
    name: "Binance",
    address: "0xe46e5D9aDC2617141c50a995FBEbd898943B20Dd",
    iconUrl: "/static/logo_binance.jpg",
  },
  {
    name: "HTX",
    address: "0xB2D5dd48830ab8AeC288a44ee868EeE3251922bd",
    iconUrl: "/static/logo_htx.jpg",
  },
  {
    name: "r3to",
    address: "0x2b5e0D8Db793955684ddC4eaD286900Cb791cc3F",
    iconUrl: "/static/logo_r3to.webp",
  },
];
