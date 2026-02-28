import { BrowserRouter } from "react-router-dom";
import CrmRoutes from "./routes/CrmRoutes";

function App() {
  return (
    <BrowserRouter>
      <CrmRoutes />
    </BrowserRouter>
  );
}

export default App;