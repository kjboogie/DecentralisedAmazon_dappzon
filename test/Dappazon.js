const { expect } = require("chai");
const { ethers } = require("hardhat");

// it converts big number like (1 ether) to wei
const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

//Global variables
const ID = 1
const NAME = "shoes"
const CATEGORY = "Clothing"
const IMAGE = "IMAGE"
const COST = tokens(1)
const RATING = 4
const STOCK = 5

describe("Dappazon", () => {
  let dappazon
  let deployer, buyer
      beforeEach(async () => {
         //Setup Accounts
         [deployer, buyer] = await ethers.getSigners()
         
        // Deploy contract
         const Dappazon = await ethers.getContractFactory("Dappazon") //fetch copy of smart contract
         dappazon = await Dappazon.deploy()   //Deploy that contract
      })



    describe("Deployment", () => {
      it("Sets the owner", async () => {
        expect(await dappazon.owner()).to.equal(deployer.address)
      })
    })

    describe("Listing", () => {
      let transaction
    

      beforeEach(async () => {
       transaction = await dappazon.connect(deployer).list(ID, NAME,CATEGORY,IMAGE,COST,RATING,STOCK) //calling the list function inside contract
        await transaction.wait() //letting transation to get finished
     })
      it("Returns item attributes", async () => {
        const item = await dappazon.items(ID)
        //console.log(item)
        expect(item.id).to.equal(ID)
        expect(item.name).to.equal(NAME)
        expect(item.category).to.equal(CATEGORY)
        expect(item.image).to.equal(IMAGE)
        expect(item.cost).to.equal(COST )
        expect(item.id).to.equal(ID)
        expect(item.id).to.equal(ID)
      })

      it("Emits List events", async () => {
       expect(transaction).to.emit(dappazon, "List") 
      })
    })

    describe("Buying", () => {
      let transaction
    

      beforeEach(async () => {
        // Listing Items
        transaction = await dappazon.connect(deployer).list(ID, NAME,CATEGORY,IMAGE,COST,RATING,STOCK) //calling the list function inside contract
        await transaction.wait() //letting transation to get finished
        
        // Buy an item
        transaction = await dappazon.connect(buyer).buy(ID, { value: COST})
      })
     
      it("Upgrade  buyer's order count", async () => {
        const result = await dappazon.orderCount(buyer.address)
        expect(result).to.equal(1)
      })
      it("Adds the order", async () =>{
        const order = await dappazon.orders(buyer.address, 1)
        expect(order.time).to.be.greaterThan(0)
        expect(order.item.name).to.eq(NAME)
      })
      // it("Checks the byer is sending enough mone to buy",async () =>{
      //    (await dappazon.connect(buyer).buy(ID, { value:  tokens(0.5)})).should.be.rejectedWith("VM Exception while processing transaction: reverted with reason string 'Please send the reuired cost to buy'")
        
      // })
      it("Upgrade contract balance", async () => {
        const result = await ethers.provider.getBalance(dappazon.address)
        expect(result).to.equal(COST)
      })
      it("Emits a buy event", async() =>{
        expect(transaction).to.emit(dappazon, "Buy")
      })

    })

    describe("Withdrawl",async() => {
      beforeEach(async () => {
      //List an item
      let transaction = await dappazon.connect(deployer).list(ID,NAME,CATEGORY,IMAGE,COST,RATING,STOCK)
      transaction.wait()

      // But an item
      transcation = await dappazon.connect(buyer).buy(ID, {value: COST})
      transaction.wait()
      //Get deployer balance before
      balanceBefore = await ethers.provider.getBalance(deployer.address)

      //Withdrawn
      transaction = await dappazon.connect(deployer).withdraw()
      transaction.wait()
    })
    it('Updates the owner balance',async () =>{
      const balanceAfter = await ethers.provider.getBalance(deployer.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })
    it('Updates the contract balance',async() => {
      const result = await ethers.provider.getBalance(dappazon.address)
      expect(result).to.equal(0)
    })
    })
    
       
})

