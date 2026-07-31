import styles from '../dashboard.module.css';

export default function CoordinadorDashboard() {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2>Panel Coordinador</h2>
        <ul style={{ marginTop: '2rem', listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '1rem' }}>Revisión de Informes</li>
          <li>Estadísticas</li>
        </ul>
      </aside>
      <main className={styles.mainContent}>
        <h1 className={styles.title}>Consolidado de Informes</h1>
        <div className={styles.card}>
          <h3>Informes Pendientes de Revisión</h3>
          <p>No hay informes pendientes en este momento.</p>
          {/* Aquí consumiremos el endpoint GET /informes de nuestra API */}
        </div>
      </main>
    </div>
  );
}