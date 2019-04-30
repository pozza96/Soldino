import web3util from "../web3functions/web_util"
import ipfsModule from "../ipfsCalls/index"
import web3user from "../web3functions/user"

//TODO resolve in buy function
const user = (function(){

  function groupProductsBySeller(products){
    return products.sort((a,b) => (a.seller > b.seller) ? 1 : ((b.seller > a.seller) ? -1 : 0));
  }

  function splitInSellerArray(products){
    var productAux = [];
    var prevSeller = products[0].seller;

    var result = []
    for(let i = 0; i< products.length; i++){
      if(products[i].seller !== prevSeller){
        prevSeller = products[i].seller;
        result.push(productAux);
        productAux = [];
      }
      productAux.push(products[i]);
    }
    result.push(productAux);
    return result;
  }

  function getTotalVAT(products){
    let sum = 0;
    for(let i = 0; i < products.length; i++){
      sum+= parseInt((products[i].VAT));
    }
    return sum;
  }

  function getTotalNet(products){
    let sum = 0;
    for(let i = 0; i < products.length; i++){
      sum+= (products[i].price*100)/(+100 + +parseInt((products[i].VAT)));
    }
    return sum;
  }

  function getTotal(products){
    var sum = 0;
    for(let i = 0; i < products.length; i++){
      sum+= products[i].price;
    }
    return sum;
  }

  function getLastOrderNumber(){
    return new Promise((resolve)=>{
      web3user.getPurchaseNumber().then(resolve)
    })
  }


  return {
    buy: function(cartInfo){
      return new Promise((resolve)=>{
         //get all the products

        var products = cartInfo.products;
        console.log(products)
        //cartInfo contains all the information about the order

        //sort the products by seller
        products = groupProductsBySeller(products)
        var orders = splitInSellerArray(products)
        var promises = []
        getLastOrderNumber().then((number)=>{
        for(let i = 0; i < orders.length; i++){
          promises.push(new Promise((resolve)=>{
              var order = {
                products: orders[i],
                date: cartInfo.date,
                number: +number + +i + +1,
                VAT: getTotalVAT(orders[i]),
                net: getTotalNet(orders[i]),
                total: getTotal(orders[i]),
                address: cartInfo.address,
                buyerName: cartInfo.buyerName,
                buyerDetails: cartInfo.buyerDetails,
                sellerName: orders[i][0].sellerName,
                sellerVATNumber: orders[i][0].sellerVATNumber
              }
              ipfsModule.insertJSONintoIPFS(order).then(resolve)
            }))
          }

          Promise.all(promises).then((results)=>{
            //results: array of IPFS (orders)
            var remainingHash = []
            var hashSize = []
            var hashFun = []
            var productQtn = []
            for(let i = 0; i < results.length; i++){
              for(let j = 0 ; j < orders[i].length; j++){
                let [rH, hS, hF] = web3util.splitIPFSHash(results[i]);
                remainingHash.push(rH);
                hashSize.push(hS);
                hashFun.push(hF);
                productQtn.push(orders[i][j].quantity)
              }
            }
            web3user.tokenTransferApprove(cartInfo.VAT+cartInfo.net).then(()=>{
              console.log([cartInfo.VAT+cartInfo.net, products, remainingHash, hashSize, hashFun, productQtn])
              web3user.purchase(products, remainingHash, hashSize, hashFun, productQtn).then(resolve)
            })
          })
        })
      })
    },

    getBalance: function(){
      return new Promise((resolve)=>{
        web3user.getBalance().then(resolve)
      })
    },

    getPurchases: function(){
      return new Promise((resolve)=>{
        web3user.getPurchase().then((purchases)=>{
          console.log('HASH IPFS DEI PRODOTTI')
          console.log(purchases)
          //getting the orders JSONs from IPFS
          let purchaseJSONs = []
          for(let i = 0; i<purchases.length; i++){
            purchaseJSONs.push(
              new Promise((resolve)=>{
                ipfsModule.getJSONfromHash(purchases[i]).then(resolve)
              })
            )
          }
          Promise.all(purchaseJSONs).then(resolve)
        })
      })
    }
  }
}());

export default user;

