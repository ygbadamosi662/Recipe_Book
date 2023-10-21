import React from "react";
import { useEffect } from "react";
import { useMutation } from "react-query";
// import { useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { logNotifications } from "../../Redux/Notification/notificationActions";
import { getMyNotifications, ADMIN_getNotifications } from "../../api_calls";
import "./Notifications.css";

function Notifications({ payload, pack, reduxLogNotifications }) {
  
  const orders = {
    user_notes: getMyNotifications,
    admin: ADMIN_getNotifications,
  }

  const {
    mutate: getOrder,
    isLoading,
    isError,
    error,
    data,
  } = useMutation(orders[pack]);

  useEffect(() => {
    getOrder(payload);
    if (data?.status === 200) {
      reduxLogNotifications(data?.data.notes);
    }
  }, []);
  // payload, getOrder, data?.status, reduxLogNotifications, data?.data.notes

  if((!payload) && (!Object.keys(orders).includes(pack))) {
    return <div>
             Incomplete Request
           </div>
  }
  
  if(isLoading)
  {
    return <h2>Loading...</h2>
  }


  const notes = data?.data.notes;

  if(isError)
  {
    if ((error?.response.status === 400) || (error?.response.status === 401)) {
      return <div className="four-hundred-error">
                <h4>{`Bad Request: ${error?.response.data.message}`}</h4>
             </div> 
    }
    if ((error?.response.status >= 500)) {
      return <div className="five-hundred-error">
                <h4>{'Server Error'}</h4>
             </div> 
    }
    console.log(error)
  }

//   const onClick = () => {
//     navigate('/reviews', { id: id});
//   }

  return (
    <div className="notess">
      { notes ?
        notes.map((note, index) => {
          return <div key={index} className="note">
                    <div className="note-sub">
                        {note.subject}
                    </div>
                    <h3 className="note-comment">
                        {note.comment}
                    </h3>
                    <div className="note-status">
                        {note.status}
                    </div>
                 </div>
        })
        : <h2>No Review found....</h2>
      }
    </div>
  );
}

const mapStateToProps = state => {
  return {
    // gets user email if set
    reduxUser: state.user.user
  }
}

const mapDispatchToProps = dispatch => {
  return {
    reduxLogNotifications: (notes) => dispatch(logNotifications(notes))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);
