import React, { createContext, useReducer, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, parseISO, addMonths, subMonths } from 'date-fns';

const STORAGE_KEY = 'APP_STATE';

const initialState = {
    transactions: [],
    summary: {
        expense: 0,
        income: 0,
        total: 0
    },
    currentMonth: new Date().toISOString() // Store as ISO string
};

const globalReducer = (state, action) => {
    let newState;
    
    switch (action.type) {
        case 'ADD_TRANSACTION':
            const updatedTransactions = [...state.transactions, action.payload];
            const expense = updatedTransactions
                .filter(t => t.type === 'EXPENSE')
                .reduce((sum, t) => sum + t.amount, 0);
            const income = updatedTransactions
                .filter(t => t.type === 'INCOME')
                .reduce((sum, t) => sum + t.amount, 0);

            newState = {
                ...state,
                transactions: updatedTransactions,
                summary: {
                    expense,
                    income,
                    total: income - expense
                }
            };
            return newState;

        case 'NEXT_MONTH':
            return {
                ...state,
                currentMonth: addMonths(new Date(state.currentMonth), 1).toISOString()
            };
            
        case 'PREVIOUS_MONTH':
            return {
                ...state,
                currentMonth: subMonths(new Date(state.currentMonth), 1).toISOString()
            };
    
        case 'CLEAR_TRANSACTIONS':
            newState = { 
                ...state, 
                transactions: [], 
                summary: initialState.summary 
            };
            return newState;
        
        case 'LOAD_STATE':
            return action.payload || initialState;

        case 'SET_MONTH':
            return { 
                ...state, 
                currentMonth: new Date(action.payload).toISOString() 
            };

        case 'DELETE_TRANSACTION':
            const filteredTransactions = state.transactions.filter(t => t.id !== action.payload);
            const newExpense = filteredTransactions
                .filter(t => t.type === 'EXPENSE')
                .reduce((sum, t) => sum + t.amount, 0);
            const newIncome = filteredTransactions
                .filter(t => t.type === 'INCOME')
                .reduce((sum, t) => sum + t.amount, 0);
            
            return {
                ...state,
                transactions: filteredTransactions,
                summary: {
                    expense: newExpense,
                    income: newIncome,
                    total: newIncome - newExpense
                }
            };

            case 'EDIT_TRANSACTION':
                const transactionIndex = state.transactions.findIndex(t => t.id === action.payload.id);
                if (transactionIndex >= 0) {
                    const transactionsCopy = [...state.transactions];
                    transactionsCopy[transactionIndex] = action.payload;
                    
                    const updatedExpense = transactionsCopy
                        .filter(t => t.type === 'EXPENSE')
                        .reduce((sum, t) => sum + t.amount, 0);
                    const updatedIncome = transactionsCopy
                        .filter(t => t.type === 'INCOME')
                        .reduce((sum, t) => sum + t.amount, 0);
    
                    newState = {
                        ...state,
                        transactions: transactionsCopy,
                        summary: {
                            expense: updatedExpense,
                            income: updatedIncome,
                            total: updatedIncome - updatedExpense
                        }
                    };
                    return newState;
                }
                return state;

        default:
            return state;
    }
};

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [state, dispatch] = useReducer(globalReducer, initialState);

    useEffect(() => {
        loadSavedState();
    }, []);

    useEffect(() => {
        saveState(state);
    }, [state]);

    const loadSavedState = async () => {
        try {
            const savedState = await AsyncStorage.getItem(STORAGE_KEY);
            if (savedState) {
                dispatch({ 
                    type: 'LOAD_STATE', 
                    payload: JSON.parse(savedState)
                });
            }
        } catch (error) {
            console.error('Error loading saved state:', error);
        }
    };

    const saveState = async (stateToSave) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (error) {
            console.error('Error saving state:', error);
        }
    };

    const onSave = (transactionData) => {
        // If the transaction has an id and isUpdate flag, it's an edit
        if (transactionData.id && transactionData.isUpdate) {
            dispatch({
                type: 'EDIT_TRANSACTION',
                payload: {
                    ...transactionData,
                    amount: parseFloat(transactionData.amount),
                    date: transactionData.date ? new Date(transactionData.date).toISOString() : new Date().toISOString()
                }
            });
        } else {
            // It's a new transaction
            dispatch({
                type: 'ADD_TRANSACTION',
                payload: {
                    id: Date.now(),
                    amount: parseFloat(transactionData.amount),
                    type: transactionData.type,
                    category: transactionData.category,
                    account: transactionData.account,
                    note: transactionData.note,
                    date: transactionData.date ? new Date(transactionData.date).toISOString() : new Date().toISOString()
                }
            });
        }
    };

    // Helper function to format dates for display
    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'yyyy-MM-dd');
        } catch (error) {
            console.error('Error formatting date:', error);
            return format(new Date(), 'yyyy-MM-dd');
        }
    };

    return (
        <GlobalContext.Provider value={{ 
            state, 
            dispatch, 
            onSave,
            formatDate // Expose formatDate function to components
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

// Hook 
export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error("useGlobalContext must be used within a GlobalProvider");
    }
    return context;
};