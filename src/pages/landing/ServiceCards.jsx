const services=[

    ["🔧","Plumbing"],
    ["⚡","Electrical"],
    ["🎨","Painting"],
    ["🪚","Carpentry"],
    ["❄️","AC Repair"],
    ["🧹","Cleaning"]

];


export default function ServiceCards(){


    return (

        <section

            style={{
                padding:"70px 50px"
            }}

        >


            <h2>

                Popular Services

            </h2>



            <div

                style={{
                    display:"grid",
                    gridTemplateColumns:"repeat(3,1fr)",
                    gap:25,
                    marginTop:30
                }}

            >


                {

                    services.map(service=>(


                        <div

                            key={service[1]}

                            style={{

                                padding:30,

                                borderRadius:20,

                                boxShadow:"0 10px 30px #ddd",

                                background:"#fff"

                            }}

                        >


                            <div

                                style={{
                                    fontSize:40
                                }}

                            >

                                {service[0]}

                            </div>


                            <h3>

                                {service[1]}

                            </h3>


                            <p>

                                Professional nearby experts

                            </p>


                        </div>


                    ))

                }



            </div>


        </section>

    )

}
