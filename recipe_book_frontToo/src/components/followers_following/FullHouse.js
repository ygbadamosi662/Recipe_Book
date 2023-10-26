import React, { useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getFollowersOrFollowing } from '../../api_calls';
import Holder from '../../pages/come_with_us/Holder';


const stylez = (clas) => {
  return {
    borderBottom: clas === 'active' ? "0.5rem solid green" : "",
    // backgroundColor: 'black',
    height: clas === 'active'? '3rem' : '2.5rem',
    width: '50%',
    // color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: '0.5s'
    // alignText: 'center'
  };
};

function FullHouse({ id }) {
  const [users, setUsers] = useState(null);
  const [show, setShow] = useState({
    followers: true,
    following: false
  });

  const navigate = useNavigate();

  useEffect(() => {
    let payload = {};
    if(show.followers) {
      payload = {
        id: id,
        which: "followers"
      }
    }
    if(show.following) {
      payload = {
        id: id,
        which: "following"
      }
    }
    const fetchReviews = async (payload) => {
      try {
        const res = await getFollowersOrFollowing(JSON.stringify(payload));
        if (res.status === 200) {
          if(res.data.users) {
            setUsers(res.data.users);
          }
        }
      } catch (error) {
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
      fetchReviews(payload);
  }, [show.following, show.followers, id]);

  const handleFollowers = (e) => {
    e.preventDefault();
    setShow({
      followers: true,
      following: false
    });
  }

  const handleFollowing = (e) => {
    e.preventDefault();
    setShow({
        followers: false,
        following: true
      });
  }

  const handleViewUser = (e, id) => {
    e.preventDefault();
    navigate(`/user/user/${id}`);
  }

  return (
    <div className='main-container'>
      <div className="toggle">
        <Holder
          name="followers"
          clas={show.followers ? "active" : ""}
          handleClick={(e) => handleFollowers(e)}
          stylez={stylez}
          display='Followers'
        />

        <Holder
          name="following"
          clas={show.following ? "active" : ""}
          handleClick={(e) => handleFollowing(e)}
          stylez={stylez}
          display='Following'
        />
      </div>
      <div className='user-users'>
        { users ? (
              <div className='users'>
                { users.map((user, index) => {
                    return <div className='user' key={index}>
                              <h3>{user.name.fname+" "+user.name.lname}</h3>
                              <button type='button' className='view-user-btn' onClick={(e) => handleViewUser(e, user._id)}>
                                View user
                              </button>
                           </div>
                })
                }
              </div>
            )
          :
          (<h2>No {`${show.followers ? "Followers" : "Following"}`} to show</h2>)
        }
      </div>
    </div>
  )
}

export default FullHouse
