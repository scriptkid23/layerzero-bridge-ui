import { create } from 'zustand';

export type TxStepStatus = 'pending' | 'in-progress' | 'completed' | 'error';

export interface TxModalState {
  isOpen: boolean;
  steps: { id: number; title: string; status: TxStepStatus; error?: string }[];
  open: () => void;
  close: () => void;
  setStepStatus: (id: number, status: TxStepStatus, error?: string) => void;
  reset: () => void;
}

export const useTxModalStore = create<TxModalState>((set) => ({
  isOpen: false,
  steps: [
    { id: 1, title: 'Approve', status: 'pending' },
    { id: 2, title: 'Bridge', status: 'pending' },
    { id: 3, title: 'Done', status: 'pending' },
  ],
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setStepStatus: (id, status, error) =>
    set((state) => ({
      steps: state.steps.map((s) =>
        s.id === id ? { ...s, status, error } : s
      ),
    })),
  reset: () =>
    set({
      steps: [
        { id: 1, title: 'Approve', status: 'pending' },
        { id: 2, title: 'Bridge', status: 'pending' },
        { id: 3, title: 'Done', status: 'pending' },
      ],
    }),
})); 