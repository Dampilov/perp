import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

task("market.addMarket")
    .addParam("contract", "Contract address")
    .addParam("clearinghouse", "Pool address")
    .addParam("basetoken", "Token address")
    .addOptionalParam("unifeetier", "Token address")
    .setAction(async ({ contract, basetoken, unifeetier, clearinghouse }, hre: HardhatRuntimeEnvironment) => {
        const { ethers } = hre
        const uniFeeRatio = 10000
        // set maxTickCrossed as maximum tick range of pool by default, that means there is no over price when swap
        const maxTickCrossedWithinBlock = 887272 * 2

        const ClearingHouseContract = (await ethers.getContractFactory("ClearingHouse")).attach(clearinghouse)

        const exchange = await ClearingHouseContract.getExchange()
        const factory = await ClearingHouseContract.getUniswapV3Factory()

        const MarketRegistryContract = (await ethers.getContractFactory("MarketRegistry")).attach(contract)
        const ExchangeContract = (await ethers.getContractFactory("Exchange")).attach(exchange)
        const BaseTokenContract = (await ethers.getContractFactory("BaseToken")).attach(basetoken)

        const quotetoken = await MarketRegistryContract.getQuoteToken()
        const QuoteTokenContract = (await ethers.getContractFactory("QuoteToken")).attach(quotetoken)

        const poolAddr = await hre.run("uni.createAndInitPool", {
            contract: factory,
            basetoken: basetoken,
            quotetoken: quotetoken,
            unifeetier: unifeetier || "10000",
        })

        await (await BaseTokenContract.addWhitelist(poolAddr)).wait()
        await (await QuoteTokenContract.addWhitelist(poolAddr)).wait()

        const exFeeRatio = 1000 // 0.1%
        const ifFeeRatio = 100000 // 10%

        await (await BaseTokenContract.addWhitelist(clearinghouse)).wait()
        await (await QuoteTokenContract.addWhitelist(clearinghouse)).wait()

        const tx = await (await MarketRegistryContract.addPool(basetoken, uniFeeRatio)).wait()
        await (await MarketRegistryContract.setFeeRatio(basetoken, exFeeRatio)).wait()
        await (await MarketRegistryContract.setInsuranceFundFeeRatio(basetoken, ifFeeRatio)).wait()

        await (await ExchangeContract.setMaxTickCrossedWithinBlock(basetoken, maxTickCrossedWithinBlock)).wait()

        console.log(`MarketRegistry.addPool: ${tx.transactionHash}`)
    })
