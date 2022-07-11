import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    const uniV3FactoryAddress = "0xD3E51Ef092B2845f10401a0159B2B96e8B6c3D30"
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
module.exports.dependencies = ["QuoteToken"]
