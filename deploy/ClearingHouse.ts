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

    await deploy("ClearingHouse", {
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
]
