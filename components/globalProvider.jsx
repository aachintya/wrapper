import React, { createContext, useReducer, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import { format, addMonths, subMonths } from 'date-fns';
import i18next from 'i18next';

const STORAGE_KEY = 'APP_STATE';
const BUDGETS_STORAGE_KEY = 'APP_BUDGETS';
const CATEGORY_BUDGETS_KEY = 'CATEGORY_BUDGETS';

const initialState = {
    transactions: [],
    categories: {
        EXPENSE: [
            'Food & Dining',
            'Transportation', 
            'Shopping',
            'Entertainment',
            'Bills & Utilities',
            'Health & Fitness',
            'Travel',
            'Other'
        ],
        INCOME: [
            'Salary',
            'Business',
            'Investments', 
            'Freelance',
            'Gift',
            'Other'
        ],
        TRANSFER: [
            'Account Transfer',
            'Investment Transfer',
            'Debt Payment',
            'Other'
        ]
    },
    budgets: [],
    categoryBudgets: {},
    summary: {
        expense: 0,
        income: 0,
        total: 0
    },
    currentMonth: new Date().toISOString(),
    language: null,
    theme: 'light',
    fontLoaded: false,
    hasLaunched: false
};

// Initialize database
let db;
(async () => {
    db = await SQLite.openDatabaseAsync('expenses.db');
})();

const globalReducer = (state, action) => {
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
            return {
                ...state,
                transactions: [...state.transactions, action.payload]
            };

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
            return { 
                ...state, 
                transactions: [], 
                summary: initialState.summary 
            };

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
            return {
                ...state,
                transactions: state.transactions.filter(t => t.id !== action.payload)
            };

        case 'EDIT_TRANSACTION':
            const transactionIndex = state.transactions.findIndex(t => t.id === action.payload.id);
            if (transactionIndex >= 0) {
                const transactionsCopy = [...state.transactions];
                transactionsCopy[transactionIndex] = action.payload;
                return {
                    ...state,
                    transactions: transactionsCopy
                };
            }
            return state;

        case 'UPDATE_CATEGORY_BUDGET':
            const newCategoryBudgets = {
                ...state.categoryBudgets,
                [action.payload.categoryId]: action.payload.limit
            };
            // Save updated category budgets to AsyncStorage
            AsyncStorage.setItem(CATEGORY_BUDGETS_KEY, JSON.stringify(newCategoryBudgets));
            return {
                ...state,
                categoryBudgets: newCategoryBudgets
            };

        case 'LOAD_CATEGORY_BUDGETS':
            return {
                ...state,
                categoryBudgets: action.payload
            };

        case 'UPDATE_BUDGET':
            const updatedBudgets = action.payload; // Expecting the full updated budgets array
            AsyncStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(updatedBudgets));
            return {
                ...state,
                budgets: updatedBudgets
            };

        case 'ADD_BUDGET':
            const newBudgets = [...state.budgets, action.payload];
            AsyncStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(newBudgets));
            return {
                ...state,
                budgets: newBudgets
            };

        case 'DELETE_BUDGET':
            const remainingBudgets = state.budgets.filter(budget => budget.id !== action.payload);
            AsyncStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(remainingBudgets));
            return {
                ...state,
                budgets: remainingBudgets
            };

        case 'UPDATE_BUDGET_SPENDING':
            const budgetsWithUpdatedSpending = state.budgets.map(budget => {
                if (budget.id === action.payload.id) {
                    return {
                        ...budget,
                        spent: action.payload.spent
                    };
                }
                return budget;
            });
            AsyncStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgetsWithUpdatedSpending));
            return {
                ...state,
                budgets: budgetsWithUpdatedSpending
            };

        case 'LOAD_EXPENSES':
            return {
                ...state,
                transactions: action.payload,
                summary: {
                    expense: action.payload
                        .filter((t) => t.type === 'EXPENSE')
                        .reduce((sum, t) => sum + t.amount, 0),
                    income: action.payload
                        .filter((t) => t.type === 'INCOME')
                        .reduce((sum, t) => sum + t.amount, 0),
                    total:
                        action.payload
                            .filter((t) => t.type === 'INCOME')
                            .reduce((sum, t) => sum + t.amount, 0) -
                        action.payload
                            .filter((t) => t.type === 'EXPENSE')
                            .reduce((sum, t) => sum + t.amount, 0),
                },
            };

        default:
            return state;
    }
};

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [state, dispatch] = useReducer(globalReducer, initialState);

    useEffect(() => {
        createTable();
        loadExpensesFromDB();
        loadCategoryBudgets();
        loadInitialState(); // Load initial state on app start
    }, []);

    useEffect(() => {
        saveState(state);
    }, [state]);

    useEffect(() => {
        if (state.language) {
            i18next.changeLanguage(state.language);
            console.log('Language set in i18next:', state.language);
        }
    }, [state.language]);

    const loadCategoryBudgets = async () => {
        try {
            const savedBudgets = await AsyncStorage.getItem(CATEGORY_BUDGETS_KEY);
            if (savedBudgets) {
                dispatch({
                    type: 'LOAD_CATEGORY_BUDGETS',
                    payload: JSON.parse(savedBudgets)
                });
            }
        } catch (error) {
            console.error('Error loading category budgets:', error);
        }
    };

    const updateCategoryBudget = async (categoryId, limit) => {
        dispatch({
            type: 'UPDATE_CATEGORY_BUDGET',
            payload: { categoryId, limit }
        });
    };

    const createTable = async () => {
        try {
            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS expenses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT, 
                    amount REAL, 
                    type TEXT, 
                    category TEXT, 
                    account TEXT, 
                    note TEXT, 
                    date TEXT
                );
            `);
            console.log('Table created successfully');
        } catch (error) {
            console.error('Error creating table:', error);
        }
    };

    const addExpense = async (expense) => {
        try {
            const result = await db.runAsync(
                'INSERT INTO expenses (amount, type, category, account, note, date) VALUES (?, ?, ?, ?, ?, ?)',
                [expense.amount, expense.type, expense.category, expense.account, expense.note, expense.date]
            );
            return result;
        } catch (error) {
            throw error;
        }
    };

    const fetchExpenses = async () => {
        try {
            const expenses = await db.getAllAsync('SELECT * FROM expenses');
            return expenses;
        } catch (error) {
            throw error;
        }
    };

    const updateExpense = async (expense) => {
        try {
            const result = await db.runAsync(
                'UPDATE expenses SET amount = ?, type = ?, category = ?, account = ?, note = ?, date = ? WHERE id = ?',
                [expense.amount, expense.type, expense.category, expense.account, expense.note, expense.date, expense.id]
            );
            return result;
        } catch (error) {
            throw error;
        }
    };

    const deleteExpense = async (id) => {
        try {
            const result = await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
            return result;
        } catch (error) {
            console.error('Error deleting transaction:', error);
            throw error;
        }
    };

    const loadExpensesFromDB = async () => {
        try {
            const expenses = await fetchExpenses();
            dispatch({
                type: 'LOAD_EXPENSES',
                payload: expenses,
            });
        } catch (error) {
            console.error('Error loading expenses from DB:', error);
        }
    };

    const onSave = async (transactionData) => {
        try {
            if (transactionData.id && transactionData.isUpdate) {
                await updateExpense({
                    ...transactionData,
                    amount: parseFloat(transactionData.amount),
                    date: transactionData.date ? new Date(transactionData.date).toISOString() : new Date().toISOString(),
                });
            } else {
                await addExpense({
                    amount: parseFloat(transactionData.amount),
                    type: transactionData.type,
                    category: transactionData.category,
                    account: transactionData.account,
                    note: transactionData.note,
                    date: transactionData.date ? new Date(transactionData.date).toISOString() : new Date().toISOString(),
                });
            }
            await loadExpensesFromDB();
        } catch (error) {
            console.error('Error saving transaction:', error);
        }
    };

    const updateBudget = (budgetData) => {
        dispatch({
            type: 'UPDATE_BUDGET',
            payload: budgetData
        });
    };

    const addBudget = (budgetData) => {
        dispatch({
            type: 'ADD_BUDGET',
            payload: {
                id: Date.now().toString(),
                ...budgetData
            }
        });
    };

    const deleteBudget = (budgetId) => {
        dispatch({
            type: 'DELETE_BUDGET',
            payload: budgetId
        });
    };

    const updateBudgetSpending = (budgetId, spent) => {
        dispatch({
            type: 'UPDATE_BUDGET_SPENDING',
            payload: { id: budgetId, spent }
        });
    };

    const loadInitialState = async () => {
        try {
            const savedState = await AsyncStorage.getItem(STORAGE_KEY);
            if (savedState) {
                dispatch({ type: 'LOAD_STATE', payload: JSON.parse(savedState) });
            }

            const savedLanguage = await AsyncStorage.getItem('APP_LANGUAGE');
            if (savedLanguage) {
                dispatch({ type: 'SET_LANGUAGE', payload: savedLanguage });
                console.log('Loaded saved language:', savedLanguage);
            } else {
                dispatch({ type: 'SET_LANGUAGE', payload: 'en' });
            }
        } catch (error) {
            console.error('Error loading initial state:', error);
        }
    };

    const saveState = async (stateToSave) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (error) {
            console.error('Error saving state:', error);
        }
    };

    const changeLanguage = async (language) => {
        try {
            dispatch({
                type: 'SET_LANGUAGE',
                payload: language
            });
            await AsyncStorage.setItem('APP_LANGUAGE', language);
            console.log('Language changed and saved:', language);
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

    const fetchSpentByCategory = async () => {
        try {
            const result = await db.getAllAsync(`
                SELECT category, SUM(amount) as totalSpent 
                FROM expenses 
                WHERE type = 'EXPENSE' 
                GROUP BY category
            `);
            return result;
        } catch (error) {
            console.error('Error fetching spent by category:', error);
            return [];
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
            setHasLaunched,
            updateBudget,
            addBudget,
            deleteBudget,
            updateBudgetSpending,
            addExpense,
            updateExpense,
            deleteExpense,
            fetchExpenses,
            updateCategoryBudget,
            fetchSpentByCategory,
            loadExpensesFromDB // Add loadExpensesFromDB to the context value
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

export default GlobalProvider;