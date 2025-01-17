import React, { createContext, useContext, useReducer } from 'react';

const ListingsContext = createContext();

const listingsReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LISTINGS':
            return { ...state, listings: action.payload };
        case 'ADD_LISTING':
            return { ...state, listings: [...state.listings, action.payload] };
        case 'UPDATE_LISTING':
            return {
                ...state,
                listings: state.listings.map(listing =>
                    listing.id === action.payload.id ? action.payload : listing
                )
            };
        case 'DELETE_LISTING':
            return {
                ...state,
                listings: state.listings.filter(listing => listing.id !== action.payload)
            };
        default:
            return state;
    }
};

export const ListingsProvider = ({ children }) => {
    const [state, dispatch] = useReducer(listingsReducer, { listings: [] });

    return (
        <ListingsContext.Provider value={{ state, dispatch }}>
            {children}
        </ListingsContext.Provider>
    );
};