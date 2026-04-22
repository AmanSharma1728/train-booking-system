import { api } from "../services/api";
import type { User } from "../types/Auth";
import type { AuthContextType } from "../types/Auth";
import { createContext, useEffect, useState, type ReactNode } from "react";

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({children}:{children:ReactNode})=>{
    const [user,setUser] = useState<User|null>(null);
    const [loading,setLoading] = useState(true);

    useEffect(()=>{
        const initAuth = async ()=>{
            const token = localStorage.getItem('token');
            if(token){
                try{
                    const u = await api.getMe();
                    setUser(u);
                }catch{
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        initAuth();
        
    },[]);

    const login  = async (email:string,password:string)=>{
        setLoading(true);
        try{
            const u = await api.login(email,password);
            setUser(u);
        }finally{
            setLoading(false);
        }
    };


    const register = async (name:string, email:string, password:string, age:number, gender:User["gender"])=>{
        setLoading(true);
        try{
            const u = await api.register(name, email, password, age, gender);
            setUser(u);
        }finally{
            setLoading(false);
        }
    }

    const logout = ()=>{
        localStorage.removeItem('token');
        setUser(null);
    }


    return (
        <AuthContext value={{user,login,register,logout,loading}}>
        {children}
        </AuthContext>
    );


};
