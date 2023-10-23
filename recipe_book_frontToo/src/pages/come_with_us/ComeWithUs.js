import React, { useState } from "react";
import Signup from "../../components/signup/Signup";
import Login from "../../components/login/Login";
import Holder from "./Holder";
import "./ComeWithUs.css";

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

function ComeWithUs({ initChoice }) {
  const handleChoice = (event) => {
    const what = event.currentTarget.name;

    switch (what) {
      case "reg":
        setChoice(true);
        break;
      case "log":
        setChoice(false);
        break;
      default:
        setChoice(true);
        break;
    }
  };

  
  const switch_up = (to=false) => {
    setChoice(to);
  }
  
  const [choice, setChoice] = useState(initChoice);
  
  return (
    <div className="main-container">
      <div className="toggle">
        <Holder
          name='reg'
          clas={choice ? "active" : ""}
          handleClick={handleChoice}
          stylez={stylez}
          display='REGISTER'
        />

        <Holder
          name='log'
          clas={!choice ? "active" : ""}
          handleClick={handleChoice}
          stylez={stylez}
          display='LOGIN'
        />
        
      </div>
      {choice ? <Signup goL={switch_up}  /> : <Login />}
    </div>
  );
}

export default ComeWithUs;
