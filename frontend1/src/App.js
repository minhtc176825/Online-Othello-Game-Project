import "./App.css";
import { Route } from "react-router";
import Home from "./routes/Home";
import Main from "./routes/Main";
import Multi from "./routes/modes/Multi";
import Game from "./routes/Game";
import Single from "./routes/modes/Single";

function App() {
  return (
    <div className="App">
      <Route path="/" component={Home} exact />
      <Route path="/main" component={Main} />
      <Route path="/multi" component={Multi} />
      <Route path="/game" component={Game} />
      <Route path="/single" component={Single} />
    </div>
  );
}

export default App;
