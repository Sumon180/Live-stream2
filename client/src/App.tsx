import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import "./App.css";
import HomePage from "./components/HomePage";
import UploadPage from "./components/UploadPage";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />}></Route>
          <Route path="/UploadPage" element={<UploadPage />}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}
