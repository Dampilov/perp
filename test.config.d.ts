import { MockContract } from "@eth-optimism/smock"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import {
    AccountBalance,
    BaseToken,
    ChainlinkPriceFeed,
    ClearingHouse,
    ClearingHouseConfig,
    CollateralManager,
    ERC20Test,
    Exchange,
    InsuranceFund,
    MarketRegistry,
    OrderBook,
    QuoteToken,
    TestWETH9,
    UniswapV3Factory,
    UniswapV3Pool,
    Vault,
} from "./build/typechain"

declare module "mocha" {
    export interface Context {
        // SIGNERS
        signers: SignerWithAddress[]
        owner: SignerWithAddress
        alice: SignerWithAddress
        bob: SignerWithAddress
        carol: SignerWithAddress
        tema: SignerWithAddress
        misha: SignerWithAddress

        // CONTRACTS
        vault: Vault
        USDC: ERC20Test
        weth: ERC20Test
        WETH9: TestWETH9
        wbtc: ERC20Test
        wethPriceFeed: ChainlinkPriceFeed
        clearingHouse: ClearingHouse
        clearingHouseConfig: ClearingHouseConfig
        insuranceFund: InsuranceFund
        accountBalance: AccountBalance
        exchange: Exchange
        collateralManager: CollateralManager
        factory: UniswapV3Factory
        ETHUSDpool: UniswapV3Pool
        vETH: BaseToken
        marketRegistry: MarketRegistry
        mockedvETHAggregator: MockContract
        vUSD: QuoteToken
        orderBook: OrderBook
    }
}
