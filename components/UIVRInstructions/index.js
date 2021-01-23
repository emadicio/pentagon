import styles from './UIVRInstructions.module.scss';

const UIVRInstructons = () => {
  return (
    <div className={styles.wrapper}>
      <p className={styles.instruction}>
        <span className={styles.icon}>WASD</span> Move
      </p>
      <p className={styles.instruction}>
        <span className={styles.icon}>CLICK</span> Exit VR
      </p>
    </div>
  );
};

export default UIVRInstructons;
