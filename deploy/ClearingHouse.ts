import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    const clearingHouseConfigAddress = (await deployments.get("ClearingHouseConfig")).address
    const vaultAddress = (await deployments.get("Vault")).address
    const quoteTokenAddress = (await deployments.get("QuoteToken")).address
    const uniswapV3FactoryAddress = (await deployments.get("UniswapV3Factory")).address
    const exchangeAddress = (await deployments.get("Exchange")).address
    const accountBalanceAddress = (await deployments.get("AccountBalance")).address
    const insuranceFundAddress = (await deployments.get("InsuranceFund")).address
    const marketRegistryAddress = (await deployments.get("MarketRegistry")).address
    const orderBookAddress = (await deployments.get("OrderBook")).address

    const clearingHouse = await deploy("ClearingHouse", {
        from: deployer,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: [
                        clearingHouseConfigAddress,
                        vaultAddress,
                        quoteTokenAddress,
                        uniswapV3FactoryAddress,
                        exchangeAddress,
                        accountBalanceAddress,
                        insuranceFundAddress,
                    ],
                },
            },
        },
        log: true,
    })

    const AccountBalance = (await ethers.getContractFactory("AccountBalance")).attach(accountBalanceAddress)
    const Exchange = (await ethers.getContractFactory("Exchange")).attach(exchangeAddress)
    const MarketRegistry = (await ethers.getContractFactory("MarketRegistry")).attach(marketRegistryAddress)
    const OrderBook = (await ethers.getContractFactory("OrderBook")).attach(orderBookAddress)
    const Vault = (await ethers.getContractFactory("Vault")).attach(vaultAddress)
    const QuoteToken = (await ethers.getContractFactory("QuoteToken")).attach(quoteTokenAddress)

    await (await AccountBalance.setClearingHouse(clearingHouse.address)).wait()

    await (await Exchange.setClearingHouse(clearingHouse.address)).wait()

    await (await MarketRegistry.setClearingHouse(clearingHouse.address)).wait()

    await (await OrderBook.setClearingHouse(clearingHouse.address)).wait()

    await (await Vault.setClearingHouse(clearingHouse.address)).wait()

    await (await QuoteToken.mintMaximumTo(clearingHouse.address)).wait()
}

module.exports.tags = ["ClearingHouse"]
module.exports.dependencies = [
    "ClearingHouseConfig",
    "Vault",
    "QuoteToken",
    "Exchange",
    "AccountBalance",
    "InsuranceFund",
    "MarketRegistry",
    "OrderBook",
    "UniswapV3Factory",
]
