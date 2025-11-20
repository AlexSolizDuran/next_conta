"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { EmpresaList } from "@/types/empresa/empresa";
import { UserEmpresaData } from "@/types/empresa/user_empresa_data";
import { LoginEmpresa } from "@/types/empresa/login_empresa";
import CrearEmpresaModal from "@/components/modals/EmpresaModal";
import ButtonInput from "@/components/ButtonInput";
import DashboardContent from "@/components/DashSuscripcion";
export default function EmpresasPage() {

  return (
    <DashboardContent/>
  );

}
