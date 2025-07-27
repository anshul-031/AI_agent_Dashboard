
import { renderHook, act } from '@testing-library/react';
import { useToast, toast, reducer } from '../use-toast';

// Mock timers
jest.useFakeTimers();

describe('useToast', () => {
  it('should add and dismiss a toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: 'Test Toast' });
    });

    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toasts[0].title).toBe('Test Toast');

    act(() => {
      result.current.dismiss(result.current.toasts[0].id);
    });
  });
});

describe('toast reducer', () => {
  it('should handle ADD_TOAST', () => {
    const initialState = { toasts: [] };
    const newToast = { id: '1', title: 'New Toast', open: true, onOpenChange: () => {} };
    const action = { type: 'ADD_TOAST', toast: newToast };
    const state = reducer(initialState, action);
    expect(state.toasts).toEqual([newToast]);
  });

  it('should handle UPDATE_TOAST', () => {
    const initialState = { toasts: [{ id: '1', title: 'Old Toast', open: true, onOpenChange: () => {} }] };
    const updatedToast = { id: '1', title: 'Updated Toast' };
    const action = { type: 'UPDATE_TOAST', toast: updatedToast };
    const state = reducer(initialState, action);
    expect(state.toasts[0].title).toBe('Updated Toast');
  });

  it('should handle DISMISS_TOAST', () => {
    const initialState = { toasts: [{ id: '1', title: 'Toast', open: true, onOpenChange: () => {} }] };
    const action = { type: 'DISMISS_TOAST', toastId: '1' };
    const state = reducer(initialState, action);
    expect(state.toasts[0].open).toBe(false);
  });

  it('should handle REMOVE_TOAST without a toastId', () => {
    const initialState = { toasts: [{ id: '1', title: 'Toast', open: true, onOpenChange: () => {} }] };
    const action = { type: 'REMOVE_TOAST' };
    const state = reducer(initialState, action);
    expect(state.toasts.length).toBe(0);
  });
});
