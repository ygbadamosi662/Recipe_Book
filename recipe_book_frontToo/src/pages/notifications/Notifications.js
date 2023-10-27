import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getMyNotifications, ADMIN_getNotifications } from "../../api_calls";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { resetStore } from "../../Redux/reset/reset_action";
import "./Notifications.css";

function Notifications({ payload, command }) {
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [haveNextPage, setHaveNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [notes, setNotes] = useState(null);

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
        // handles token expiration, token blacklisted, token invalid, and token absent
        if(error.response?.data?.jwt) {
          toast.warning(error.response.data.jwt, {
            position: toast.POSITION.TOP_RIGHT,
          });
          localStorage.removeItem("Jwt");
          dispatch(resetStore);
          navigate('/');
        }
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
  }, [command, page, haveNextPage, totalPages, payload, navigate, dispatch]);
  

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
          <span>{`${page}/${totalPages}`}</span>
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

export default Notifications;
