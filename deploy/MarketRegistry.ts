import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    const uniV3FactoryAddress = (await deployments.get("UniswapV3Factory")).address
    const quoteTokenAddress = (await deployments.get("QuoteToken")).address

    await deploy("MarketRegistry", {
        from: deployer,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: [uniV3FactoryAddress, quoteTokenAddress],
                },
            },
        },
        log: true,
    })
}

module.exports.tags = ["MarketRegistry"]
module.exports.dependencies = ["QuoteToken", "UniswapV3Factory"]
