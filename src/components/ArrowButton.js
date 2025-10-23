// src/components/ArrowButton.js

import React from 'react';
import styles from './ArrowButton.module.css'; // We'll create this CSS file next

// 1. Import your SVG file as a React Component
//    IMPORTANT: Make sure this path is correct for your project structure.
import { ReactComponent as ArrowIcon } from '../assets/页面剩余素材/Page345按钮.svg'; 

/**
 * A reusable arrow button component.
 * @param {object} props
 * @param {function} props.onClick - The function to call when the button is clicked.
 * @param {boolean} props.disabled - Whether the button should be disabled.
 */
function ArrowButton({ onClick, disabled }) {
  // 2. Combine CSS classes based on the disabled state
  const buttonClasses = `${styles.arrowContainer} ${disabled ? styles.disabled : ''}`;

  return (
    <div 
      className={buttonClasses} 
      // 3. Only attach the onClick handler if the button is NOT disabled
      onClick={!disabled ? onClick : null}
    >
      {/* 4. Render the imported SVG icon component */}
      <ArrowIcon className={styles.arrowIcon} />
    </div>
  );
}

export default ArrowButton;