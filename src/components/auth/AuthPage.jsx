import AuthCard from "./AuthCard";


export default function AuthPage({onAuth}){

    return (

        <div
            style={{
                minHeight:"100vh",
                background:"#0F172A",
                display:"flex",
                alignItems:"center",
                justifyContent:"center"
            }}
        >

            <AuthCard onAuth={onAuth}/>

        </div>

    )

}