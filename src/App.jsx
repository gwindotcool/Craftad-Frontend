import { useState } from "react";

import { globalStyle } from "./theme";

import LandingPage from "./pages/landing/LandingPage.jsx";
import AuthPage from "./components/auth/AuthPage.jsx";

import Sidebar from "./components/Sidebar";
import Notifs from "./components/Notifs";


// customer
import CustomerHome from "./pages/customer/CustomerHome";
import PostJob from "./pages/customer/PostJob";
import CustomerWallet from "./pages/customer/CustomerWallet";


// artisan
import ForYou from "./pages/artisan/ForYou";
import ActiveJobs from "./pages/artisan/ActiveJobs";
import JobHistory from "./pages/artisan/JobHistory";
import ArtisanProfile from "./pages/artisan/ArtisanProfile";
import ArtisanWallet from "./pages/artisan/ArtisanWallet";


// admin
import AdminHome from "./pages/admin/AdminHome";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";
import AdminEarnings from "./pages/admin/AdminEarnings";


export default function App(){


    const [token,setToken] = useState(
        localStorage.getItem("token")
    );


    const getStoredUser = () => {
        try {
            const storedUser = localStorage.getItem("user");

            if (!storedUser || storedUser === "undefined") {
                return null;
            }

            return JSON.parse(storedUser);
        } catch {
            localStorage.removeItem("user");
            return null;
        }
    };

    const [user, setUser] = useState(getStoredUser());

    const [page,setPage] = useState("home");


// NEW
    const [showAuth,setShowAuth] = useState(false);


    const onAuth=(tok,usr)=>{

        localStorage.setItem("token", tok);
        localStorage.setItem(
            "user",
            JSON.stringify(usr)
        );

        setToken(tok);
        setUser(usr);
        setPage("home");

    };



    const logout=()=>{

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
        setShowAuth(false);

    };



    /*
    =========================
    PUBLIC AREA
    =========================
    */


    if(!token){


        return (

            <>
                <style>{globalStyle}</style>


                {
                    showAuth

                        ?

                        <AuthPage
                            onAuth={onAuth}
                        />


                        :

                        <LandingPage
                            onLogin={()=>setShowAuth(true)}
                        />


                }


            </>


        )


    }





    /*
    =========================
    PRIVATE DASHBOARD
    =========================
    */


    const role=user?.role || "customer";



    const PAGES={


        customer:{


            home:

                <CustomerHome
                    token={token}
                    user={user}
                />,


            post:

                <PostJob
                    token={token}
                    onPost={()=>setPage("home")}
                />,


            wallet:

                <CustomerWallet
                    token={token}
                />,


            notifs:

                <Notifs
                    token={token}
                />


        },





        artisan:{


            home:

                <ForYou
                    token={token}
                />,


            active:

                <ActiveJobs
                    token={token}
                />,


            history:

                <JobHistory
                    token={token}
                />,


            profile:

                <ArtisanProfile
                    token={token}
                />,


            wallet:

                <ArtisanWallet
                    token={token}
                />,


            notifs:

                <Notifs
                    token={token}
                />


        },




        admin:{


            home:

                <AdminHome
                    token={token}
                />,


            users:

                <AdminUsers
                    token={token}
                />,


            earnings:

                <AdminEarnings
                    token={token}
                />,


            withdrawals:

                <AdminWithdrawals
                    token={token}
                />


        }


    };





    return (

        <>

            <style>{globalStyle}</style>


            <div
                style={{
                    display:"flex",
                    minHeight:"100vh"
                }}
            >


                <Sidebar

                    user={user}

                    page={page}

                    setPage={setPage}

                    logout={logout}

                />



                <main

                    style={{

                        flex:1,

                        padding:"28px 32px",

                        overflowY:"auto"

                    }}

                >


                    <div

                        style={{

                            maxWidth:860,

                            margin:"0 auto"

                        }}

                    >


                        {
                            PAGES[role]?.[page]
                            ||
                            PAGES[role]?.home
                        }


                    </div>


                </main>



            </div>


        </>


    )


}