const {getWeb3} = require('./helpers')
const truffleAssert = require('truffle-assertions');
const ContractManager = artifacts.require("ContractManager");
const UserStorage = artifacts.require("storage/UserStorage");

var web3 = getWeb3()

contract("UserStorage", (accounts) => {

  var contractManagerInstance;
  var userStorageInstance;
  const CITIZEN = accounts[3];
  const BUSINESS1 = accounts[4];
  const BUSINESS2 = accounts[5];
  //console.log(accounts[9]+'dentro user')
  before(async () => {
    contractManagerInstance = new web3.eth.Contract(
      ContractManager.abi,
      ContractManager.networks[ContractManager.network_id].address
    );
    return contractManagerInstance.methods.getContractAddress("UserStorage").call()
    .then((_userStorageInstance)=>{
      userStorageInstance = new web3.eth.Contract(UserStorage.abi,
        _userStorageInstance);
    })


  });

 /* it("should check if user 9 (Goverment) is registered", function(){
    return userLogicInstance.methods.login(accounts[9]).call().then(function(type){
      assert.equal(
        type,
        3,
        "Government not found, the contracts are not correctly initialized"
      )
    })
  });*/

  /*it("should insert a new citizen and get check its type is correct", () => {
      return userLogicInstance.methods.login(CITIZEN).call().then(function(type) {
        assert.equal(
          type,
          1,
          "Citizen insert is not correct :("
        )
      })
  });*/
  it("should add a new User", async () => {
    var add = CITIZEN
    var type = 1
    var funH = 2
    var sizeH = 2;
    var ipfsH = "0x7465737400000000000000000000000000000000000000000000000000000000"
    return userStorageInstance.methods.addUser(
      accounts[1],
      type,
      funH,
      sizeH,
      ipfsH
    )
    .send({from: accounts[0], gas:6000000})
    .then(() => {
      return userStorageInstance.methods.getUserType(CITIZEN)
      .send({from:accounts[0], gas: 2000000})
      .then(function(type){
        type,
        1,
        "The user is not a citizen"
      })
    })
  })

  it("should check if the user type is correct", function(){
    return userStorageInstance.methods.getUserType(CITIZEN)
    .send({from:CITIZEN, gas: 2000000}).then(function(type){
      type,
      1,
      "The user is not a citizen"
    })
  })

  it("should ban a user", function() {
    return userStorageInstance.methods.setEnable(CITIZEN, false).send({from: accounts[0], gas:200000})
    .then(() => {
      return userStorageInstance.methods.getUserState(CITIZEN).call()
      .then((res) => {
        assert.equal(res,false)
      })
    })
  })

});


