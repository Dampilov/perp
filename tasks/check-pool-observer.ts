import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

task("pool.getObserve")
    .addParam("contract", "Contract address")
    .addParam("ago", "Token address")
    .setAction(async ({ contract, ago }, hre: HardhatRuntimeEnvironment) => {
        const { ethers } = hre

        const UniswapV3PoolContract = (await ethers.getContractFactory("UniswapV3Pool")).attach(contract)

        const tx = await UniswapV3PoolContract.observe([ago, 0])

        console.log(`UniswapV3PoolContract.observe: ${tx}`)
    })
