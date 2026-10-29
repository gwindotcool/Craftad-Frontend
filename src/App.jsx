<<<<<<< HEAD
import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./components/RequireAuth";
import { SessionProvider } from "./session";
import { Auth } from "./pages/Auth";
import { Chat } from "./pages/Chat";
import { ChatInbox } from "./pages/ChatInbox";
import { Dashboard } from "./pages/Dashboard";
import { Home } from "./pages/Home";
import { JobDetail } from "./pages/JobDetail";
import { Jobs } from "./pages/Jobs";
import { NewJob } from "./pages/NewJob";
import { Notifications } from "./pages/Notifications";
import { WalletPage } from "./pages/WalletPage";

export default function App() {
  return (
    <SessionProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/jobs" element={<RequireAuth><Jobs /></RequireAuth>} />
        <Route path="/jobs/new" element={<RequireAuth><NewJob /></RequireAuth>} />
        <Route path="/jobs/:jobId" element={<RequireAuth><JobDetail /></RequireAuth>} />
        <Route path="/chat" element={<RequireAuth><ChatInbox /></RequireAuth>} />
        <Route path="/chat/:jobId" element={<RequireAuth><Chat /></RequireAuth>} />
        <Route path="/wallet" element={<RequireAuth><WalletPage /></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SessionProvider>
  );
}
=======
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
>>>>>>> 89413558c3ac50fe7a5b979ccbe772016af0d5c9
