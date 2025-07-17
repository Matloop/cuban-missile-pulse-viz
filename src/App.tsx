// src/App.tsx

import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Importe suas páginas e a nova SplashScreen
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SplashScreen from "./components/SplashScreen"; // Verifique o caminho correto

const queryClient = new QueryClient();

const App: React.FC = () => {
  // Estado para controlar a exibição da tela de início
  const [isStarted, setIsStarted] = useState<boolean>(false);

  // Função para ser passada para a SplashScreen e atualizar o estado
  const handleStart = () => {
    setIsStarted(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        {/* Renderização condicional baseada no estado */}
        {!isStarted ? (
          // Se não começou, mostra a SplashScreen
          <SplashScreen onStart={handleStart} />
        ) : (
          // Se já começou, mostra o conteúdo principal com as rotas
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADICIONE TODAS AS ROTAS CUSTOMIZADAS ACIMA DA ROTA CATCH-ALL "*" */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        )}

      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;