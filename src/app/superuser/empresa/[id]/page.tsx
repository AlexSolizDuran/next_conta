"use client"

import { apiFetcher } from "@/lib/apiFetcher";
import { EmpresaGet } from "@/types/empresa/empresa";
import { use } from "react";
import useSWR from "swr";

export default function page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const url = `/api/empresa/empresa`;

    const { data: empresa, error, isLoading } = useSWR<EmpresaGet>(
        `${url}/${id}`,
        apiFetcher
    );

    if (isLoading) return <div>Cargando empresa...</div>;
    if (error) return <div>Error cargando empresa</div>;
    if (!empresa) return <div>No se encontró la empresa</div>;

    const handleDownload = async (usuario_id: string) => {
        try {
            const query = new URLSearchParams({
                empresa_id: empresa.id,
                usuario_id,
            });
            const res = await fetch(`/api/log/download?${query.toString()}`, {
                method: "GET",
            });

            if (!res.ok) throw new Error("Error descargando el log");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `log_${empresa.id}_${usuario_id}.json`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert("No se pudo descargar el log");
        }
    };

    return (
        <div>
            <h1>
                Empresa: {empresa.nombre} ({empresa.nit})
            </h1>
            <h2>Usuarios</h2>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                    <tr>
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>Nombre</th>
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>Apellido</th>
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>Username</th>
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>Roles</th>
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {empresa.usuarios.map((user) => (
                        <tr key={user.id}>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.usuario.persona.nombre}</td>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.usuario.persona.apellido}</td>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.usuario.username}</td>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                                {user.roles.map(r => r).join(", ")}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                                <button
                                    onClick={() => handleDownload(user.usuario.id)}
                                    style={{ padding: "4px 8px", background: "#0070f3", color: "#fff", borderRadius: "4px" }}
                                >
                                    Descargar Log
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
