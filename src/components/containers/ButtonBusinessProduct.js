import { connect } from 'react-redux';
import { withToastManager } from 'react-toast-notifications';
import Button from '../presentational/Button';
import businessActionCreator from '../../actionsCreator/businessActionCreator';
import { getBase64 } from '../../auxiliaryFunctions';
import { amountStore, defaultIndex, ERRORTOAST, SUCCESSTOAST, INFOTOAST } from '../../constants/fixedValues';
import history from '../../store/history';


/**
 * @description map the addProduct action into the Button component
 * @param {*} dispatch
 * @param {*} ownProps
 */
const mapDispatchToProps = (dispatch, ownProps) => {
  const { toastManager } = ownProps;
  return {
    /**
     * @description Add new product to sell.
     * @param {*} parametersArray: product array with its params: [title, description, netPrice, VATPercentage, image]
     */
    action: (parametersArray) => {
      //check if title, description, netPrice and VATPercentage are void
      let voidValue = [];
      for(let i=0; i<4; i++) {
        voidValue[i] = false
        if(parametersArray[i]===""){
          voidValue[i] = true
        }
      }
      if(voidValue[0]===false &&
         voidValue[1]===false &&
         voidValue[2]===false &&
         voidValue[3]===false){
        //continue only if title, description, netPrice and VATPercentage are not void
        let id
        toastManager.add("You have to approve MetaMask request. You'll have to wait few minutes for the confirmation.", INFOTOAST, (x)=>{id=x});
        //let id2;
        //toastManager.add(didYouKnowThat(), DIDYOUKNOWTOAST, (x)=>{id2=x})
        if(parametersArray[4]!==null){
          //if image is not null => set the image passed by arg
          getBase64(parametersArray[4]).then((base64Image)=>{
            parametersArray[4] = base64Image
            businessActionCreator.addProduct(...parametersArray)
            .then(()=>{
              toastManager.add(parametersArray[0].toUpperCase()+" added successfully.", SUCCESSTOAST)
              history.push("/productsmanager")
              toastManager.remove(id)
              //toastManager.remove(id2)
              businessActionCreator.getMyProducts(amountStore, defaultIndex)
              .then((action)=>{
                dispatch(action)
              })
            })
            .catch((err)=>{
              toastManager.add(err, ERRORTOAST)
              toastManager.remove(id)
              //toastManager.remove(id2)
            })
          })
        }else{
          //set the default image by setting no image
          businessActionCreator.addProduct(...parametersArray)
          .then(()=>{
            toastManager.add("Product added successfully.", SUCCESSTOAST)
            toastManager.remove(id)
            //toastManager.remove(id2)
            history.push("/productsmanager")
            businessActionCreator.getMyProducts(amountStore, defaultIndex)
            .then((action)=>{
              dispatch(action)
            })
          })
          .catch((err)=>{
            toastManager.add(err, ERRORTOAST)
            toastManager.remove(id)
            //toastManager.remove(id2)
          })
        }
      }else{
        //show toast with missed field
        let params = ["title", "description", "net price", "vat percentage"]
        for(let i=0; i<voidValue.length; i++) {
          if(voidValue[i]===true){
            toastManager.add("You missed the "+params[i]+".", ERRORTOAST)
          }
        }
      }
    }
  }
}

/**
 * @description connect the action to the Button props
 */
const ButtonBusinessProduct = connect(null, mapDispatchToProps)(Button);

export default withToastManager(ButtonBusinessProduct);
