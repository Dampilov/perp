import { subtask } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { encodePriceSqrt } from "../test/shared/utilities"

subtask("uni.initPool")
    .addParam("contract", "Contract address")
    .addParam("initprice", "Token address")
    .setAction(async ({ contract, initprice }, hre: HardhatRuntimeEnvironment) => {
        const { ethers } = hre

        const PoolContract = (await ethers.getContractFactory("UniswapV3Pool")).attach(contract)
        await PoolContract.initialize(encodePriceSqrt(initprice.toString(), "1"))
        //const uniFeeRatio = await PoolContract.fee()
        //const tickSpacing = await PoolContract.tickSpacing()

        // the initial number of oracle can be recorded is 1; thus, have to expand it
        await PoolContract.increaseObservationCardinalityNext(500)

        let tx = await (await PoolContract.initialize(encodePriceSqrt(initprice.toString(), "1"))).wait()

        console.log(`uniswapV3Pool.initialize: ${tx.transactionHash}`)
    })
