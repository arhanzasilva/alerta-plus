import { Component, type ReactNode } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppProvider } from "./context/AppContext";
import { Toaster } from "sonner";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0a2540] text-white gap-4 p-8 text-center">
          <p className="text-[18px] font-semibold font-['Poppins']">
            Algo deu errado.
          </p>
          <button
            className="px-6 py-2 bg-[#2b7fff] rounded-xl text-sm font-['Poppins'] active:scale-95 transition"
            onClick={() => this.setState({ hasError: false })}
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <RouterProvider router={router} />
        <Toaster position="top-center" />
      </AppProvider>
    </ErrorBoundary>
  );
}
