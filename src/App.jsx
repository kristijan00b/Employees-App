import { useState } from "react";
import Login from "./components/Login";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Employee App</h1>
      <Login />
    </div>
  );
}

export default App;
