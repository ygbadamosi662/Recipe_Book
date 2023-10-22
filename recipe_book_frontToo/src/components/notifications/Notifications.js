import React from "react";
import { useEffect } from "react";
import { useMutation } from "react-query";
import { connect } from "react-redux";
import { logNotifications } from "../../Redux/Notification/notificationActions";
import { getMyNotifications, ADMIN_getNotifications } from "../../api_calls";
import { toast } from "react-toastify";
import "./Notifications.css";

function Notifications({ payload, pack, reduxLogNotifications }) {
  
  const orders = {
    user_notes: getMyNotifications,
    admin: ADMIN_getNotifications,
  }

  const {
    mutate: getOrder,
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

  if((!Object.keys(orders).includes(pack))) {
    toast.error("Incomplete request", {
      position: toast.POSITION.TOP_RIGHT,
    });
  }

  if(isError)
  {
    if ((error?.response.status === 400) || (error?.response.status === 401)) {
      toast.error(`Bad Request: ${error?.response.data.msg}`, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
    if ((error?.response.status >= 500)) {
      toast.error('Server Error', {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  }


  const notes = data?.data.notes;

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
