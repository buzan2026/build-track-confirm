import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useCartSync } from "@/hooks/useCartSync";
import LayoutShell from "./components/LayoutShell";
import OrderHistory from "./pages/OrderHistory";
import ReceptionPage from "./pages/ReceptionPage";
import DocumentsPage from "./pages/DocumentsPage";
import ReceptionSuccess from "./pages/ReceptionSuccess";
import StyleGuide from "./pages/StyleGuide";
import OrderDetailPage from "./pages/OrderDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  useCartSync();
  return (
    <Routes>
      <Route element={<LayoutShell />}>
        <Route path="/" element={<OrderHistory />} />
        <Route path="/orders/success" element={<ReceptionSuccess />} />
        <Route path="/orders/:id/reception" element={<ReceptionPage />} />
        <Route path="/orders/:id/documents" element={<DocumentsPage />} />
        <Route path="/orders/:orderNumber" element={<OrderDetailPage />} />
        <Route path="/style-guide" element={<StyleGuide />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
