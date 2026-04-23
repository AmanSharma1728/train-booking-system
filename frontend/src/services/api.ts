import type { User } from "../types/Auth";
import type { Train, Passenger, Ticket, ClassCode } from "../types/Booking";
import type { HoldResponse, RazorpayInitResponse } from "../types/ApiResponse";

const BASE_URL = 'http://localhost:3000/api/v1';

const fetchAuth = async(endpoint:string,options:RequestInit ={})=>{
    const token = localStorage.getItem('token');
    const headers = {
        'Content-type':'application/json',
        ...(token && {Authorization: `Bearer ${token}`})
    };

    const res = await fetch(`${BASE_URL}${endpoint}`,{...options,headers});

    if(!res.ok){
        const errorData = await res.json().catch(()=>({error:res.statusText}));
        throw new Error(errorData.error || res.statusText);
    }

    return res.json();
}


export const api = {
    login : async (email:string,password:string):Promise<User>=>{
        const data = await fetchAuth('/auth/login',{
            method:'POST',body:JSON.stringify({
                email,password
            })
        });
        localStorage.setItem('token',data.token);
        return data.user;
    },

    register: async(name:string, email:string, password:string, age:number, gender:User["gender"]):Promise<User>=>
    {
        const data = await fetchAuth('/auth/register',{
            method:'POST',body:JSON.stringify({
                name, email, password, age, gender
            })
        });
        localStorage.setItem('token',data.token);
        return data.user;
    },

    getMe: async(): Promise<User> =>{
        const data = await fetchAuth('/auth/me');
        return data.user;
    },

    searchTrains: async(src:string,dest:string,date:string):Promise<Train[]>=>{
        return fetchAuth(`/trains?source=${src}&destination=${dest}&date=${date}`)
    },

    getAvailability: async(trainId:string,date:string)=>{
        return fetchAuth(`/trains/${trainId}/availability?date=${date}`);
    },

    holdSeat: async(trainId:string, date:string, classCode:ClassCode, passengers:Passenger[]):Promise<HoldResponse>=>{
        return fetchAuth('/bookings/hold',{
            method:'POST',body:JSON.stringify({
                trainId,date,classCode,passengers 
            })
        });

    },

    // Asks the backend to create a Razorpay order for this hold.
    // Backend returns a hosted payment URL; we redirect the user there immediately.
    // After payment, Razorpay redirects to our /booking/result page with the bookingId.
    initiatePayment: async (holdId: string): Promise<void> => {
        const data: RazorpayInitResponse = await fetchAuth(`/bookings/${holdId}/confirm`, {
            method: 'POST',
        });
        window.location.href = data.paymentUrl;
    },

    // Called on the /booking/result page after Razorpay redirects back.
    getBooking: async (bookingId: string): Promise<Ticket> => {
        return fetchAuth(`/bookings/${bookingId}`);
    },

    getHistory: async (): Promise<Ticket[]> => {
        return fetchAuth('/bookings/history');
    },


    cancelBooking: async (bookingId: string): Promise<{ success: boolean; message: string }> => {
        return fetchAuth(`/bookings/${bookingId}/cancel`, { method: 'POST' });
    }




}