import government from "../facade/government"
import user from "../facade/user"
import {getCitizenList, getBusinessList, getGovernmentBalanceAndTotalAmount} from "../actions/government"
import {CITIZEN, BUSINESS} from "../constants/actionTypes"

const governmentActionCreator = (function(){
  return{
    getUserList: function(amount, index, type){
      if(type === CITIZEN)
        return new Promise((resolve)=>{
          government.getCitizenList(amount, index).then((results)=>{
            //resolves the getUserListAction
            resolve(getCitizenList(results))
          })
          .catch(()=>{
            //should resolve an error that says "No user found."
          })
        })
      if(type === BUSINESS)
        return new Promise((resolve)=>{
          government.getBusinessList(amount, index).then((results)=>{
            //resolves the getUserListAction
            resolve(getBusinessList(results))
          })
          .catch(()=>{
            //should resolve an error that says "No user found."
          })
        })
    },

    getBalanceAndTotalAmount: function(){
      return new Promise((resolve)=>{
        //prendere l'amount ed il totale dei cubit
        government.getTotalCubit().then((total)=>{
          user.getBalance().then((balance)=>{
            resolve(getGovernmentBalanceAndTotalAmount(balance, total))
          })
        })
      })

    },
    mint: function(amount){
      return new Promise((resolve)=>{
        government.mint(amount)
        .then(()=>{
          resolve(this.getBalanceAndTotalAmount())
        })
        .catch(()=>{
          //should resolve an error that says "Minting not possible.."
        })
      })
    },

    distribute: function(amount, address){
      return new Promise((resolve)=>{
        government.distribute(amount, address)
        .then(()=>{
          resolve(this.getBalanceAndTotalAmount())
        })
        .catch(()=>{
          //should resolve an error that says "Minting not possible.."
        })
      })
    },

    changeUserState: function(address, state){
      return new Promise((resolve)=>{
        var stateAction;
        if(state === true)
          stateAction = government.disableAccount
        else
          stateAction = government.enableAccount
        stateAction(address).then(resolve)
      })

    }
  }

}())

export default governmentActionCreator;
