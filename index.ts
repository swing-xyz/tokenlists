import { BigNumber, Contract, providers } from 'ethers';
import { readFileSync } from 'fs';
import * as erc20Abi from 'src/abis/erc20.json';
import { ChainSlug, RPC_URLS, SupportedChainId, SupportedNonEvmChainId } from 'src/utils/chains';
import { AddressNative, AddressZero } from 'src/utils/constants';

export type Token = {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
  chainId: number;
  isNative?: boolean;
  logoURI: string;
  isDenom?: boolean; // Required for cosmos tokens
};

const NAME = {
  // Mainnets
  [SupportedChainId.MAINNET]: 'ethereum',

  [SupportedChainId.APE]: 'ape',
  // [SupportedChainId.ARBITRUM_NOVA]: '',
  [SupportedChainId.ARBITRUM_ONE]: 'arbitrum',
  // [SupportedChainId.ASTAR]: '',
  [SupportedChainId.AURORA]: 'aurora',
  [SupportedChainId.AVALANCHE]: 'avalanche',
  [SupportedChainId.BINANCE_SMART_CHAIN]: 'bsc',
  [SupportedChainId.BOBA]: 'boba',
  [SupportedChainId.CELO]: 'celo',
  [SupportedChainId.CLOVER]: 'clover',
  // [SupportedChainId.CONFLUX]: '',
  [SupportedChainId.CRONOS]: 'cronos',
  // [SupportedChainId.DARWINIA_CRAB]: '',
  [SupportedChainId.DEFI_KINGDOMS]: 'dfk',
  // [SupportedChainId.DOGECHAIN]: '',
  // [SupportedChainId.EVMOS]: '',
  [SupportedChainId.FANTOM]: 'fantom',
  [SupportedChainId.FUSE]: 'fuse',
  // [SupportedChainId.FUSION]: '',
  [SupportedChainId.GATHER]: 'gather',
  [SupportedChainId.GNOSIS]: 'gnosis',
  [SupportedChainId.HARMONY]: 'harmony',
  [SupportedChainId.HECO]: 'heco',
  // [SupportedChainId.IOTEX]: '',
  // [SupportedChainId.KAVA_EVM]: '',
  // [SupportedChainId.KCC]: '',
  // [SupportedChainId.KLAYTN]: '',
  [SupportedChainId.METIS_ANDROMEDA]: 'metis',
  // [SupportedChainId.MILKOMEDA]: '',
  [SupportedChainId.MOONBEAM]: 'moonbeam',
  [SupportedChainId.MOONRIVER]: 'moonriver',
  // [SupportedChainId.OASIS]: '',
  [SupportedChainId.OK_EX]: 'oec',
  // [SupportedChainId.ONTOLOGY_EVM]: '',
  [SupportedChainId.OPTIMISM]: 'optimism',
  // [SupportedChainId.PLATON]: '',
  [SupportedChainId.POLYGON]: 'polygon',
  // [SupportedChainId.REI]: '',
  // [SupportedChainId.ROOTSTOCK_RSK]: '',
  // [SupportedChainId.SHIDEN]: '',
  // [SupportedChainId.SWIMMER]: '',
  // [SupportedChainId.SX_NETWORK]: '',
  // [SupportedChainId.SYSCOIN]: '',
  [SupportedChainId.TELOS_EVM]: 'telos',
  // [SupportedChainId.VELAS_EVM]: '',

  // [SupportedChainId.BTTC]: '',

  // Testnets
  [SupportedChainId.ROPSTEN]: 'ropsten',
  [SupportedChainId.RINKEBY]: 'rinkeby',
  [SupportedChainId.GOERLI]: 'goerli',
  [SupportedChainId.KOVAN]: 'kovan',
  [SupportedChainId.ARBITRUM_GOERLI]: '',
  [SupportedChainId.BINANCE_SMART_CHAIN_TESTNET]: 'bsc-test',
  [SupportedChainId.FANTOM_TESTNET]: 'fantom-test',
  [SupportedChainId.FUJI]: 'fuji',
  // [SupportedChainId.METIS_STARDUST_TESTNET]: '',
  [SupportedChainId.MUMBAI]: 'mumbai',
  // [SupportedChainId.OPTIMISM_KOVAN]: '',

  [SupportedNonEvmChainId.AXELAR]: ChainSlug.Axelar,
  [SupportedNonEvmChainId.COSMOSHUB]: ChainSlug.Cosmoshub,
  [SupportedNonEvmChainId.OSMOSIS]: ChainSlug.Osmosis,
  [SupportedNonEvmChainId.JUNO]: ChainSlug.Juno,
  [SupportedNonEvmChainId.INJECTIVE]: ChainSlug.Injective,
  // [SupportedNonEvmChainId.EMONEY]: ChainSlug.EMoney,
  [SupportedNonEvmChainId.CRESCENT]: ChainSlug.Crescent,
  [SupportedNonEvmChainId.SECRET]: ChainSlug.Secret,
  [SupportedNonEvmChainId.KUJIRA]: ChainSlug.Kujira,

  [SupportedNonEvmChainId.MULTIVERSX]: 'msx',
};

export const getTokenList = (chainId: number | string, slug?: string): Token[] => {
  const chain = getChainInfo(chainId, slug);
  if (!chain) return;

  return chain.tokens;
};

const ETH_CHAINS = [
  SupportedChainId.MAINNET,
  SupportedChainId.BINANCE_SMART_CHAIN,
  SupportedChainId.HARMONY,
  SupportedChainId.OK_EX,
  SupportedChainId.OPTIMISM,
  SupportedChainId.ARBITRUM_ONE,
];

