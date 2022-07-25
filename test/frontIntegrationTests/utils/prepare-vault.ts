import { smockit } from "@eth-optimism/smock"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { parseEther, parseUnits } from "ethers/lib/utils"
import { ethers } from "hardhat"

export async function prepareSigners(thisObject: Mocha.Context) {
    thisObject.signers = await ethers.getSigners()
    thisObject.owner = thisObject.signers[0]
    thisObject.alice = thisObject.signers[1]
    thisObject.bob = thisObject.signers[2]
    thisObject.carol = thisObject.signers[3]
    thisObject.tema = thisObject.signers[4]
    thisObject.misha = thisObject.signers[5]
}

export async function prepareVault(thisObject: Mocha.Context, signer: SignerWithAddress) {
    const { getContractFactory } = ethers

    const WETH9Factory = await getContractFactory("TestWETH9")
    const erc20Factory = await getContractFactory("ERC20Test")
    const insuranceFundFactory = await getContractFactory("InsuranceFund")
    const collateralManagerFactory = await getContractFactory("CollateralManager")
    const clearingHouseConfigFactory = await getContractFactory("ClearingHouseConfig")
    const factoryFactory = await getContractFactory("UniswapV3Factory")
    const quoteTokenFactory = await getContractFactory("QuoteToken")
    const marketRegistryFactory = await getContractFactory("MarketRegistry")
    const orderBookFactory = await getContractFactory("OrderBook")
    const accountBalanceFactory = await getContractFactory("AccountBalance")
    const exchangeFactory = await getContractFactory("Exchange")
    const vaultFactory = await getContractFactory("Vault")
    const aggregatorFactory = await ethers.getContractFactory("TestAggregatorV3")

    const WETH9 = await WETH9Factory.connect(signer).deploy()
    await WETH9.deployed()

    const settlementName = "USDC"
    const settelementSymbol = "USDC"
    const settelementDecimals = 6

    const settlementToken = await erc20Factory
        .connect(signer)
        .deploy(settlementName, settelementSymbol, settelementDecimals)
    await settlementToken.deployed()

    const insuranceFund = await insuranceFundFactory.connect(signer).deploy()
    await insuranceFund.deployed()
    await (await insuranceFund.initialize(settlementToken.address)).wait()

    const clearingHouseConfig = await clearingHouseConfigFactory.connect(signer).deploy()
    await clearingHouseConfig.deployed()
    await (await clearingHouseConfig.initialize()).wait()

    const factory = await factoryFactory.connect(signer).deploy()
    await factory.deployed()

    const quoteName = "vUSD"
    const quoteSymbol = "vUSD"

    const quoteToken = await quoteTokenFactory.connect(signer).deploy()
    await quoteToken.deployed()
    await (await quoteToken.initialize(quoteName, quoteSymbol)).wait()

    const marketRegistry = await marketRegistryFactory.connect(signer).deploy()
    await marketRegistry.deployed()
    await (await marketRegistry.initialize(factory.address, quoteToken.address)).wait()

    const orderBook = await orderBookFactory.connect(signer).deploy()
    await orderBook.deployed()
    await (await orderBook.initialize(marketRegistry.address)).wait()

    const accountBalance = await accountBalanceFactory.connect(signer).deploy()
    await accountBalance.deployed()
    await (await accountBalance.initialize(clearingHouseConfig.address, orderBook.address)).wait()

    const exchange = await exchangeFactory.connect(signer).deploy()
    await exchange.deployed()
    await (await exchange.initialize(marketRegistry.address, orderBook.address, clearingHouseConfig.address)).wait()

    const vault = await vaultFactory.connect(signer).deploy()
    await vault.deployed()
    await (
        await vault.initialize(
            insuranceFund.address,
            clearingHouseConfig.address,
            accountBalance.address,
            exchange.address,
        )
    ).wait()

    const maxCollateralTokensPerAccountArg = 3
    const debtNonSettlementTokenValueRatioArg = 750000
    const liquidationRatioArg = 500000
    const mmRatioBufferArg = 5000
    const clInsuranceFundFeeRatioArg = 12500
    const debtThresholdArg = 10000
    const collateralValueDustArg = 350

    const collateralManager = await collateralManagerFactory.connect(signer).deploy()
    await collateralManager.deployed()
    await (
        await collateralManager.initialize(
            clearingHouseConfig.address,
            vault.address,
            maxCollateralTokensPerAccountArg,
            debtNonSettlementTokenValueRatioArg,
            liquidationRatioArg,
            mmRatioBufferArg,
            clInsuranceFundFeeRatioArg,
            parseUnits(debtThresholdArg.toString(), settelementDecimals),
            parseUnits(collateralValueDustArg.toString(), settelementDecimals),
        )
    ).wait()

    await (await vault.setCollateralManager(collateralManager.address)).wait()

    // collateral tokens
    const WETH = await erc20Factory.deploy("TestWETH", "WETH", 18)
    const WBTC = await erc20Factory.deploy("TestWBTC", "WBTC", 8)

    // add collateral tokens
    const aggregator = await aggregatorFactory.deploy()
    const chainlinkPriceFeedFactory = await ethers.getContractFactory("ChainlinkPriceFeed")
    const wethPriceFeed = await chainlinkPriceFeedFactory.deploy(aggregator.address)
    const mockedWethPriceFeed = await smockit(wethPriceFeed)
    const wbtcPriceFeed = await chainlinkPriceFeedFactory.deploy(aggregator.address)
    const mockedWbtcPriceFeed = await smockit(wbtcPriceFeed)
    mockedWethPriceFeed.smocked.decimals.will.return.with(18)
    mockedWbtcPriceFeed.smocked.decimals.will.return.with(18)

    await collateralManager.addCollateral(WETH9.address, {
        priceFeed: mockedWethPriceFeed.address,
        collateralRatio: (0.7e6).toString(),
        discountRatio: (0.1e6).toString(),
        depositCap: parseEther("1000"),
    })
    await vault.setWETH9(WETH9.address)

    await collateralManager.addCollateral(WETH.address, {
        priceFeed: mockedWethPriceFeed.address,
        collateralRatio: (0.7e6).toString(),
        discountRatio: (0.1e6).toString(),
        depositCap: parseEther("1000"),
    })

    await collateralManager.addCollateral(WBTC.address, {
        priceFeed: mockedWbtcPriceFeed.address,
        collateralRatio: (0.7e6).toString(),
        discountRatio: (0.1e6).toString(),
        depositCap: parseEther("1000"),
    })

    // max deposit amount for settlement
    await (await clearingHouseConfig.setSettlementTokenBalanceCap(parseUnits("1000000", settelementDecimals))).wait()

    await (await orderBook.setExchange(exchange.address)).wait()

    await (await accountBalance.setVault(vault.address)).wait()

    await (await insuranceFund.setBorrower(vault.address)).wait()

    await (await exchange.setAccountBalance(accountBalance.address)).wait()

    thisObject.weth = WETH
    thisObject.wbtc = WBTC
    thisObject.WETH9 = WETH9
    thisObject.USDC = settlementToken
    thisObject.insuranceFund = insuranceFund
    thisObject.clearingHouseConfig = clearingHouseConfig
    thisObject.factory = factory
    thisObject.vUSD = quoteToken
    thisObject.marketRegistry = marketRegistry
    thisObject.orderBook = orderBook
    thisObject.accountBalance = accountBalance
    thisObject.exchange = exchange
    thisObject.vault = vault
    thisObject.collateralManager = collateralManager
}
