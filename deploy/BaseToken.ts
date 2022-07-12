import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    const Name = "vETH"
    const Symbol = "vETH"
    const chainlinkPriceFeed = "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e"

    await deploy("BaseToken", {
        from: deployer,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: [Name, Symbol, chainlinkPriceFeed],
                },
            },
        },
        log: true,
    })
}

module.exports.tags = ["BaseToken"]