export const getTokenSymbol = (chainId: number | string, tokenSymbol: string): string => {
  if (!tokenSymbol) return;

  const symbol = tokenSymbol.toUpperCase();

  switch (Number(chainId)) {
    case 43114:
      if (symbol === 'USDT' || symbol === 'FUSDT') return 'USDT.e';
      if (symbol === 'USDC') return 'USDC.e';
      if (symbol === 'DAI') return 'DAI.e';
      if (symbol === 'WETH' || symbol === 'ETH') return 'WETH.e';
      if (symbol === 'WBTC') return 'WBTC.e';
      return tokenSymbol;
    case 250:
      if (symbol === 'USDT' || symbol === 'USDT.E' || symbol === 'FUSDT') return 'fUSDT';
      break;
  }

  if (symbol === 'USDT.E' || symbol === 'FUSDT') return 'USDT';
  if (symbol === 'USDC.E') return 'USDC';
  if (symbol === 'DAI.E') return 'DAI';
  if (symbol === 'WBTC.E') return 'WBTC';
  if (symbol === 'WBTC.E') return 'WBTC';
  if (symbol === 'ETH' || symbol === 'WETH' || symbol === 'WETH.E') {
    if (ETH_CHAINS.includes(Number(chainId))) {
      return 'ETH';
    } else {
      return 'WETH';
    }
  }
  return tokenSymbol;
};

// get info of a token by converting symbol in specific chain
export const getTokenBySymbol = (chainId: number, symbol: string, slug?: string): Token => {
  const tokenSymbol = getTokenSymbol(chainId, symbol);
  const tokens = getTokenList(chainId, slug);
  const token = tokens?.find(
    (t) =>
      t.symbol.toUpperCase() === tokenSymbol.toUpperCase() ||
      t.symbol.toUpperCase() === 'AXL' + tokenSymbol.toUpperCase(),
  );
  return token;
};

// get info of a token without converting symbol in specific chain
export const getBaseTokenBySymbol = (chainId: number, symbol: string, slug?: string): Token => {
  const tokens = getTokenList(chainId, slug);
  const token = tokens?.find((t) => t.symbol.toUpperCase() === symbol.toUpperCase());
  return token;
};

export const getTokenByAddress = (chainId: number, address: string, slug?: string): Token => {
  if (isNativeToken(address)) {
    address = AddressZero;
  }
  const tokens = getTokenList(chainId, slug);
  const token = tokens?.find((t) => t.address.toUpperCase() === address.toUpperCase());
  return token;
};

export const getTokenByName = (chainId: number, name: string): Token => {
  const tokens = getTokenList(chainId);
  const token = tokens?.find((t) => t.name.toUpperCase() === name.toUpperCase());
  return token;
};

export const getWrappedToken = (chainId: number, tokenSymbol: string) => {
  const tokens = getTokenList(chainId);
  const token = tokens?.find((t) => t.symbol.toUpperCase() === `W${tokenSymbol}`);
  return token;
};

export const isNativeToken = (address: string) => address === AddressZero || address.toLowerCase() === AddressNative;

export const isNativeETH = (tokenSymbol: string, tokenAddress: string, fromChainId: number) =>
  tokenSymbol.toLowerCase() === 'eth' && isNativeToken(tokenAddress) && Number(fromChainId) === 1;

export const getCommonTokenSymbol = (tokenSymbol: string) => {
  const symbols: Partial<Record<string, string[]>> = {
    USDT: ['fUSDT', 'USDT.e', 'axlUSDT'],
    USDC: ['USDC.e', 'axlUSDC'],
    DAI: ['DAI.e', 'axlDAI'],
    ETH: ['WETH', 'WETH.e'],
    WBTC: ['WBTC.e'],
  };

  for (const symbol in symbols) {
    if (symbols[symbol].includes(tokenSymbol)) return symbol;
  }

  return tokenSymbol;
};

export const compareTokenSymbol = (fromSymbol: string, toSymbol: string) => {
  const fromTokenSymbol = getCommonTokenSymbol(fromSymbol);
  const toTokenSymbol = getCommonTokenSymbol(toSymbol);

  return fromTokenSymbol === toTokenSymbol;
};

export const getNativeToken = (chainId: number | string): Token => {
  const tokens = getTokenList(chainId);
  const token = tokens?.find((t) => isNativeToken(t.address));
  return token;
};

export const getChainInfo = (chainId: number | string, slug?: string) => {
  // we should prioritize slug over chainId, only query NAME chainId if slug is not provided
  const _slug = slug?.toLowerCase() ?? NAME[chainId]?.toLowerCase();
  if (!_slug) return;

  const chain = JSON.parse(readFileSync(`src/tokens/${_slug}.json`, { encoding: 'utf-8' }));
  return chain;
};

export const getChainLogo = (chainId: number | string) => {
  const chain = getChainInfo(chainId);
  if (!chain) return;
  return chain?.logo;
};

export const getChainNativeCurrency = (chainId: number | string) => {
  const chain = getChainInfo(chainId);
  if (!chain) return;
  return chain?.nativeCurrency;
};

// EVM-only
export const getTokenInfoFromEVMContract = async (chainId: number, slug: string, address: string): Promise<Token> => {
  const localToken = getTokenByAddress(chainId, address, slug);
  if (localToken) return localToken;

  const provider = new providers.JsonRpcProvider(RPC_URLS[chainId]);
  if (!provider) return;
  const contract = new Contract(address, erc20Abi, provider);

  const decimals: BigNumber = await contract.decimals();
  const symbol: string = await contract.symbol();
  const name: string = await contract.name();

  return {
    chainId,
    name,
    symbol,
    address,
    decimals: +decimals.toString(),
    logoURI: undefined,
  };
};
