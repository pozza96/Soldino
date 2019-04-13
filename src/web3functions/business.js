import web3util from "./web_util";
import ProductLogic from "../contracts_build/ProductLogic"

const web3business = (function(){
  var web3;
  function initialize(){
    return new Promise((resolve, reject) =>{
      web3util.getWeb3().then((_web3)=>{
        web3 = _web3;
        //get the instance of the contratc and resolves it
        web3util.getContractInstance(web3, ProductLogic).then(resolve)
      }).catch((err)=>{
        reject(err)
      })
    })
  }

  return {
    addProduct: function(hash, vatPercentage, netPrice) {
      return new Promise((resolve)=>{
        initialize().then(async (productLogicInstance) =>{
          let [hashIpfs, hashSize, hashFun] = await web3util.splitIPFSHash(hash)
          web3.eth.getAccounts().then((account)=>{
            console.log('---parametri---')
            console.log(hashIpfs)
            console.log(hashSize)
            console.log(hashFun)
            console.log(vatPercentage)
            console.log(netPrice*1000)
            productLogicInstance.methods.addProduct(
              hashIpfs, hashSize, hashFun, vatPercentage, netPrice*1000)
            .send({from: account[0]})
            .then(()=>{
              resolve();
            })
          })
        })
      })
    },

    getProductHash: function(remainingHash){
      return new Promise((resolve)=>{
        initialize().then((productLogicInstance)=>{
          productLogicInstance.methods.getProductCid(remainingHash).call().then((ris)=>{
            var hashIPFS = ris[0];
            var hashFun = ris[1];
            var hashSize = ris[2];
            resolve(web3util.recomposeIPFSHash(hashIPFS, hashSize, hashFun));
          });

        })
      })
    },

    getSenderProducts: function() {
      return new Promise((resolve)=>{
        initialize().then(async (productLogicInstance) =>{
          web3.eth.getAccounts().then((account)=>{
            //array containing the inserted products
            var products = [];
            //array containing the deleted products
            var deleted = [];
            //array containing the updated products
            var updated = [];
            //array containing the new hash of the updated products
            var updatedNewValue = [];
            //firstly get the inserted products from the logs
            productLogicInstance.getPastEvents('ProductInserted', {
              //filtering by the seller (only sender products)
              filter: {_seller: account[0]},
              fromBlock: 0,
              toBlock: 'latest'
            })
            .then((events) => {
                for (var i =0; i<events.length; i++){
                  //extracting only the hash
                  products.push(events[i].returnValues._keyHash)
                }
                console.log(products)
            })
            .then(()=>{
              //getting the deleted products
              productLogicInstance.getPastEvents('ProductDeleted', {
                filter: {_seller: account[0]},
                fromBlock: 0,
                toBlock: 'latest'
              })
              .then((eventsDeleted) => {
                for (var i =0; i<eventsDeleted.length; i++){
                  //extracting only the hash
                  deleted.push(eventsDeleted[i].returnValues._keyHash)
                }
                // removing the deleted products from the array
                let filtered = products.filter(function(value){
                  return !(deleted.includes(value))
                })
                products = filtered;
              })
              .then(()=>{
                productLogicInstance.getPastEvents('ProductDeleted', {
                  filter: {_seller: account[0]},
                  fromBlock: 0,
                  toBlock: 'latest'
                }).then((eventsUpdate)=>{
                  //getting the updated products


                  if(eventsUpdate!== undefined){
                    for (let i = 0; i < eventsUpdate.length; i++){
                      //saving the old hash and the new hash
                      updated.push(eventsUpdate[i].returnValues._keyHash);
                      updatedNewValue.push(eventsUpdate[i].returnValues._newHashIPFS);
                    }
                    //updating the old products with the new hash
                    for (let i = 0; i < updated.length; i++ ){
                      for (let j = 0; j < products.length; j++){
                        if(products[j]===updated[i]){
                          products[j] = updatedNewValue[i];
                        }
                      }
                    }
                    console.log(products)
                    //now products contains only the last version of the seller's products
                    resolve(products)
                  }
                })
              })
            })
          })
        })
      })
    }

  }
}());

export default web3business;
