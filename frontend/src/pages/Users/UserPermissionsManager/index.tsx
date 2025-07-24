import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Permissions } from "../../../@types/PermissoesRequests";

export function UserPermissionsManager() {
    const [permissoes, setPermissoes] = useState<Permissions[]>()
    const navigate = useNavigate();

    return ( 
        <div className="mt-4">
            <div className="flex justify-between mb-3">
                <h2>Permissões</h2>
                <a className="" onClick={() => navigate(`/permissoes`)}>Gerenciar permissões</a>
            </div> 

            <table className="table table-striped text-lg">
                <thead>
                    <tr>
                        <th className="text-nowrap">Nome</th>
                        <th className="text-nowrap">Descrição</th>
                        <th className="text-nowrap">Status</th>
                    </tr>
                </thead>
                <tbody>
                                
                </tbody>
                <tfoot>
                    <tr>
                    </tr>
                </tfoot>
            </table>
        </div>
    )
}