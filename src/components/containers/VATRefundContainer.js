import { connect } from 'react-redux';
import { withToastManager } from 'react-toast-notifications';
import VATRefund from '../presentational/VATRefund';
import governmentActionCreator from '../../actionsCreator/governmentActionCreator';
import { setPeriod, setVATrefund } from '../../actions/government';
import history from '../../store/history';
import { beginLoading, endLoading } from '../../actions/login';
import { ERRORTOAST } from '../../constants/fixedValues';


const mapDispatchToProps = (dispatch, ownProps) => {
  const { toastManager } = ownProps;
  function setVATRefund(period){
    governmentActionCreator.setVATrefund(period)
    .then((action)=>{
      dispatch(action)
    })
    .catch((err)=>{
      toastManager.add(err, ERRORTOAST);
    })

  }

  return {
    setVATRefund: setVATRefund,

    getVATPeriods: function(){
      governmentActionCreator.getVATPeriods()
      .then((action)=>{
        dispatch(action)
      })
      .catch((err)=>{
        toastManager.add(err, ERRORTOAST);
      })
    },

    resetPeriods: function(){
      dispatch(governmentActionCreator.resetPeriods())
    },

    resetSearch: function(){
      dispatch(governmentActionCreator.resetSearch())
    },

    resetPeriod: function(){
      dispatch(governmentActionCreator.resetPeriod())
    },

    resetVAT: function(){
      dispatch(governmentActionCreator.resetVAT())
    },

    setPeriod: function(period){
      dispatch(setPeriod(period))
      if(period.id !== "Select a quarter"){
        setVATRefund(period.id)
      }else{
        setVATrefund([])
      }
    },

    setStatus: function(status){
      dispatch(governmentActionCreator.setStatus(status))
    },

    refund : function(address, period, amount){
      dispatch(beginLoading())
      governmentActionCreator.refund(address, period, amount)
      .then(()=>{
        dispatch(endLoading())
        history.push("/vatrefund")
      })
      .catch((err)=>{
        toastManager.add(err, ERRORTOAST);
        dispatch(endLoading())
      })
    }
  }
}

const mapStateToProps = (state) => {
  return {
    VATRefundList: state.VATRefundList,
    searchProduct: state.searchProduct,
    selectedStatus: state.selectedStatus,
    VATPeriods: state.VATPeriods,
    selectedPeriod: state.selectedPeriod
  }
}

const VATRefundContainer = connect(mapStateToProps, mapDispatchToProps)(VATRefund);

export default withToastManager(VATRefundContainer);
