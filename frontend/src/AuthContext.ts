import React from 'react';

export const Context = React.createContext({} as {
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>,
  sidebar: boolean,
  setSidebar: React.Dispatch<React.SetStateAction<boolean>>
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>
  theme: 'light' | 'dark',
  loading: boolean,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  isSuperAdmin: boolean,
  name: string,
  userName: string,
});