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
    let tx = await (await AccountBalance.setClearingHouse(clearingHouse.address)).wait()
    console.log(`AccountBalance.setClearingHouse: ${tx.transactionHash}`)

    const Exchange = (await ethers.getContractFactory("Exchange")).attach(exchangeAddress)
    tx = await (await Exchange.setClearingHouse(clearingHouse.address)).wait()
    console.log(`Exchange.setClearingHouse: ${tx.transactionHash}`)

    const MarketRegistry = (await ethers.getContractFactory("MarketRegistry")).attach(marketRegistryAddress)
    tx = await (await MarketRegistry.setClearingHouse(clearingHouse.address)).wait()
    console.log(`MarketRegistry.setClearingHouse: ${tx.transactionHash}`)

    const OrderBook = (await ethers.getContractFactory("OrderBook")).attach(orderBookAddress)
    tx = await (await OrderBook.setClearingHouse(clearingHouse.address)).wait()
    console.log(`OrderBook.setClearingHouse: ${tx.transactionHash}`)

    const Vault = (await ethers.getContractFactory("Vault")).attach(vaultAddress)
    tx = await (await Vault.setClearingHouse(clearingHouse.address)).wait()
    console.log(`Vault.setClearingHouse: ${tx.transactionHash}`)
}

module.exports.tags = ["ClearingHouse"]
module.exports.dependencies = [
    "ClearingHouseConfig",
    "Vault",
    "QuoteToken",
    "Exchange",
    "AccountBalance",
    "InsuranceFund",
    "UniswapV3Factory",
    "MarketRegistry",
    "OrderBook",
]
