import React from 'react';
import { useSummary } from '../contexts/SummaryContext';
import { useForm } from '../contexts/FormContext';
import styles from './styles/SummaryOverlay.module.css'; // We'll create this CSS file
import backgroundSvg from '../assets/Page16页面.svg';
import closeIcon from '../assets/close_icon.svg';

const SummaryOverlay = () => {
  const { isSummaryOpen, closeSummary } = useSummary();
  const { formData } = useForm(); // Get the collected data

  if (!isSummaryOpen) {
    return null; // Don't render anything if it's not open
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.scrollableContainer}>
        <div 
          className={styles.contentWrapper} 
          style={{ backgroundImage: `url(${backgroundSvg})` }}
        >
          <button onClick={closeSummary} className={styles.closeButton}>
            <img src={closeIcon} alt="Close" />
          </button>

          {/* Design Target Section */}
          <div className={`${styles.section} ${styles.designTargetSection}`}>
            <h2>Design Target</h2>
            <p>...</p> {/* Your description text */}
            <div className={styles.inputGroup}>
              <label>User</label>
              {/* Use data from formData, provide fallback text */}
              <input type="text" readOnly value={formData.targetUser || '...'} />
            </div>
             {/* Render all other sections similarly, pulling data from formData */}
          </div>
          
          {/* User Section */}
          <div className={`${styles.section} ${styles.userSection}`}>
            <h2>User</h2>
            <p>...</p>
            {/* Display user card based on formData.user */}
          </div>

           {/* ... Other sections: Scenario, Mechanism, etc. ... */}

        </div>
      </div>
    </div>
  );
};

export default SummaryOverlay;