import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Review from "./pages/Review";
import Thankyou from "./pages/Thankyou";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/review" element={<Review />} />  
      <Route path="/confirm" element={<Thankyou />}/>
    </Routes>
  );
}

export default App;
