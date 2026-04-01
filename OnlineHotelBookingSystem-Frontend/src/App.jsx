import { AuthProvider } from "./context/AuthContext";
import MainRoute from "./routes/MainRoute";

function App() {
  return (
    <AuthProvider>
      <MainRoute />
    </AuthProvider>
  );
}

export default App;