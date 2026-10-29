import { useEffect, useState } from "react";
import { C, fmtMoney, fmtDate } from "../../theme";
import { api } from "../../api";

import {
    Card,
    Btn,
    Spinner,
    Empty,
    Badge,
    Toast
} from "../../components/ui";


export default function AdminWithdrawals({token}) {


    const [withdrawals,setWithdrawals] = useState([]);

    const [loading,setLoading] = useState(true);

    const [toast,setToast] = useState(null);



    const toast$ = (msg,type="success")=>{

        setToast({
            msg,
            type
        });

        setTimeout(
            ()=>setToast(null),
            3000
        );

    };



    const load = async()=>{

        try{

            const d =
                await api.get(
                    "/api/wallet/history",
                    token
                );


            setWithdrawals(
                d.data || d
            );


        }catch(e){

            toast$(e.message,"error");

        }
        finally{

            setLoading(false);

        }

    };



    useEffect(()=>{

        load();

    },[]);





    const approve = async(id)=>{


        if(
            !confirm(
                "Approve this withdrawal?"
            )
        ) return;


        try{

            await api.patch(
                `/api/wallet/approve/${id}`,
                {},
                token
            );


            toast$(
                "Withdrawal approved"
            );


            load();


        }catch(e){

            toast$(
                e.message,
                "error"
            );

        }

    };






    const reject = async(id)=>{


        if(
            !confirm(
                "Reject this withdrawal?"
            )
        ) return;



        try{


            await api.patch(
                `/api/wallet/reject/${id}`,
                {},
                token
            );


            toast$(
                "Withdrawal rejected"
            );


            load();



        }catch(e){

            toast$(
                e.message,
                "error"
            );

        }

    };





    if(loading)
        return <Spinner/>;




    return (

        <div>


            <Card
                style={{
                    background:
                        "linear-gradient(135deg,#0A1628,#1F3A5F)",
                    color:"#fff",
                    padding:28,
                    marginBottom:25
                }}
            >

                <h1>
                    💸 Withdrawal Requests
                </h1>

                <p style={{
                    opacity:.7
                }}>
                    Review and process artisan payments
                </p>


            </Card>





            <Card>


                {
                    withdrawals.length===0

                        ?

                        <Empty
                            icon="💰"
                            msg="No withdrawal requests"
                        />


                        :


                        withdrawals.map(w=>(


                            <div
                                key={w._id}
                                style={{
                                    padding:18,
                                    marginBottom:12,
                                    border:
                                        `1px solid ${C.border}`,
                                    borderRadius:12
                                }}
                            >


                                <div
                                    style={{
                                        display:"flex",
                                        justifyContent:"space-between",
                                        marginBottom:12
                                    }}
                                >

                                    <div>


                                        <h3 style={{
                                            margin:0
                                        }}>
                                            {w.user?.fullName}
                                        </h3>


                                        <small>
                                            {w.user?.email}
                                        </small>


                                    </div>


                                    <Badge
                                        status={w.status}
                                    />


                                </div>





                                <div
                                    style={{
                                        display:"grid",
                                        gridTemplateColumns:
                                            "repeat(auto-fit,minmax(150px,1fr))",
                                        gap:10,
                                        marginBottom:15
                                    }}
                                >

                                    <div>
                                        Amount
                                        <strong>
                                            {fmtMoney(w.amount)}
                                        </strong>
                                    </div>


                                    <div>
                                        Bank
                                        <strong>
                                            {w.bankName}
                                        </strong>
                                    </div>


                                    <div>
                                        Account
                                        <strong>
                                            {w.accountNumber}
                                        </strong>
                                    </div>


                                    <div>
                                        Date
                                        <strong>
                                            {fmtDate(w.createdAt)}
                                        </strong>
                                    </div>


                                </div>





                                {
                                    w.status==="pending"

                                    &&

                                    <div
                                        style={{
                                            display:"flex",
                                            gap:10
                                        }}
                                    >

                                        <Btn
                                            onClick={()=>
                                                approve(w._id)
                                            }
                                        >
                                            ✅ Approve
                                        </Btn>



                                        <Btn
                                            variant="danger"
                                            onClick={()=>
                                                reject(w._id)
                                            }
                                        >
                                            ❌ Reject
                                        </Btn>


                                    </div>

                                }



                            </div>


                        ))

                }


            </Card>


            <Toast
                msg={toast?.msg}
                type={toast?.type}
                onClose={()=>
                    setToast(null)
                }
            />


        </div>

    );

}