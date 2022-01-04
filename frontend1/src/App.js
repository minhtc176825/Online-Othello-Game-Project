import "./App.css";
import { Route } from "react-router";
import Home from "./pages/Home";
import Main from "./pages/Main";
import Single from "./pages/modes/Single";
import Multi from "./pages/modes/Multi";
import Game from "./pages/Game";

function App() {
  return (
    <div className="App">
      <Route path="/" component={Home} exact/>
      <Route path="/main" component={Main} />
      <Route path="/single" component={Single} />
      <Route path="/multi" component={Multi} />
      <Route path="/game" component={Game} />
    </div>
  );
}

export default App;
