import React from "react";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { logNotifications } from "../../Redux/Notification/notificationActions";
import { getMyNotifications, ADMIN_getNotifications } from "../../api_calls";
import { toast } from "react-toastify";
import "./Notifications.css";

function Notifications({ payload, command, reduxLogNotifications, reduxNotes }) {

  const [page, setPage] = useState(1);
  const [haveNextPage, setHaveNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    const orders = {
      user_notes: getMyNotifications,
      admin: ADMIN_getNotifications,
    }
    if(!orders[command]) {
      toast.error("Invalid command", {
          position: toast.POSITION.TOP_RIGHT,
        });
    }
    const fetchNotes = async () => {
      try {
        payload.page = page;
        const res = await orders[command](JSON.stringify(payload));
        if (res.status === 200) {
          reduxLogNotifications(res.data?.notes);
          if(res.data?.total_pages) {
            setTotalPages(res.data?.total_pages);
          }
          if (res.data.have_next_page) {
            setHaveNextPage(true);
          }
        }
      
      } catch (error) {
        console.log(error)
        if (error.response) {
          toast.error(error.response.data.msg, {
            position: toast.POSITION.TOP_RIGHT,
          });
        } else {
          toast.error("Network error. Please try again later.", {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
      }
    };
    fetchNotes();
  }, [command, page, haveNextPage, totalPages, payload, reduxLogNotifications]);
  

  const handleNextClick = () => {
    setPage(page + 1);
  };

  const handlePrevClick = () => {
    setPage(page - 1);
  };


  return (
    <div className="notess">
      <h3>Notifications</h3>
      { reduxNotes ?
        reduxNotes?.map((note, index) => {
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
        : <h2>No Notification found....</h2>
      }
      {haveNextPage && (
        <div className="page-btns-container">
          {page > 1 && (
            <button type="button" className="prev-btm" onClick={handlePrevClick}>
              prev
            </button>
          )}
          <span>{`${totalPages}/${page}`}</span>
          {page < totalPages && (
            <button type="button" className="next-btm" onClick={handleNextClick}>
                next
            </button>
          )}
          
        </div>
      )}
    </div>
  );
}

const mapStateToProps = state => {
  return {
    // gets user email if set
    reduxUser: state.user.user,
    reduxNotes: state.notification.notifications,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    reduxLogNotifications: (notes) => dispatch(logNotifications(notes))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);
