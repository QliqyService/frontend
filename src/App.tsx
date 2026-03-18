import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./lib/auth";
import { FormCreatePage } from "./pages/FormCreatePage";
import { FormDetailsPage } from "./pages/FormDetailsPage";
import { FormEditPage } from "./pages/FormEditPage";
import { FormsListPage } from "./pages/FormsListPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PublicFormPage } from "./pages/PublicFormPage";


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/public/forms/:formId" element={<PublicFormPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/forms" replace />} />
            <Route path="forms" element={<FormsListPage />} />
            <Route path="forms/new" element={<FormCreatePage />} />
            <Route path="forms/:formId" element={<FormDetailsPage />} />
            <Route path="forms/:formId/edit" element={<FormEditPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
