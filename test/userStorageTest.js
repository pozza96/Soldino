const {getWeb3} = require('./helpers')

const ContractManager = artifacts.require("ContractManager");
const UserLogic = artifacts.require("storage/UserLogic");

var web3 = getWeb3()

contract("UserStorage", (accounts) => {

  var contractManagerInstance;
  var userLogicInstance;
  const CITIZEN = accounts[3];
  console.log(accounts[9]+'dentro user');
  before(() => {
    contractManagerInstance = new web3.eth.Contract(ContractManager.abi,
      ContractManager.networks[ContractManager.network_id].address);
    return contractManagerInstance.methods.getContractAddress("UserLogic").call()
    .then((_userLogicInstance)=>{
      userLogicInstance = new web3.eth.Contract(UserLogic.abi,
        _userLogicInstance);
    })

  });

  it("should check if user 9 is registered", function(){
    return userLogicInstance.methods.login(accounts[9]).call().then(function(type){
      assert.equal(
        type,
        3,
        "Government not found, the contracts are not correctly initialized"
      )
    })
  });

  it("should insert a new citizen and get check its type is correct", () => {
    return userLogicInstance.methods.addCitizen("a","b","c","d").send({from: CITIZEN, gas: 4712388}).then(function(){
      return userLogicInstance.methods.login(CITIZEN).call().then(function(type){
        assert.equal(
          type,
          1,
          "Citizen insert is not correct :("
        )
      })
    })
  });

});
