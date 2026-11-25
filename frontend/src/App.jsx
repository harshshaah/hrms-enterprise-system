import { BrowserRouter } from "react-router-dom";

import { Toaster } from "sonner";

import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />

        <Toaster
          position="top-right"
          richColors
          closeButton
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;