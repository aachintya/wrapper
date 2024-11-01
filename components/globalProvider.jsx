import React, { createContext, useReducer, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, parseISO, addMonths, subMonths } from 'date-fns';
import i18next from 'i18next';

const STORAGE_KEY = 'APP_STATE';

const initialState = {
    transactions: [],
    summary: {
        expense: 0,
        income: 0,
        total: 0
    },
    currentMonth: new Date().toISOString(),
    language: 'en', // Default to 'en' for English language code
    theme: 'light',
    fontLoaded: false,
    hasLaunched: false
};

const globalReducer = (state, action) => {
    let newState;
    
    switch (action.type) {
        case 'SET_FONT_LOADED':
            return {
                ...state,
                fontLoaded: action.payload
            };

        case 'SET_HAS_LAUNCHED':
            return {
                ...state,
                hasLaunched: action.payload
            };

        case 'SET_THEME':
            return {
                ...state,
                theme: action.payload
            };

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

        case 'SET_LANGUAGE':
            return {
                ...state,
                language: action.payload
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

    useEffect(() => {
        const persistLanguage = async () => {
            try {
                if (state.language) {
                    await AsyncStorage.setItem('APP_LANGUAGE', state.language);
                    console.log('Language persisted:', state.language);
                }
            } catch (error) {
                console.error('Error saving language preference:', error);
            }
        };
        
        persistLanguage();
    }, [state.language]);

    useEffect(() => {
        const loadSavedLanguage = async () => {
            try {
                const savedLanguage = await AsyncStorage.getItem('APP_LANGUAGE');
                if (savedLanguage) {
                    dispatch({
                        type: 'SET_LANGUAGE',
                        payload: savedLanguage
                    });
                    console.log('Loaded saved language:', savedLanguage);
                }
            } catch (error) {
                console.error('Error loading language preference:', error);
            }
        };
        
        loadSavedLanguage();
    }, []);

    useEffect(() => {
        if (state.language) {
            i18next.changeLanguage(state.language);
            changeLanguage(state.language);
        }
    }, [state.language]);

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


    const changeLanguage = async (language) => {
        try {
            dispatch({
                type: 'SET_LANGUAGE',
                payload: language
            });
            console.log('Language changed successfully to:', language);
        } catch (error) {
            console.error('Error changing language:', error);
        }
    };

    const setTheme = (theme) => {
        dispatch({
            type: 'SET_THEME',
            payload: theme
        });
    };

    const setFontLoaded = (loaded) => {
        dispatch({
            type: 'SET_FONT_LOADED',
            payload: loaded
        });
    };

    const setHasLaunched = (launched) => {
        dispatch({
            type: 'SET_HAS_LAUNCHED',
            payload: launched
        });
    };

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
            formatDate,
            changeLanguage,
            setTheme,
            setFontLoaded,
            setHasLaunched
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error("useGlobalContext must be used within a GlobalProvider");
    }
    return context;
};
