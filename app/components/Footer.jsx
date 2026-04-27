import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandInfo}>
          <h2>MOTOPILLOS</h2>
          <p>Repuestos OEM originales para el máximo rendimiento. Importado directamente para tu moto.</p>
        </div>
        <div className={styles.links}>
          <div className={styles.column}>
            <h3>Soporte</h3>
            <a href="#">Contáctanos</a>
            <a href="#">Política de Envíos</a>
            <a href="#">Términos y Condiciones</a>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>&copy; 2026 Motopillos. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
