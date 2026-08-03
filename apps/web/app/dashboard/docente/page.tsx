/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../dashboard.module.css";
import Link from "next/link";

export default function DocenteDashboard() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [informes, setInformes] = useState<any[]>([]);

  // 1. Cargar datos del usuario y sus informes al entrar
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      const datosUsuario = JSON.parse(usuarioGuardado);
      setUsuario(datosUsuario);
      cargarMisInformes(datosUsuario.cedula);
    } else {
      router.push("/login");
    }
  }, [router]);

  // 2. Función para obtener los informes desde el backend
  const cargarMisInformes = async (cedula: string) => {
    try {
      const respuesta = await fetch(
        `http://localhost:4000/informes/docente/${cedula}`,
      );
      if (respuesta.ok) {
        const data = await respuesta.json();
        setInformes(data);
      }
    } catch (error) {
      console.error("Error al cargar informes:", error);
    }
  };

  // 👇 NUEVO: Función para eliminar un informe
  const eliminarInforme = async (id: string) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar este informe? Esta acción no se puede deshacer.",
    );
    if (!confirmar) return;

    try {
      const respuesta = await fetch(`http://localhost:4000/informes/${id}`, {
        method: "DELETE",
      });

      if (respuesta.ok) {
        alert("¡Informe eliminado correctamente!");
        // Recargamos la tabla automáticamente
        if (usuario?.cedula) {
          cargarMisInformes(usuario.cedula);
        }
      } else {
        alert("Hubo un error al eliminar el informe.");
      }
    } catch (error: any) {
      alert("Error de red: " + error.message);
    }
  };

  // 3. Función para cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    router.push("/login");
  };

  return (
    <div className={styles.container}>
      {/* BARRA LATERAL (Con tus estilos originales) */}
      <aside className={styles.sidebar}>
        <h2>Panel Docente</h2>
        <ul style={{ marginTop: "2rem", listStyle: "none", padding: 0 }}>
          <li
            style={{
              marginBottom: "1rem",
              color: "#60a5fa",
              fontWeight: "bold",
            }}
          >
            Mis Informes
          </li>
          <li>
            <Link
              href="/dashboard/docente/nuevo"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              + Nuevo Informe
            </Link>
          </li>
          <li style={{ marginBottom: "1rem" }}>
            <Link
              href="/dashboard/docente/cambiar-clave"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              Cambiar Contraseña
            </Link>
          </li>
        </ul>

        {/* Botón de cerrar sesión en la barra lateral */}
        <button
          onClick={cerrarSesion}
          style={{
            marginTop: "3rem",
            width: "100%",
            backgroundColor: "#e74c3c",
            color: "white",
            padding: "10px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Cerrar Sesión
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className={styles.mainContent}>
        <h1 className={styles.title}>
          Bienvenido, Docente {usuario?.nombres || ""}
        </h1>

        <div className={styles.card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <h3 style={{ margin: 0 }}>Informes Recientes</h3>
            <Link href="/dashboard/docente/nuevo">
              <button
                style={{
                  padding: "0.6rem 1.2rem",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                + Nuevo Informe
              </button>
            </Link>
          </div>

          {/* Renderizado condicional: Mensaje vacío o Tabla */}
          {informes.length === 0 ? (
            <p style={{ color: "#777" }}>
              Aún no has creado ningún informe para este período académico.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: "10px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#f3f4f6",
                      textAlign: "left",
                      color: "#374151",
                    }}
                  >
                    <th
                      style={{
                        padding: "12px",
                        borderBottom: "2px solid #d1d5db",
                      }}
                    >
                      Período
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        borderBottom: "2px solid #d1d5db",
                      }}
                    >
                      Estado
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        borderBottom: "2px solid #d1d5db",
                      }}
                    >
                      Fecha de Creación
                    </th>
                    {/* 👇 NUEVA COLUMNA DE CABECERA */}
                    <th
                      style={{
                        padding: "12px",
                        borderBottom: "2px solid #d1d5db",
                        textAlign: "center",
                      }}
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {informes.map((informe) => (
                    <tr
                      key={informe._id}
                      style={{ borderBottom: "1px solid #e5e7eb" }}
                    >
                      <td style={{ padding: "12px" }}>
                        {informe.periodoAcademico}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            backgroundColor: "#f59e0b",
                            color: "#fff",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          {informe.estado}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          fontSize: "0.9rem",
                          color: "#6b7280",
                        }}
                      >
                        {new Date(informe.createdAt).toLocaleDateString()}
                      </td>

                      {/* 👇 NUEVOS BOTONES DE ACCIÓN */}
                      <td
                        style={{
                          padding: "12px",
                          display: "flex",
                          gap: "10px",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/docente/nuevo?id=${informe._id}`,
                            )
                          }
                          style={{
                            backgroundColor: "#3498db",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.9em",
                          }}
                        >
                          Ver / Editar
                        </button>

                        <button
                          onClick={() => eliminarInforme(informe._id)}
                          style={{
                            backgroundColor: "#e74c3c",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.9em",
                          }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
