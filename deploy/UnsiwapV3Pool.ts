import { HardhatRuntimeEnvironment } from "hardhat/types"
import { UniswapV3Factory } from "../typechain"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    const factory = await deploy("UniswapV3Pool", {
        args: [],
        from: deployer,
        log: true,
    })
}

module.exports.tags = ["UniswapV3Pool"]
