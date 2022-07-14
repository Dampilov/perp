import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

task("market.addMarket")
    .addParam("contract", "Contract address")
    .addParam("factory", "Contract address")
    .addParam("exchange", "Pool address")
    .addParam("basetoken", "Token address")
    .addOptionalParam("unifeetier", "Token address")
    .setAction(async ({ contract, basetoken, exchange, factory, unifeetier }, hre: HardhatRuntimeEnvironment) => {
        const { ethers } = hre
        const uniFeeRatio = 10000
        // set maxTickCrossed as maximum tick range of pool by default, that means there is no over price when swap
        const maxTickCrossedWithinBlock = 887272 * 2

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

        await BaseTokenContract.addWhitelist(poolAddr)
        await QuoteTokenContract.addWhitelist(poolAddr)

        const exFeeRatio = 1000 // 0.1%
        const ifFeeRatio = 100000 // 10%
        const clearinghouse = await MarketRegistryContract.getClearingHouse()

        await BaseTokenContract.addWhitelist(clearinghouse)
        await QuoteTokenContract.addWhitelist(clearinghouse)

        const tx = await (await MarketRegistryContract.addPool(basetoken, uniFeeRatio)).wait()
        await MarketRegistryContract.setFeeRatio(basetoken, exFeeRatio)
        await MarketRegistryContract.setInsuranceFundFeeRatio(basetoken, ifFeeRatio)

        await ExchangeContract.setMaxTickCrossedWithinBlock(basetoken, maxTickCrossedWithinBlock)

        console.log(`MarketRegistry.addPool: ${tx.transactionHash}`)
    })
