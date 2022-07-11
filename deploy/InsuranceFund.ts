import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    const baseTokenAddress = (await deployments.get("BaseToken")).address

    await deploy("InsuranceFund", {
        from: deployer,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: [baseTokenAddress],
                },
            },
        },
        log: true,
    })
}

module.exports.tags = ["InsuranceFund"]
module.exports.dependencies = ["BaseToken"]
