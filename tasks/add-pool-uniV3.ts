import { subtask } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { encodePriceSqrt } from "../test/shared/utilities"

subtask("uni.createAndInitPool")
    .addParam("contract", "Contract address")
    .addParam("basetoken", "Contract address")
    .addParam("quotetoken", "Contract address")
    .addParam("unifeetier", "Contract address")
    .setAction(async ({ contract, basetoken, quotetoken, unifeetier }, hre: HardhatRuntimeEnvironment) => {
        const { ethers } = hre

        const initprice = 151.373306858723226652

        const uniV3FactoryContract = (await ethers.getContractFactory("UniswapV3Factory")).attach(contract)

        /* await (
            await uniV3FactoryContract.createPool(basetoken, quotetoken, unifeetier)
        ).wait */
        const poolAddr = await uniV3FactoryContract.getPool(basetoken, quotetoken, unifeetier)

        const PoolContract = (await ethers.getContractFactory("UniswapV3Pool")).attach(poolAddr)

        let tx = await (await PoolContract.initialize(encodePriceSqrt(initprice.toString(), "1"))).wait()

        const uniFeeRatio = await PoolContract.fee()
        const tickSpacing = await PoolContract.tickSpacing()
        console.log(`uniFeeRatio = ${uniFeeRatio}`)
        console.log(`tickSpacing = ${tickSpacing}`)

        // the initial number of oracle can be recorded is 1; thus, have to expand it
        await PoolContract.increaseObservationCardinalityNext(500)

        console.log(`uniswapV3Pool.initialize: ${tx.transactionHash}`)

        return poolAddr
    })
