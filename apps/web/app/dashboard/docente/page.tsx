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

  const cargarMisInformes = async (cedula: string) => {
    try {
      const respuesta = await fetch(
        `http://127.0.0.1:4000/informes/docente/${cedula}`,
      );
      if (respuesta.ok) {
        const data = await respuesta.json();
        setInformes(data);
      }
    } catch (error) {
      console.error("Error al cargar informes:", error);
    }
  };

  const eliminarInforme = async (id: string) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar este informe? Esta acción no se puede deshacer.",
    );
    if (!confirmar) return;

    try {
      const respuesta = await fetch(
        `http://127.0.0.1:4000/informes/${id}?usuarioId=${usuario?.cedula ?? ""}`,
        {
          method: "DELETE",
        },
      );

      if (respuesta.ok) {
        alert("¡Informe eliminado correctamente!");
        if (usuario?.cedula) {
          cargarMisInformes(usuario.cedula);
        }
      } else {
        alert("Error al eliminar el informe.");
      }
    } catch (error: any) {
      alert("Error de red: " + error.message);
    }
  };

  const entregarInforme = async (
    event: React.ChangeEvent<HTMLInputElement>,
    informeId: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("⚠️ Por favor, sube únicamente un archivo en formato PDF.");
      return;
    }

    const confirmar = window.confirm(
      "¿Estás seguro de entregar el informe final firmado? Una vez entregado, pasará a revisión y ya no podrás editarlo."
    );
    if (!confirmar) return;

    try {
      const payload = {
        estado: "Entregado",
        docenteId: usuario?.cedula, 
      };

      const respuesta = await fetch(
        `http://127.0.0.1:4000/informes/${informeId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (respuesta.ok) {
        alert("¡Informe firmado y entregado con éxito!");
        if (usuario?.cedula) cargarMisInformes(usuario.cedula);
      } else {
        alert("Hubo un error al intentar cambiar el estado del informe.");
      }
    } catch (error: any) {
      alert("Error de red: " + error.message);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    router.push("/login");
  };

  // 👇 Ahora simplemente redirige sin validaciones
  const manejarNuevoInforme = () => {
    router.push("/dashboard/docente/nuevo");
  };

  return (
    <div className={styles.container}>
      {/* BARRA LATERAL */}
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
          <li style={{ marginBottom: "1rem" }}>
            <span
              onClick={manejarNuevoInforme}
              style={{
                color: "inherit",
                textDecoration: "none",
                cursor: "pointer",
                display: "block",
              }}
              title="Crear nuevo informe"
            >
              + Nuevo Informe
            </span>
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

            {/* 👇 Botón desbloqueado */}
            <button
              onClick={manejarNuevoInforme}
              style={{
                padding: "0.6rem 1.2rem",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              title="Crear nuevo informe"
            >
              + Nuevo Informe
            </button>
          </div>

          {informes.length === 0 ? (
            <p style={{ color: "#777" }}>
              Aún no has creado ningún informe.
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
                    <th
                      style={{
                        padding: "12px",
                        borderBottom: "2px solid #d1d5db",
                        textAlign: "center",
                      }}
                    >
                      Progreso
                    </th>
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
                            backgroundColor:
                              informe.estado === "Entregado"
                                ? "#10b981"
                                : "#f59e0b",
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

                      <td
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          width: "150px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <div
                            style={{
                              width: "100%",
                              backgroundColor: "#e5e7eb",
                              borderRadius: "10px",
                              height: "8px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${informe.progreso || 0}%`,
                                backgroundColor:
                                  informe.progreso === 100
                                    ? "#2ecc71"
                                    : "#3498db",
                                height: "100%",
                                transition: "width 0.3s ease",
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: "0.85em",
                              color: "#555",
                              fontWeight: "bold",
                            }}
                          >
                            {informe.progreso || 0}%
                          </span>
                        </div>
                      </td>

                      <td
                        style={{
                          padding: "12px",
                          display: "flex",
                          gap: "10px",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {informe.progreso === 100 &&
                          informe.estado === "Borrador" && (
                            <label
                              style={{
                                backgroundColor: "#10b981",
                                color: "white",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "0.9em",
                                fontWeight: "bold",
                                margin: 0,
                              }}
                            >
                              Subir Firmado
                              <input
                                type="file"
                                accept="application/pdf"
                                style={{ display: "none" }}
                                onChange={(e) => entregarInforme(e, informe._id)}
                              />
                            </label>
                          )}

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
                          {informe.estado === "Entregado"
                            ? "Ver Informe"
                            : "Ver / Editar"}
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