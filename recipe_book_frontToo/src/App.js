import React from "react";
import { Routes, Route } from "react-router-dom";
import ComeWithUs from "./pages/come_with_us/ComeWithUs";
import Dashboard from "./pages/dashboard/Dashboard";
import Navbar from "./components/navbar/Navbar";
import {QueryClient, QueryClientProvider} from 'react-query';
import {ReactQueryDevtools} from 'react-query/devtools'
import { Provider } from "react-redux";
import { store } from "./Redux/store";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const appStylez = {
  // backgroundColor: 'rgb(68,70,84)',
  height: '100vh',
  backgroundColor: 'grey'
}

const queryClient = new QueryClient()

function App() {
  return (
    <Provider store={store}>
      <div className="App" style={appStylez}>
        <React.Fragment>
          <Navbar />
          <QueryClientProvider client={queryClient}>
            <Routes>
              <Route exact path="/" element={<ComeWithUs initChoice={false}/>} />
              <Route exact path="/user/dash" element={<Dashboard/>} />
            </Routes>
            <ReactQueryDevtools initialIsOpen={false} position='bottom-right'/>
          </QueryClientProvider>
        </React.Fragment>
        <ToastContainer />
      </div>
    </Provider>
  );
}

export default App;
