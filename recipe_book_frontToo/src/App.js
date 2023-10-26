import React from "react";
import { Routes, Route } from "react-router-dom";
import ComeWithUs from "./pages/come_with_us/ComeWithUs";
import Dashboard from "./pages/dashboard/Dashboard";
import Navbar from "./components/navbar/Navbar";
import UserProfile from "./pages/user_profile/UserProfile";
import CreateRecipe from "./pages/create_recipe/CreateRecipe";
import UpdateRecipe from "./pages/update_recipe/UpdateRecipe";
import Notifications from "./pages/notifications/Notifications";
import Footer from "./components/footer/Footer";
import User from "./pages/user/User";
import Recipe from "./pages/recipe/Recipe";
import { QueryClient, QueryClientProvider } from "react-query";
// import { ReactQueryDevtools } from "react-query/devtools";
import { Provider } from "react-redux";
import { store } from "./Redux/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const appStylez = {
  //backgroundColor: "#FAF9F6",
  height: "100vh",
};

const queryClient = new QueryClient();

function App() {
  return (
    <Provider store={store}>
      <div className="App" style={appStylez}>
        <React.Fragment>
          <Navbar />
          <QueryClientProvider client={queryClient}>
            <Routes>
              <Route exact path="/" element={<ComeWithUs initChoice={false} />}/>
              <Route exact path="/user/dash" element={<Dashboard />} />
              <Route exact path="/user/create/recipe" element={<CreateRecipe />}/>
              <Route exact path="/user/profile" element={<UserProfile />} />
              <Route exact path="/user/recipe/update" element={<UpdateRecipe />} />
              <Route exact path="/user/recipe" element={<Recipe />} />
              <Route exact path="/user/user/:id" element={<User />} />
              <Route exact path="/user/notes" element={<Notifications payload={{page: 1, size: 5}} command="user_notes"/>} />
            </Routes>
            {/* <ReactQueryDevtools initialIsOpen={false} position="bottom-right" /> */}
          </QueryClientProvider>
          <Footer />
        </React.Fragment>
        <ToastContainer />
      </div>
    </Provider>
  );
}

export default App;
