import { useState } from "react";
import { api } from "../../api";

import { Btn, Inp, Sel, ErrBox, Card } from "../ui";


export default function AuthCard({onAuth}){


    const [mode,setMode] = useState("login");


    const [form,setForm]=useState({

        fullName:"",
        phone:"",
        email:"",
        password:"",
        role:"customer"

    });


    const [loading,setLoading]=useState(false);

    const [error,setError]=useState("");



    const update=(key)=>(e)=>{

        setForm(prev=>({

            ...prev,

            [key]:e.target.value

        }));

    };




    const submit=async()=>{


        setError("");



        if(!form.email || !form.password){

            setError(
                "Email and password are required"
            );

            return;

        }



        if(mode==="register" && (!form.fullName || !form.phone)){

            setError(
                "Name and phone are required"
            );

            return;

        }



        try{


            setLoading(true);



            if(mode==="register"){


                await api.post(
                    "/api/auth/register",
                    form
                );


            }



            const res = await api.post(
                "/api/auth/login",
                {

                    email:form.email,

                    password:form.password

                }

            );



            const token = res.token;
            const user = res.user;



            localStorage.setItem(
                "token",
                token
            );



            onAuth(token,user);



        }

        catch (err) {
            setError(err.message || "Authentication failed");
        }

        finally{

            setLoading(false);

        }


    };




    return (


        <Card>


            <div

                style={{
                    width:380
                }}

            >



                <div

                    style={{
                        textAlign:"center",
                        marginBottom:25
                    }}

                >

                    <h2>

                        🔧 ArtisanConnect

                    </h2>


                    <p

                        style={{
                            color:"#64748b"
                        }}

                    >

                        Connect with trusted professionals

                    </p>


                </div>





                <div

                    style={{
                        display:"flex",
                        background:"#f1f5f9",
                        borderRadius:12,
                        padding:5,
                        marginBottom:20
                    }}

                >


                    <button

                        onClick={()=>{

                            setMode("login");

                            setError("");

                        }}

                        style={{

                            flex:1,

                            padding:10,

                            border:0,

                            borderRadius:8,

                            background:

                                mode==="login"

                                    ?

                                    "white"

                                    :

                                    "transparent"

                        }}

                    >

                        Login

                    </button>



                    <button

                        onClick={()=>{

                            setMode("register");

                            setError("");

                        }}

                        style={{

                            flex:1,

                            padding:10,

                            border:0,

                            borderRadius:8,

                            background:

                                mode==="register"

                                    ?

                                    "white"

                                    :

                                    "transparent"

                        }}

                    >

                        Register

                    </button>



                </div>





                {

                    mode==="register" &&

                    <>


                        <Inp

                            label="Full Name"

                            placeholder="John Doe"

                            value={form.fullName}

                            onChange={update("fullName")}

                        />



                        <Inp

                            label="Phone"

                            placeholder="08012345678"

                            value={form.phone}

                            onChange={update("phone")}

                        />



                        <Sel

                            label="Account Type"

                            value={form.role}

                            onChange={update("role")}

                        >


                            <option value="customer">

                                I need a service

                            </option>


                            <option value="artisan">

                                I provide services

                            </option>


                        </Sel>



                    </>

                }




                <Inp

                    label="Email"

                    type="email"

                    placeholder="example@gmail.com"

                    value={form.email}

                    onChange={update("email")}

                />




                <Inp

                    label="Password"

                    type="password"

                    placeholder="********"

                    value={form.password}

                    onChange={update("password")}

                />





                <ErrBox msg={error}/>





                <Btn

                    full

                    disabled={loading}

                    onClick={submit}

                >

                    {

                        loading

                            ?

                            "Please wait..."

                            :

                            mode==="login"

                                ?

                                "Login →"

                                :

                                "Create Account →"

                    }


                </Btn>



            </div>


        </Card>


    )

}