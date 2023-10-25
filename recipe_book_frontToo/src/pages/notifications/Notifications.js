import React from "react";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { getMyNotifications, ADMIN_getNotifications } from "../../api_calls";
import { toast } from "react-toastify";
import "./Notifications.css";

function Notifications({ payload, command }) {

  const [page, setPage] = useState(1);
  const [haveNextPage, setHaveNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [notes, setNotes] = useState([]);

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
          setNotes(res.data?.notes)
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
  }, [command, page, haveNextPage, totalPages, payload]);
  

  const handleNextClick = () => {
    setPage(page + 1);
  };

  const handlePrevClick = () => {
    setPage(page - 1);
  };

  return (
    <div className="notes">
      <h3>Notifications</h3>
      { notes ?
        notes?.map((note, index) => {
          return <div key={index} className="note">
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
    reduxUser: state.user.user,
  }
}

export default connect(mapStateToProps, null)(Notifications);
