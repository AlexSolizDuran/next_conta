import { use } from "react";

export default function page({params}:{params:Promise<{id:string}>}){
    const {id} = use(params)

    return (
        <div>
            esta es la vista de {id}
        </div>
    )
}