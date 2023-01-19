const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Reentrancy', () => {
    let deployer
    let bank

    beforeEach(async () => {
        [deployer, user] = await ethers.getSigners()

        const Bank = await ethers.getContractFactory('Bank', deployer)
        bank = await Bank.deploy()

        await bank.deposit({ value: ethers.utils.parseEther('100') })
        await bank.connect(user).deposit({ value: ethers.utils.parseEther('50') })

        const Attacker = await ethers.getContractFactory('Attacker', attacker)
        attackerContract = await Attacker.deploy(bank.address)

    })

    describe('facilitates deposits and withdrawals', () => {
        it('accepts deposits', async () => {
            // check deposit balance
            const deployerBalance = await bank.balanceOf(deployer.address)
            expect(deployerBalance)/to.eq(ethers.utils.parseEther('100'))

            const userBalance = await bank.balanceOf(user.address)
            expect(userBalance).to.eq(ethers.utils.parseEther('50'))
        })

        it('accepts withdrawls', async () => {
            await bank.withdraw()

            const deployerBalance = await bank.balanceOf(deployer.address)
            const userBalance = await bank.balanceOf(user.address)

            expect(deployerBalance).to.eq(0)
            expect(userBalance).to.eq(ethers.utils.parseEther('50'))
        })

        it('allows attacker to drain funds from #withdraw()', async () => {
            console.log('*** Before ***')
            console.log(ethers.utils.formatEther(await ethers.provider.getBalance(bank.address)))
            console.log(ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address)))

            // Perform Attack
            await attackerContract.attack({ value: ethers.utils.parseether('10') })

            console.log('*** After ***')
            console.log(ethers.utils.formatEther(await ethers.provider.getBalance(bank.address)))
            console.log(ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address)))

            // Check bank balance has been drained
            expect(await ethers.provider.getBalance(bank.address)).to.eq(0)

        })

    })
})