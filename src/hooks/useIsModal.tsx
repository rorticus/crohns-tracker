import { createContext, ReactNode, useContext } from "react";

const ModalContext = createContext(false);

export function ModalProvider({ children }: { children: ReactNode }) {
  return <ModalContext.Provider value={true}>{children}</ModalContext.Provider>;
}

export default function useIsModal() {
  return useContext(ModalContext);
}
