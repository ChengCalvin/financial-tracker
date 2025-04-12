import { createContext, useContext } from "react";

interface CashFlowContextType {
    // user: null;
    // signIn: (userCredentials: any) => Promise<void>;
    // signOut: () => Promise<void>;
}


export const CashFlowContext = createContext<CashFlowContextType | null>(null);
export const CashFlowProvider = ({ children }: { children: React.ReactNode }) => {
    
    return (
        <CashFlowContext.Provider value={{}}>
            {children}
        </CashFlowContext.Provider>
    )
}

export const useCashFlowContext = () => {
  const context = useContext(CashFlowContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}